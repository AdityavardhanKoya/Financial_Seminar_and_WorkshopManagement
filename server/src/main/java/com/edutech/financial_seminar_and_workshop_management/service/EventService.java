package com.edutech.financial_seminar_and_workshop_management.service;

import com.edutech.financial_seminar_and_workshop_management.entity.Enrollment;
import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.repository.EnrollmentRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.EventRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EventService {

    @Autowired private EventRepository eventRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private EmailNotificationService emailNotificationService;

    // ✅ Runs every minute: if schedule time passed, mark COMPLETED
    @Scheduled(cron = "0 * * * * *") // every minute at second 0
    public void autoCompleteExpiredEvents() {

        ZoneId zone = ZoneId.of("Asia/Kolkata");
        LocalDateTime now = LocalDateTime.now(zone);

        DateTimeFormatter iso = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        List<Event> candidates = eventRepository.findAll().stream()
                .filter(e -> e.getStatus() != null && !"COMPLETED".equalsIgnoreCase(e.getStatus()))
                .filter(e -> e.getSchedule() != null && !e.getSchedule().trim().isEmpty())
                .toList();

        for (Event event : candidates) {
            try {
                LocalDateTime eventTime = LocalDateTime.parse(event.getSchedule().trim(), iso);

                // ✅ if now >= eventTime → COMPLETED
                if (!now.isBefore(eventTime)) {
                    event.setStatus("COMPLETED");
                    eventRepository.save(event);
                }
            } catch (Exception ex) {
                System.err.println("Schedule parse failed for eventId=" + event.getId()
                        + " schedule='" + event.getSchedule() + "' err=" + ex.getMessage());
            }
        }
    }

    private void refreshEnrollmentCount(Event e) {
        int count = (int) enrollmentRepository.countByEvent_Id(e.getId());
        e.setEnrollmentCount(count);
        eventRepository.save(e);
    }

    private void expireIfNeeded(Event e, Long professionalId) {
        String cur = e.getProfessionalStatus().get(professionalId);
        if (!"PENDING".equals(cur)) return;

        Long assignedAt = e.getProfessionalAssignedAt().get(professionalId);
        if (assignedAt == null) return;

        long oneDayMs = 24L * 60 * 60 * 1000;
        if (System.currentTimeMillis() - assignedAt > oneDayMs) {
            e.getProfessionalStatus().put(professionalId, "EXPIRED");
            eventRepository.save(e);

            User inst = userRepository.findById(e.getInstitutionId()).orElse(null);
            User prof = userRepository.findById(professionalId).orElse(null);
            if (inst != null && prof != null) {
                try {
                    emailNotificationService.mailInstitutionAssignmentResponse(inst, prof, e, "EXPIRED");
                } catch (Exception ex) {
                    System.err.println("Failed to send expiry email: " + ex.getMessage());
                }
            }
        }
    }

    // ✅ ISO validation: schedule must be future, format must be 2026-03-06T09:54
    private void validateFutureSchedule(String schedule) {
        if (schedule == null || schedule.trim().isEmpty()) {
            throw new RuntimeException("Schedule is required");
        }

        try {
            ZoneId zone = ZoneId.of("Asia/Kolkata");
            LocalDateTime now = LocalDateTime.now(zone);

            LocalDateTime eventDateTime =
                    LocalDateTime.parse(schedule.trim(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            if (eventDateTime.isBefore(now)) {
                throw new RuntimeException("Event schedule cannot be in the past");
            }
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format. Expected ISO like 2026-03-06T09:54");
        }
    }

    // ---------- CRUD ----------
    public Event createEvent(Event event) {
        validateFutureSchedule(event.getSchedule());
        event.setEnrollmentCount(0);
        event.setStatus("PENDING"); // ✅ Institution creates as PENDING
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Long institutionId, Event updated) {
        validateFutureSchedule(updated.getSchedule());

        Event e = getOrThrow(id);
        if (!e.getInstitutionId().equals(institutionId)) {
            throw new RuntimeException("Not your event");
        }

        e.setTitle(updated.getTitle());
        e.setDescription(updated.getDescription());
        e.setSchedule(updated.getSchedule());
        e.setLocation(updated.getLocation());
        e.setMaxEnrollment(updated.getMaxEnrollment());

        // ✅ Do NOT allow institution to manually set status here
        return eventRepository.save(e);
    }

    public void deleteEvent(Long id, Long institutionId) {
        Event e = getOrThrow(id);
        if (!e.getInstitutionId().equals(institutionId)) {
            throw new RuntimeException("Not your event");
        }
        eventRepository.deleteById(id);
    }

    // ---------- Views ----------
    public List<Event> getAllEvents() {
        List<Event> all = eventRepository.findAll();
        all.forEach(this::refreshEnrollmentCount);
        return all;
    }

    public List<Event> getEventsByInstitution(Long institutionId) {
        List<Event> list = eventRepository.findByInstitutionId(institutionId);
        list.forEach(this::refreshEnrollmentCount);
        return list;
    }

    public List<Event> getEventsByProfessional(Long userId) {
        List<Event> list = eventRepository.findByProfessionalsId(userId);
        list.forEach(e -> {
            refreshEnrollmentCount(e);
            expireIfNeeded(e, userId);
        });
        return list;
    }

    public Event getEventById(Long id) {
        Event e = getOrThrow(id);
        refreshEnrollmentCount(e);
        return e;
    }

    private Event getOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }

    public Event assignProfessional(Long eventId, Long professionalId, String institutionUsername) throws IllegalAccessException {
        Event event = getOrThrow(eventId);

        User institution = userRepository.findByUsername(institutionUsername);
        if (institution == null) throw new RuntimeException("Institution user not found from token");

        if (!"INSTITUTION".equals(institution.getRole())) {
            throw new IllegalAccessException("Only INSTITUTION can assign professionals");
        }

        if (event.getInstitutionId() == null || !event.getInstitutionId().equals(institution.getId())) {
            throw new IllegalAccessException("Not your event");
        }

        User prof = userRepository.findById(professionalId)
                .orElseThrow(() -> new RuntimeException("Professional not found"));

        if (!"PROFESSIONAL".equals(prof.getRole())) {
            throw new RuntimeException("Only PROFESSIONAL can be assigned");
        }

        if (event.getProfessionals().stream().noneMatch(u -> u.getId().equals(professionalId))) {
            event.getProfessionals().add(prof);
        }

        event.getProfessionalStatus().put(professionalId, "PENDING");
        event.getProfessionalAssignedAt().put(professionalId, System.currentTimeMillis());

        Event saved = eventRepository.save(event);

        try {
            emailNotificationService.mailProfessionalAssigned(prof, institution, saved);
        } catch (Exception ignored) {}

        return saved;
    }

    public Event respondToAssignment(Long eventId, Long professionalId, String status) {
        Event event = getOrThrow(eventId);

        if (!event.getProfessionalStatus().containsKey(professionalId)) {
            throw new RuntimeException("Not assigned to this event");
        }

        expireIfNeeded(event, professionalId);

        String current = event.getProfessionalStatus().get(professionalId);
        if (!"PENDING".equals(current)) {
            throw new RuntimeException("Already responded or expired. Current status: " + current);
        }

        if (!("ACCEPTED".equals(status) || "REJECTED".equals(status))) {
            throw new RuntimeException("Invalid response");
        }

        event.getProfessionalStatus().put(professionalId, status);

        // ✅ If Professional accepts, set status to UPCOMING
        if ("ACCEPTED".equals(status)) {
            event.setStatus("UPCOMING");
        }

        Event saved = eventRepository.save(event);

        User inst = userRepository.findById(saved.getInstitutionId()).orElse(null);
        User prof = userRepository.findById(professionalId).orElse(null);
        if (inst != null && prof != null) {
            try {
                emailNotificationService.mailInstitutionAssignmentResponse(inst, prof, saved, status);
            } catch (Exception e) {
                System.err.println("Failed to send assignment response email: " + e.getMessage());
            }
        }

        return saved;
    }

    // ---------- Enrollment ----------
    public Enrollment enrollParticipant(Long eventId, Long userId) {
        Event event = getOrThrow(eventId);

        User participant = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (enrollmentRepository.existsByEvent_IdAndUser_Id(eventId, userId)) {
            throw new RuntimeException("Already enrolled");
        }

        int count = (int) enrollmentRepository.countByEvent_Id(eventId);
        if (event.getMaxEnrollment() != null && count >= event.getMaxEnrollment()) {
            throw new RuntimeException("capacity reached");
        }

        Enrollment en = new Enrollment();
        en.setEvent(event);
        en.setUser(participant);
        en.setStatus("ENROLLED");

        Enrollment saved = enrollmentRepository.save(en);

        refreshEnrollmentCount(event);

        User inst = userRepository.findById(event.getInstitutionId()).orElse(null);
        List<User> acceptedPros = event.getProfessionals().stream()
                .filter(p -> "ACCEPTED".equals(event.getProfessionalStatus().get(p.getId())))
                .toList();

        if (inst != null) {
            try {
                emailNotificationService.mailParticipantEnrolled(participant, inst, event, acceptedPros);
            } catch (Exception e) {
                System.err.println("Failed to send enrollment email: " + e.getMessage());
            }
        }

        return saved;
    }

    public List<User> getAllProfessionals() {
        return userRepository.findByRole("PROFESSIONAL");
    }
}
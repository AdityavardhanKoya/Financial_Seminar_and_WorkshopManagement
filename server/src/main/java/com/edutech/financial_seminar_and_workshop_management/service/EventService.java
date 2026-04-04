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
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EventService {

    @Autowired private EventRepository eventRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private EmailNotificationService emailNotificationService;

    // Background job that runs every 1 minute to auto-complete expired events
    @Scheduled(fixedRate = 60000)
    public void autoCompleteExpiredEvents() {
        // Check for UPCOMING events
        List<Event> ongoingEvents = eventRepository.findAll().stream()
                .filter(e -> "UPCOMING".equals(e.getStatus())) 
                .toList();

        LocalDateTime now = LocalDateTime.now();

        for (Event event : ongoingEvents) {
            try {
                if (event.getSchedule() != null && !event.getSchedule().isEmpty()) {
                    LocalDateTime eventDateTime = LocalDateTime.parse(event.getSchedule(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    if (now.isAfter(eventDateTime)) {
                        // Auto-complete when time passes
                        event.setStatus("COMPLETED");
                        eventRepository.save(event);
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors for malformed dates
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

    // Validation to prevent creating events in the past
    private void validateFutureSchedule(String schedule) {
        if (schedule == null || schedule.isEmpty()) {
            throw new RuntimeException("Schedule is required");
        }
        try {
            LocalDateTime eventDateTime = LocalDateTime.parse(schedule, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            if (eventDateTime.isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Event schedule cannot be in the past");
            }
        } catch (Exception e) {
            if (e instanceof RuntimeException && e.getMessage().equals("Event schedule cannot be in the past")) {
                throw e; 
            }
            throw new RuntimeException("Invalid date format. Expected yyyy-MM-dd'T'HH:mm");
        }
    }

    // ---------- CRUD ----------
    public Event createEvent(Event event) {
        validateFutureSchedule(event.getSchedule());
        event.setEnrollmentCount(0);
        event.setStatus("PENDING"); 
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
        // Status updates are restricted from this endpoint
        e.setMaxEnrollment(updated.getMaxEnrollment());
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
        if (institution == null) {
            throw new RuntimeException("Institution user not found from token");
        }

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

        if (emailNotificationService != null) {
            try {
                emailNotificationService.mailProfessionalAssigned(prof, institution, saved);
            } catch (Exception ignored) {}
        }

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

        // If Professional accepts, change status to UPCOMING
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
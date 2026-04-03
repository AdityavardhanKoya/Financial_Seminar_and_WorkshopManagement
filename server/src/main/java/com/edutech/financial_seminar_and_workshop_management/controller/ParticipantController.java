package com.edutech.financial_seminar_and_workshop_management.controller;

import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.Enrollment;
import com.edutech.financial_seminar_and_workshop_management.entity.Feedback;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.repository.EnrollmentRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.EventRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.UserRepository;
import com.edutech.financial_seminar_and_workshop_management.service.EventService;
import com.edutech.financial_seminar_and_workshop_management.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired private EventService eventService;
    @Autowired private FeedbackService feedbackService;

    @Autowired private UserRepository userRepo;
    @Autowired private EnrollmentRepository enrollmentRepo;
    @Autowired private EventRepository eventRepo;

    // ✅ single events endpoint
    @GetMapping("/events")
    public ResponseEntity<List<Event>> getParticipantEvents(Authentication auth) {

        User participant = userRepo.findByUsername(auth.getName());
        if (participant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Set<Long> enrolledIds = enrollmentRepo.findByUser_Id(participant.getId())
                .stream()
                .map(en -> en.getEvent().getId())
                .collect(Collectors.toSet());

        List<Event> events = eventRepo.findAllByOrderByIdDesc(); // ✅ recent first

        events.forEach(e -> {
            // Participant sees only ACCEPTED professionals
            if (e.getProfessionals() != null && e.getProfessionalStatus() != null) {
                e.setProfessionals(
                        e.getProfessionals().stream()
                                .filter(p -> "ACCEPTED".equals(e.getProfessionalStatus().get(p.getId())))
                                .collect(Collectors.toList())
                );
            }
            e.setEnrolled(enrolledIds.contains(e.getId())); // ✅ used by UI
        });

        return ResponseEntity.ok(events);
    }

    @PostMapping("/event/{eventId}/enroll")
    public ResponseEntity<Enrollment> enroll(@PathVariable Long eventId,
                                             @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(eventService.enrollParticipant(eventId, userId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("capacity")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @GetMapping("/event/{id}/status")
    public ResponseEntity<Event> getEventStatus(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping("/event/{eventId}/feedback")
    public ResponseEntity<Feedback> provideFeedback(@PathVariable Long eventId,
                                                    @RequestParam Long userId,
                                                    @RequestBody Feedback feedback) {
        return ResponseEntity.ok(feedbackService.addFeedback(eventId, userId, feedback));
    }
}
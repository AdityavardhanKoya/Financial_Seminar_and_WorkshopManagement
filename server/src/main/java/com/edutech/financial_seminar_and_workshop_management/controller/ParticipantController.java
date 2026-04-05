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
import java.util.Map;
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

        List<Event> events = eventRepo.findAllByOrderByIdDesc();

        events.forEach(e -> {
            if (e.getProfessionals() != null && e.getProfessionalStatus() != null) {
                e.setProfessionals(
                        e.getProfessionals().stream()
                                .filter(p -> "ACCEPTED".equals(e.getProfessionalStatus().get(p.getId())))
                                .collect(Collectors.toList())
                );
            }
            e.setEnrolled(enrolledIds.contains(e.getId()));
        });

        return ResponseEntity.ok(events);
    }

  @PostMapping("/event/{eventId}/enroll")
public ResponseEntity<?> enroll(@PathVariable Long eventId, Authentication auth) {

    User participant = userRepo.findByUsername(auth.getName());
    if (participant == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Unauthorized"));
    }

    try {
        return ResponseEntity.ok(eventService.enrollParticipant(eventId, participant.getId()));
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

    // ✅ Feedback submit (JWT-based, NO userId param)
    @PostMapping("/event/{eventId}/feedback")
    public ResponseEntity<?> provideFeedback(@PathVariable Long eventId,
                                             @RequestBody Feedback feedback,
                                             Authentication auth) {
        try {
            User participant = userRepo.findByUsername(auth.getName());
            if (participant == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Unauthorized"));
            }

            boolean enrolled = enrollmentRepo.existsByEvent_IdAndUser_Id(eventId, participant.getId());
            if (!enrolled) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You must enroll to give feedback"));
            }

            Feedback saved = feedbackService.addFeedback(eventId, participant.getId(), feedback);
            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("already")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Feedback submitted already"));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error while saving feedback"));
        }
    }
}
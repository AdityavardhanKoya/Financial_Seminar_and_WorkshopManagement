package com.edutech.financial_seminar_and_workshop_management.controller;
import com.edutech.financial_seminar_and_workshop_management.repository.UserRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.EnrollmentRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.EventRepository;
import com.edutech.financial_seminar_and_workshop_management.entity.*;
import com.edutech.financial_seminar_and_workshop_management.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import org.springframework.security.core.Authentication;

import java.util.Set;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired private EventService eventService;
    @Autowired private FeedbackService feedbackService;
@Autowired
private UserRepository userRepo;

@Autowired
private EnrollmentRepository enrollmentRepo;

@Autowired
private EventRepository eventRepo;
    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();

        // Participant should see ONLY ACCEPTED professionals
        events.forEach(e -> e.setProfessionals(
            e.getProfessionals().stream()
             .filter(p -> "ACCEPTED".equals(e.getProfessionalStatus().get(p.getId())))
             .toList()
        ));

        return ResponseEntity.ok(events);
    }

    @PostMapping("/event/{eventId}/enroll")
    public ResponseEntity<Enrollment> enroll(@PathVariable Long eventId,
                                             @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(eventService.enrollParticipant(eventId, userId));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("capacity")) {
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
    @GetMapping("/events")
public List<Event> getParticipantEvents(Authentication auth) {

    User participant = userRepo.findByUsername(auth.getName());

    Set<Long> enrolledEventIds = enrollmentRepo
            .findByParticipantId(participant.getId())
            .stream()
            .map(e -> e.getEvent().getId())
            .collect(Collectors.toSet());

    List<Event> events = eventRepo.findAllByOrderByCreatedAtDesc();

    events.forEach(e -> {
        e.setEnrolled(enrolledEventIds.contains(e.getId()));
    });

    return events;
}
}
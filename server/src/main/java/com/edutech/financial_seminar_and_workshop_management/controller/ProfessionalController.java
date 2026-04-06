package com.edutech.financial_seminar_and_workshop_management.controller;

import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.Feedback;
import com.edutech.financial_seminar_and_workshop_management.service.EventService;
import com.edutech.financial_seminar_and_workshop_management.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/professional")
public class ProfessionalController {

    @Autowired private EventService eventService;
    @Autowired private FeedbackService feedbackService;

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAssignedEvents(@RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getEventsByProfessional(userId));
    }

    @PutMapping("/event/{eventId}/assignment")
    public ResponseEntity<Event> respondToAssignment(@PathVariable Long eventId,
                                                     @RequestParam Long userId,
                                                     @RequestParam String status) {
        try {
            return ResponseEntity.ok(eventService.respondToAssignment(eventId, userId, status));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/event/{eventId}/feedback")
    public ResponseEntity<?> provideFeedback(@PathVariable Long eventId,
                                             @RequestParam Long userId,
                                             @RequestBody Feedback feedback) {
        try {
            Feedback saved = feedbackService.addFeedback(eventId, userId, feedback);
            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("already")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Feedback given already"));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
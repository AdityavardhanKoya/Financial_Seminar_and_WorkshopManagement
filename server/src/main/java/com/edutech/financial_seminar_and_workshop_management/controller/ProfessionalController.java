package com.edutech.financial_seminar_and_workshop_management.controller;

import com.edutech.financial_seminar_and_workshop_management.entity.*;
import com.edutech.financial_seminar_and_workshop_management.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/professional")
public class ProfessionalController {

    @Autowired private EventService eventService;
    @Autowired private FeedbackService feedbackService;

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAssignedEvents(@RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getEventsByProfessional(userId));
    }

    @PutMapping("/event/{id}/status")
    public ResponseEntity<Event> updateStatus(@PathVariable Long id,
                                              @RequestParam Long userId,
                                              @RequestParam String status) {
        try {
            return ResponseEntity.ok(eventService.updateEventStatusByProfessional(id, userId, status));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
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
    public ResponseEntity<Feedback> provideFeedback(@PathVariable Long eventId,
                                                    @RequestParam Long userId,
                                                    @RequestBody Feedback feedback) {
        return ResponseEntity.ok(feedbackService.addFeedback(eventId, userId, feedback));
    }
}
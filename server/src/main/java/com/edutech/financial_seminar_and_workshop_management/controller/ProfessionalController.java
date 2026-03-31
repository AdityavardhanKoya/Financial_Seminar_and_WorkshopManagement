package com.edutech.financial_seminar_and_workshop_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.Feedback;
import com.edutech.financial_seminar_and_workshop_management.service.EventService;
import com.edutech.financial_seminar_and_workshop_management.service.FeedbackService;
import java.util.List;

@RestController
@RequestMapping("/api/professional")
public class ProfessionalController {

    @Autowired
    private EventService eventService;

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAssignedEvents(@RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getEventsByProfessional(userId));
    }

    @PutMapping("/event/{id}/status")
    public ResponseEntity<Event> updateStatus(@PathVariable Long id,
                                               @RequestParam String status) {
        return ResponseEntity.ok(eventService.updateEventStatus(id, status));
    }

    @PostMapping("/event/{eventId}/feedback")
    public ResponseEntity<Feedback> provideFeedback(@PathVariable Long eventId,
                                                     @RequestParam Long userId,
                                                     @RequestBody Feedback feedback) {
        return ResponseEntity.ok(feedbackService.addFeedback(eventId, userId, feedback));
    }
}
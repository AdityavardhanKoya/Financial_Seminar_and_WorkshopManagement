package com.edutech.financial_seminar_and_workshop_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.financial_seminar_and_workshop_management.entity.Enrollment;
import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.Feedback;
import com.edutech.financial_seminar_and_workshop_management.service.EnrollmentService;
import com.edutech.financial_seminar_and_workshop_management.service.EventService;
import com.edutech.financial_seminar_and_workshop_management.service.FeedbackService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired
    private EventService eventService;

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping("/event/{eventId}/enroll")
    public ResponseEntity<Enrollment> enroll(@PathVariable Long eventId,
                                              @RequestParam Long userId) {
        return ResponseEntity.ok(enrollmentService.enrollParticipant(eventId, userId));
    }

    // Returns full Event object so $.title, $.status etc. are all accessible
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
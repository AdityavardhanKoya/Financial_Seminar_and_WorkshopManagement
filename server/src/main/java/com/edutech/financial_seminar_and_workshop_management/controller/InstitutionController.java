package com.edutech.financial_seminar_and_workshop_management.controller;

import com.edutech.financial_seminar_and_workshop_management.entity.*;
import com.edutech.financial_seminar_and_workshop_management.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
@RestController
@RequestMapping("/api/institution")
public class InstitutionController {

    @Autowired private EventService eventService;
    @Autowired private ResourceService resourceService;
    @Autowired private FeedbackService feedbackService;

    @PostMapping("/event")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/event/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id,
                                             @RequestParam Long institutionId,
                                             @RequestBody Event event) {
        return ResponseEntity.ok(eventService.updateEvent(id, institutionId, event));
    }

    @DeleteMapping("/event/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id,
                                            @RequestParam Long institutionId) {
        eventService.deleteEvent(id, institutionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getMyEvents(@RequestParam Long institutionId) {
        return ResponseEntity.ok(eventService.getEventsByInstitution(institutionId));
    }

  
    @GetMapping("/event/professionals")
    public ResponseEntity<List<User>> getProfessionals() {
        return ResponseEntity.ok(eventService.getAllProfessionals());
    }


    @PostMapping("/event/{eventId}/professional")
    public ResponseEntity<?> assignProfessional(@PathVariable Long eventId,
                                                @RequestParam Long userId,
                                                Authentication auth) {
        try {
            String institutionUsername = auth.getName(); // from JWT
            Event updated = eventService.assignProfessional(eventId, userId, institutionUsername);
            return ResponseEntity.ok(updated);
        } catch (IllegalAccessException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }


    @GetMapping("/event/{eventId}/feedbacks")
    public ResponseEntity<List<Feedback>> getFeedbacks(@PathVariable Long eventId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByEvent(eventId));
    }
}
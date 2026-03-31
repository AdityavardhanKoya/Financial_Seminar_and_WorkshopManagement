package com.edutech.financial_seminar_and_workshop_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.Resource;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.service.EventService;
import com.edutech.financial_seminar_and_workshop_management.service.ResourceService;
import java.util.List;

@RestController
@RequestMapping("/api/institution")
public class InstitutionController {

    @Autowired
    private EventService eventService;

    @Autowired
    private ResourceService resourceService;

    @PostMapping("/event")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/event/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id,
                                              @RequestBody Event event) {
        return ResponseEntity.ok(eventService.updateEvent(id, event));
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents(@RequestParam Long institutionId) {
        return ResponseEntity.ok(eventService.getEventsByInstitution(institutionId));
    }

    @PostMapping("/event/{eventId}/resource")
    public ResponseEntity<Resource> addResource(@PathVariable Long eventId,
                                                 @RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.addResource(eventId, resource));
    }

    @GetMapping("/event/professionals")
    public ResponseEntity<List<User>> getProfessionals() {
        return ResponseEntity.ok(eventService.getAllProfessionals());
    }

    @PostMapping("/event/{eventId}/professional")
    public ResponseEntity<Event> assignProfessional(@PathVariable Long eventId,
                                                     @RequestParam Long userId) {
        return ResponseEntity.ok(eventService.assignProfessional(eventId, userId));
    }
}
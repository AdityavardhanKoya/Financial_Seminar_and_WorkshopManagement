package com.edutech.financial_seminar_and_workshop_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.Resource;
import com.edutech.financial_seminar_and_workshop_management.repository.EventRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.ResourceRepository;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private EventRepository eventRepository;

    public Resource addResource(Long eventId, Resource resource) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));
        resource.setEvent(event);
        return resourceRepository.save(resource);
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + id));
    }
}
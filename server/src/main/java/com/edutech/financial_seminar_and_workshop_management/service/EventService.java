
package com.edutech.financial_seminar_and_workshop_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.repository.EventRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.UserRepository;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event updated) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        event.setTitle(updated.getTitle());
        event.setDescription(updated.getDescription());
        event.setSchedule(updated.getSchedule());
        event.setLocation(updated.getLocation());
        event.setStatus(updated.getStatus());
        event.setInstitutionId(updated.getInstitutionId());
        return eventRepository.save(event);
    }

    public List<Event> getEventsByInstitution(Long institutionId) {
        return eventRepository.findByInstitutionId(institutionId);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getEventsByProfessional(Long userId) {
        return eventRepository.findByProfessionalsId(userId);
    }

    public Event updateEventStatus(Long id, String status) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        event.setStatus(status);
        return eventRepository.save(event);
    }

    public String getEventStatus(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id))
                .getStatus();
    }

    public Event assignProfessional(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        event.getProfessionals().add(user);
        return eventRepository.save(event);
    }

    public List<User> getAllProfessionals() {
        return userRepository.findByRole("PROFESSIONAL");
    }
    public Event getEventById(Long id) {
    return eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found: " + id));
}
}

package com.edutech.financial_seminar_and_workshop_management.service;

import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.Feedback;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.repository.EventRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.FeedbackRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class FeedbackService {

    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private UserRepository userRepository;

    public Feedback addFeedback(Long eventId, Long userId, Feedback feedback) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));

        // ✅ RULE (Option 2): Feedback ONLY after completion
        if (!"COMPLETED".equalsIgnoreCase(event.getStatus())) {
            throw new RuntimeException("Feedback allowed only after event completion");
        }

        // ✅ Validate content
        if (feedback.getContent() == null || feedback.getContent().trim().isEmpty()) {
            throw new RuntimeException("Feedback content cannot be empty");
        }

        // ✅ Only once per user per event
        if (feedbackRepository.existsByEvent_IdAndUser_Id(eventId, userId)) {
            throw new RuntimeException("Feedback submitted already");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        feedback.setEvent(event);
        feedback.setUser(user);

        // ✅ Ensure timestamp always set
        if (feedback.getTimestamp() == null) {
            feedback.setTimestamp(new Date());
        }

        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getFeedbacksByEvent(Long eventId) {
        return feedbackRepository.findByEvent_Id(eventId);
    }
}
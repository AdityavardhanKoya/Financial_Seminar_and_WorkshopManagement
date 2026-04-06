package com.edutech.financial_seminar_and_workshop_management.service;

import com.edutech.financial_seminar_and_workshop_management.entity.Event;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailNotificationService {

    @Autowired
    private JavaMailSender mailSender;

    private void send(String to, String subject, String body) {
        if (to == null || to.trim().isEmpty()) return;
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);
        mailSender.send(msg);
    }

    // ✅ New method for Registration Welcome Email
    public void mailUserRegistrationSuccess(User user) {
        send(
            user.getEmail(),
            "Welcome to Fin Event.",
            "Hello " + user.getUsername() + ",\n\n" +
            "Your registration was successful!\n\n" +
            "You are registered as: " + user.getRole() + "\n" +
            "You can now log in and access the platform.\n\n" +
            "~ Fin Event Platform."
        );
    }

    public void mailProfessionalAssigned(User professional, User institution, Event event) {
        send(
            professional.getEmail(),
            "New Event Assignment: " + event.getTitle(),
            "Hello " + professional.getUsername() + ",\n\n" +
            "You have been assigned to an event.\n\n" +
            "Event: " + event.getTitle() + "\n" +
            "Date/Time: " + event.getSchedule() + "\n" +
            "Location: " + event.getLocation() + "\n\n" +
            "Please ACCEPT/REJECT within 24 hours.\n\n" +
            "Institution: " + institution.getUsername() + " (" + institution.getEmail() + ")\n\n" +
            "~ Fin Event Platform."
        );
    }

    public void mailInstitutionAssignmentResponse(User institution, User professional, Event event, String response) {
        send(
            institution.getEmail(),
            "Assignment " + response + ": " + event.getTitle(),
            "Hello " + institution.getUsername() + ",\n\n" +
            "Professional response received.\n\n" +
            "Event: " + event.getTitle() + "\n" +
            "Date/Time: " + event.getSchedule() + "\n" +
            "Location: " + event.getLocation() + "\n\n" +
            "Professional: " + professional.getUsername() + " (" + professional.getEmail() + ")\n" +
            "Response: " + response + "\n\n" +
            "~ Fin Event Platform."
        );
    }

    public void mailParticipantEnrolled(User participant, User institution, Event event, List<User> acceptedPros) {
        String pros = (acceptedPros == null || acceptedPros.isEmpty())
                ? "Professional: Not assigned yet"
                : "Professional(s):\n" + acceptedPros.stream()
                    .map(p -> "- " + p.getUsername() + " (" + p.getEmail() + ")")
                    .collect(Collectors.joining("\n"));

        send(
            participant.getEmail(),
            "Enrollment Confirmed: " + event.getTitle(),
            "Hello " + participant.getUsername() + ",\n\n" +
            "You have ENROLLED successfully.\n\n" +
            "Event: " + event.getTitle() + "\n" +
            "Date/Time: " + event.getSchedule() + "\n" +
            "Location: " + event.getLocation() + "\n\n" +
            pros + "\n\n" +
            "Institution Contact: " + institution.getUsername() + " (" + institution.getEmail() + ")\n\n" +
            "~ Fin Event Platform."
        );
    }
    public void mailEventCancelled(User recipient, User institution, Event event, String recipientType) {
    send(
        recipient.getEmail(),
        "Event Cancelled: " + event.getTitle(),
        "Hello " + recipient.getUsername() + ",\n\n" +
        "The following event has been CANCELLED by the institution.\n\n" +
        "Event: " + event.getTitle() + "\n" +
        "Date/Time: " + (event.getSchedule() != null ? event.getSchedule() : "-") + "\n" +
        "Location: " + (event.getLocation() != null ? event.getLocation() : "-") + "\n\n" +
        "You are receiving this email as a " + recipientType + ".\n\n" +
        "Institution Contact: " + institution.getUsername() + " (" + institution.getEmail() + ")\n\n" +
        "~ Fin Event Platform."
    );
}
}
package com.edutech.financial_seminar_and_workshop_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private String status;

    public Enrollment() {}

    public Enrollment(Long id, User user, Event event, String status) {
        this.id = id;
        this.user = user;
        this.event = event;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
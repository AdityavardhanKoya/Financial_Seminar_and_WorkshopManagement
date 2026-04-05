package com.edutech.financial_seminar_and_workshop_management.entity;

import javax.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String description;
    private String availabilityStatus;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    public Resource() {}

    public Resource(Long id, String type, String description, String availabilityStatus, Event event) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.availabilityStatus = availabilityStatus;
        this.event = event;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
}

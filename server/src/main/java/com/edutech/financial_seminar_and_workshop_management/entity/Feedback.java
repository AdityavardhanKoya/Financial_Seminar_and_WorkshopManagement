package com.edutech.financial_seminar_and_workshop_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "timestamp")
    private Date timestamp;

    public Feedback() {}

    public Feedback(Long id, Event event, User user, String content, Date timestamp) {
        this.id = id;
        this.event = event;
        this.user = user;
        this.content = content;
        this.timestamp = timestamp;
    }

    public Long getId() { 
        return id; 
    }

    public void setId(Long id) { 
        this.id = id; 
    }

    public Event getEvent() { 
        return event; 
    }

    public void setEvent(Event event) { 
        this.event = event; 
    }

    public User getUser() { 
        return user; 
    }

    public void setUser(User user) { 
        this.user = user; 
    }

    public String getContent() { 
        return content; 
    }

    public void setContent(String content) { 
        this.content = content; 
    }

    public Date getTimestamp() { 
        return timestamp; 
    }

    public void setTimestamp(Date timestamp) { 
        this.timestamp = timestamp;
    }
}
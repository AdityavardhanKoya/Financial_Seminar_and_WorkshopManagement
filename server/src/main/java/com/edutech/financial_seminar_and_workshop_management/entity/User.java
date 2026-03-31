package com.edutech.financial_seminar_and_workshop_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.util.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String email;
    private String role;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Enrollment> enrollments = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Feedback> feedbacks = new HashSet<>();

    @JsonIgnore
    @ManyToMany(mappedBy = "professionals")
    private List<Event> events = new ArrayList<>();

    public User() {}

    public User(Long id, String username, String password, String email, String role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }

    public Long getId() { 
        return id; 
    }

    public void setId(Long id) { 
        this.id = id; 
    }

    public String getUsername() { 
        return username; 
    }

    public void setUsername(String username) { 
        this.username = username; 
    }

    public String getPassword() { 
        return password; 
    }

    public void setPassword(String password) { 
        this.password = password; 
    }

    public String getEmail() { 
        return email; 
    }

    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getRole() { 
        return role; 
    }

    public void setRole(String role) { 
        this.role = role; 
    }

    public Set<Enrollment> getEnrollments() { 
        return enrollments; 
    }

    public void setEnrollments(Set<Enrollment> enrollments) { 
        this.enrollments = enrollments; 
    }

    public Set<Feedback> getFeedbacks() { 
        return feedbacks; 
    }

    public void setFeedbacks(Set<Feedback> feedbacks) { 
        this.feedbacks = feedbacks; 
    }

    public List<Event> getEvents() { 
        return events; 
    }

    public void setEvents(List<Event> events) { 
        this.events = events; 
    }
}
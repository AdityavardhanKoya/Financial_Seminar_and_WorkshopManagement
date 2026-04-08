package com.edutech.financial_seminar_and_workshop_management.entity;
 import javax.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;
import java.util.*;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long institutionId;
    private String title;
    private String description;
    private String schedule;
    private String location;
    private String status;
    private Integer maxEnrollment;
    private Integer enrollmentCount = 0;
    @Transient
   private boolean enrolled;

    @JsonIgnore
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Resource> resources = new ArrayList<>();


    @ManyToMany
    @JoinTable(
        name = "event_professionals",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnoreProperties({"password","enrollments","feedbacks","events","hibernateLazyInitializer"})
    private List<User> professionals = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Enrollment> enrollments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Feedback> feedbacks = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "event_professional_status",
        joinColumns = @JoinColumn(name = "event_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "status")
    private Map<Long, String> professionalStatus = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "event_professional_assigned_at",
        joinColumns = @JoinColumn(name = "event_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "assigned_at")
    private Map<Long, Long> professionalAssignedAt = new HashMap<>();

    public Event() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long i) { this.institutionId = i; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public String getSchedule() { return schedule; }
    public void setSchedule(String s) { this.schedule = s; }
    public String getLocation() { return location; }
    public void setLocation(String l) { this.location = l; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public Integer getMaxEnrollment() { return maxEnrollment; }
    public void setMaxEnrollment(Integer m) { this.maxEnrollment = m; }
    public Integer getEnrollmentCount() { return enrollmentCount; }
    public void setEnrollmentCount(Integer e) { this.enrollmentCount = e; }
    public List<Resource> getResources() { return resources; }
    public void setResources(List<Resource> r) { this.resources = r; }
    public List<User> getProfessionals() { return professionals; }
    public void setProfessionals(List<User> p) { this.professionals = p; }
    public List<Enrollment> getEnrollments() { return enrollments; }
    public void setEnrollments(List<Enrollment> e) { this.enrollments = e; }
    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> f) { this.feedbacks = f; }
    public Map<Long, String> getProfessionalStatus() { return professionalStatus; }
    public void setProfessionalStatus(Map<Long, String> m) { this.professionalStatus = m; }
    public Map<Long, Long> getProfessionalAssignedAt() { return professionalAssignedAt; }
    public void setProfessionalAssignedAt(Map<Long, Long> m) { this.professionalAssignedAt = m; }
    public boolean isEnrolled() {
    return enrolled;
}

public void setEnrolled(boolean enrolled) {
    this.enrolled = enrolled;
}
}
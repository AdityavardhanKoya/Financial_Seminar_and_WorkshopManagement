package com.edutech.financial_seminar_and_workshop_management.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "password_reset_otp")
public class PasswordResetOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String email;

    @Column(nullable=false)
    private String otpHash;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable=false)
    private Date expiry;

    @Column(nullable=false)
    private int attempts = 0;

    public PasswordResetOtp() {}

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getOtpHash() { return otpHash; }
    public Date getExpiry() { return expiry; }
    public int getAttempts() { return attempts; }

    public void setEmail(String email) { this.email = email; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    public void setExpiry(Date expiry) { this.expiry = expiry; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
}
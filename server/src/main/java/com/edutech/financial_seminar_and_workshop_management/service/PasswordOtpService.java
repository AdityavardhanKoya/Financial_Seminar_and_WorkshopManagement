package com.edutech.financial_seminar_and_workshop_management.service;

import com.edutech.financial_seminar_and_workshop_management.entity.PasswordResetOtp;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.repository.PasswordResetOtpRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Date;

@Service
public class PasswordOtpService {

    @Autowired private UserRepository userRepo;
    @Autowired private PasswordResetOtpRepository otpRepo;
    @Autowired private JavaMailSender mailSender;
    @Autowired private PasswordEncoder encoder;

    private final SecureRandom random = new SecureRandom();

    public void sendOtp(String email) {

        // ✅ FIXED: Using .orElse(null) because findByEmail returns Optional<User>
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            return; // don't reveal if email exists
        }

        // Delete any existing OTPs for this email before generating a new one
        otpRepo.deleteByEmail(email);

        String otp = generateOtp();

        PasswordResetOtp pr = new PasswordResetOtp();
        pr.setEmail(email);
        pr.setOtpHash(encoder.encode(otp));
        pr.setExpiry(new Date(System.currentTimeMillis() + 5 * 60 * 1000)); // 5 mins
        pr.setAttempts(0);

        otpRepo.save(pr);

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("FinEvent - Password Reset OTP");
            msg.setText("Your OTP for password reset is: " + otp + "\n\nValid for 5 minutes.");
            mailSender.send(msg);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email. Check mail config.");
        }
    }

    public void resetPassword(String email, String otp, String newPassword) {

        // ✅ FIXED: Using .orElse(null) because findByEmail returns Optional<User>
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            throw new RuntimeException("Invalid email");
        }

        PasswordResetOtp pr = otpRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request again."));

        if (pr.getExpiry().before(new Date())) {
            otpRepo.deleteByEmail(email);
            throw new RuntimeException("OTP expired. Please request again.");
        }

        if (pr.getAttempts() >= 3) {
            otpRepo.deleteByEmail(email);
            throw new RuntimeException("Too many wrong attempts. Request new OTP.");
        }

        if (!encoder.matches(otp, pr.getOtpHash())) {
            pr.setAttempts(pr.getAttempts() + 1);
            otpRepo.save(pr);
            throw new RuntimeException("Invalid OTP");
        }

        user.setPassword(encoder.encode(newPassword));
        userRepo.save(user);

        otpRepo.deleteByEmail(email);
    }

    private String generateOtp() {
        int otp = 100000 + random.nextInt(900000); // 6 digits
        return String.valueOf(otp);
    }
}
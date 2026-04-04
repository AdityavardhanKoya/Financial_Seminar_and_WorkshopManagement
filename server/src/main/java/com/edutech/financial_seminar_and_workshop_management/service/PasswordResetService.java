package com.edutech.financial_seminar_and_workshop_management.service;

import com.edutech.financial_seminar_and_workshop_management.entity.PasswordResetToken;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.repository.PasswordResetTokenRepository;
import com.edutech.financial_seminar_and_workshop_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired 
    private UserRepository userRepo;
    
    @Autowired 
    private PasswordResetTokenRepository tokenRepo;
    
    @Autowired 
    private JavaMailSender mailSender;
    
    @Autowired 
    private PasswordEncoder encoder;

    public void sendResetLink(String email) {

        // Assuming you have findByEmail in UserRepository
     User user = userRepo.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Invalid email"));
        // remove old tokens
        tokenRepo.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = new PasswordResetToken();
        prt.setUser(user);
        prt.setToken(token);
        prt.setExpiryDate(new Date(System.currentTimeMillis() + 15 * 60 * 1000)); // 15 mins

        tokenRepo.save(prt);

        String link = "http://localhost:4200/reset-password?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(user.getEmail());
        msg.setSubject("Reset Password - FinEvent");
        msg.setText(
            "Click below link to reset your password (valid for 15 minutes):\n\n" + link
        );
        mailSender.send(msg);
    }

    public void resetPassword(String token, String newPassword) {

        PasswordResetToken prt = tokenRepo.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (prt.getExpiryDate().before(new Date()))
            throw new RuntimeException("Token expired");

        User user = prt.getUser();
        user.setPassword(encoder.encode(newPassword));
        userRepo.save(user);

        tokenRepo.delete(prt);
    }
}
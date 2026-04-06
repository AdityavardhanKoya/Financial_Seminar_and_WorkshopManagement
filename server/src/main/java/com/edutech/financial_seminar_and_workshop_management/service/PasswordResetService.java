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
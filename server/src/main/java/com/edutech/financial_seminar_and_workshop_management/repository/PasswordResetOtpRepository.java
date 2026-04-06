package com.edutech.financial_seminar_and_workshop_management.repository;

import com.edutech.financial_seminar_and_workshop_management.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    Optional<PasswordResetOtp> findByEmail(String email);
    
    @Transactional // ✅ Fixes the "No EntityManager with actual transaction" error
    void deleteByEmail(String email);
}
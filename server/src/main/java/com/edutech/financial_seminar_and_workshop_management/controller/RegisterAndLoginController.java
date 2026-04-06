package com.edutech.financial_seminar_and_workshop_management.controller;
import com.edutech.financial_seminar_and_workshop_management.service.PasswordOtpService;
import com.edutech.financial_seminar_and_workshop_management.dto.ForgotPasswordOtpRequest;
import com.edutech.financial_seminar_and_workshop_management.dto.ResetPasswordOtpRequest;

import com.edutech.financial_seminar_and_workshop_management.dto.LoginRequest;
import com.edutech.financial_seminar_and_workshop_management.dto.LoginResponse;
import com.edutech.financial_seminar_and_workshop_management.dto.ResetPasswordRequest;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.service.PasswordResetService;
import com.edutech.financial_seminar_and_workshop_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    // ✅ Fix: Inject the PasswordResetService
    @Autowired
    private PasswordResetService passwordResetService;
    @Autowired 
    private PasswordOtpService otpService;
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = userService.loginUser(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }



    // ✅ Fix: Use the correct DTOs and handle the reset password logic
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getToken() == null || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid token or password."));
        }

        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password successfully updated."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

@PostMapping("/forgot-password-otp")
public ResponseEntity<?> forgotPasswordOtp(@RequestBody ForgotPasswordOtpRequest req) {
    try {
        otpService.sendOtp(req.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP sent if email exists"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "OTP send failed: " + e.getMessage()));
    }
}

@PostMapping("/reset-password-otp")
public ResponseEntity<?> resetPasswordOtp(@RequestBody ResetPasswordOtpRequest req) {
    try {
        otpService.resetPassword(req.getEmail(), req.getOtp(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
    }
}
}
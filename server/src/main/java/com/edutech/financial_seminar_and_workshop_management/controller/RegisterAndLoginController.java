 package com.edutech.financial_seminar_and_workshop_management.controller;

 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.http.HttpStatus;
 import org.springframework.http.ResponseEntity;
 import org.springframework.security.core.AuthenticationException;
 import org.springframework.web.bind.annotation.*;
 import org.springframework.web.server.ResponseStatusException;
 import com.edutech.financial_seminar_and_workshop_management.dto.LoginRequest;
 import com.edutech.financial_seminar_and_workshop_management.dto.LoginResponse;
 import com.edutech.financial_seminar_and_workshop_management.entity.User;
 import com.edutech.financial_seminar_and_workshop_management.service.UserService;

 @RestController
 @RequestMapping("/api/user")
 public class RegisterAndLoginController {

     @Autowired
     private UserService userService;

     @PostMapping("/register")
     public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerUser(user));
     }

     @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    try {
        LoginResponse response = userService.loginUser(
            loginRequest.getUsername(),
            loginRequest.getPassword()
        );
        return ResponseEntity.ok(response);
    } catch (AuthenticationException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid credentials");
    } catch (Exception e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }
}
 }
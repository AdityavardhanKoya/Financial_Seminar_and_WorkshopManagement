package com.edutech.financial_seminar_and_workshop_management.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.financial_seminar_and_workshop_management.dto.LoginRequest;
import com.edutech.financial_seminar_and_workshop_management.dto.LoginResponse;
import com.edutech.financial_seminar_and_workshop_management.entity.User;
import com.edutech.financial_seminar_and_workshop_management.jwt.JwtUtil;
import com.edutech.financial_seminar_and_workshop_management.service.UserService;


public class RegisterAndLoginController {

    
}

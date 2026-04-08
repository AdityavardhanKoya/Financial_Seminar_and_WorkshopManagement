package com.edutech.financial_seminar_and_workshop_management.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
public class LoginResponse {

    private String token;
    private String username;
    private String role;
    private Long id;  

    public LoginResponse() {}

    public LoginResponse(String token, String username, String role, Long id) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.id = id;   
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public Long getId() { return id; }   
    public void setToken(String token) { this.token = token; }
    public void setUsername(String username) { this.username = username; }
    public void setRole(String role) { this.role = role; }
    public void setId(Long id) { this.id = id; }  }
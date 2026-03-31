package com.edutech.financial_seminar_and_workshop_management.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {

    private String token;
    private String username;
    private String role;

    // ─── Default constructor (required by Jackson) ─────────────────────────────
    public LoginResponse() {}

    // ─── All-args constructor with @JsonCreator ────────────────────────────────
    @JsonCreator
    public LoginResponse(
            @JsonProperty("token") String token,
            @JsonProperty("username") String username,
            @JsonProperty("role") String role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }

    // ─── Getters ───────────────────────────────────────────────────────────────
    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getRole() { return role; }

    // ─── Setters ───────────────────────────────────────────────────────────────
    public void setToken(String token) { this.token = token; }
    public void setUsername(String username) { this.username = username; }
    public void setRole(String role) { this.role = role; }

    // ─── toString ──────────────────────────────────────────────────────────────
    @Override
    public String toString() {
        return "LoginResponse{" +
                "token='" + token + '\'' +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
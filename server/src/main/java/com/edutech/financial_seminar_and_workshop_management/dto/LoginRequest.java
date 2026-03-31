package com.edutech.financial_seminar_and_workshop_management.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {

    private String username;
    private String password;

    // ─── Default constructor (required by Jackson) ─────────────────────────────
    public LoginRequest() {}

    // ─── All-args constructor with @JsonCreator ────────────────────────────────
    @JsonCreator
    public LoginRequest(
            @JsonProperty("username") String username,
            @JsonProperty("password") String password) {
        this.username = username;
        this.password = password;
    }

    // ─── Getters ───────────────────────────────────────────────────────────────
    public String getUsername() { return username; }
    public String getPassword() { return password; }

    // ─── Setters ───────────────────────────────────────────────────────────────
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }

    // ─── toString (useful for debugging — never log password in production) ────
    @Override
    public String toString() {
        return "LoginRequest{username='" + username + "'}";
    }
}
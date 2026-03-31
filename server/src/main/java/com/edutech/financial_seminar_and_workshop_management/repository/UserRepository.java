package com.edutech.financial_seminar_and_workshop_management.repository;

import com.edutech.financial_seminar_and_workshop_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    List<User> findByRole(String role);
}
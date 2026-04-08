package com.edutech.financial_seminar_and_workshop_management.repository;

import com.edutech.financial_seminar_and_workshop_management.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByEvent_IdAndUser_Id(Long eventId, Long userId);
    long countByEvent_Id(Long eventId);
    List<Enrollment> findByUser_Id(Long userId);
}
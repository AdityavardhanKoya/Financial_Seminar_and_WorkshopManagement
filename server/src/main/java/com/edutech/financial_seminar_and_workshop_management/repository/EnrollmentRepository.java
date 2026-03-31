
package com.edutech.financial_seminar_and_workshop_management.repository;

import com.edutech.financial_seminar_and_workshop_management.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
}

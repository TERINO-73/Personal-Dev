package com.jesusterino.app.repository;

import com.jesusterino.app.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByUserUsernameAndDate(String username, LocalDate date);
    List<WorkoutSession> findByUserUsernameAndFinishedAtIsNotNullAndDate(String username, LocalDate date);
}

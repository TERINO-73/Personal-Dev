package com.jesusterino.app.repository;

import com.jesusterino.app.model.RoutineAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineAssignmentRepository extends JpaRepository<RoutineAssignment, Long> {
    List<RoutineAssignment> findByUserUsernameAndDate(String username, LocalDate date);
    Optional<RoutineAssignment> findByUserUsernameAndRoutineIdAndDate(String username, Long routineId, LocalDate date);
}

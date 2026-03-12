package com.jesusterino.app.repository;

import com.jesusterino.app.model.DailyWorkoutSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyWorkoutSnapshotRepository extends JpaRepository<DailyWorkoutSnapshot, Long> {
    Optional<DailyWorkoutSnapshot> findByUserUsernameAndDate(String username, LocalDate date);
    List<DailyWorkoutSnapshot> findByUserUsernameAndDateBetween(String username, LocalDate fromDate, LocalDate toDate);
}

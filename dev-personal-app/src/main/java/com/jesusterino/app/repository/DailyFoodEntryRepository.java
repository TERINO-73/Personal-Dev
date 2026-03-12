package com.jesusterino.app.repository;

import com.jesusterino.app.model.DailyFoodEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyFoodEntryRepository extends JpaRepository<DailyFoodEntry, Long> {
    List<DailyFoodEntry> findByUserIdAndDate(Long userId, LocalDate date);
    List<DailyFoodEntry> findByUserUsernameAndDate(String username, LocalDate date);
}

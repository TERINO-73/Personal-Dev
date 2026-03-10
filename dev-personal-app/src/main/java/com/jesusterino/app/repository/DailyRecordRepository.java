package com.jesusterino.app.repository;

import com.jesusterino.app.model.DailyRecord;
import com.jesusterino.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyRecordRepository extends JpaRepository<DailyRecord, Long> {
    Optional<DailyRecord> findByDateAndUser(LocalDate date, User user);

    List<DailyRecord> findAllByUserOrderByDateDesc(User user);
}

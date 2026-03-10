package com.jesusterino.app.repository;

import com.jesusterino.app.model.Reminder;
import com.jesusterino.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUser(User user);

    List<Reminder> findByUserAndStartTimeBetween(User user, LocalDateTime start, LocalDateTime end);
}

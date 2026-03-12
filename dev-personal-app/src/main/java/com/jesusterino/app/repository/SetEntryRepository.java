package com.jesusterino.app.repository;

import com.jesusterino.app.model.SetEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SetEntryRepository extends JpaRepository<SetEntry, Long> {
    List<SetEntry> findByWorkoutSessionId(Long workoutSessionId);
    List<SetEntry> findByWorkoutSessionIdAndExerciseIdOrderBySetIndexAsc(Long workoutSessionId, Long exerciseId);
}

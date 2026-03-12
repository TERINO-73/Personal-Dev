package com.jesusterino.app.repository;

import com.jesusterino.app.model.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Page<Exercise> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Custom queries can be added here
}

package com.jesusterino.app.repository;

import com.jesusterino.app.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByCreatedByUsername(String username);
    List<Routine> findByCreatedByUsernameOrIsTemplateTrue(String username);
}

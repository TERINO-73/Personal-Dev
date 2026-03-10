package com.jesusterino.app.repository;

import com.jesusterino.app.model.Objective;
import com.jesusterino.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ObjectiveRepository extends JpaRepository<Objective, Long> {
    List<Objective> findByUser(User user);
}

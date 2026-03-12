package com.jesusterino.app.repository;

import com.jesusterino.app.model.UserNutritionProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserNutritionProfileRepository extends JpaRepository<UserNutritionProfile, Long> {
    Optional<UserNutritionProfile> findByUserId(Long userId);
    Optional<UserNutritionProfile> findByUserUsername(String username);
}

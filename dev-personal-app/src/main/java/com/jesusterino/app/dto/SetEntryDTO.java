package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SetEntryDTO {
    private Long id;
    private Long workoutSessionId;
    private Long exerciseId;
    private ExerciseDTO exercise;
    private Integer setIndex;
    private Integer reps;
    private BigDecimal weightKg;
    private BigDecimal rpe;
    private LocalDateTime createdAt;
}

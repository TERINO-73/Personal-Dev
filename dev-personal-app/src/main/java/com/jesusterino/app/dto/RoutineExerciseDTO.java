package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineExerciseDTO {
    private Long id;
    private Long routineId;
    private Long exerciseId;
    private ExerciseDTO exercise; // useful for frontend to display details
    private Integer orderIndex;
    private Integer defaultSets;
    private String defaultReps;
    private BigDecimal defaultWeightKg;
    private String notes;
}

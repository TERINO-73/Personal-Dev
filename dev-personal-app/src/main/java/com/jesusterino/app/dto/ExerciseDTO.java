package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseDTO {
    private Long id;
    private String name;
    private String primaryMuscle;
    private String secondaryMuscles;
    private String equipment;
    private String description;
    private Integer defaultRestSeconds;
    private Long createdById; // null if system exercise
    private LocalDateTime createdAt;
}

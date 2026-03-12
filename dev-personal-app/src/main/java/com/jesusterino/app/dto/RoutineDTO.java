package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineDTO {
    private Long id;
    private String name;
    private String description;
    private Long createdById;
    private boolean isTemplate;
    private LocalDateTime createdAt;
    
    // To cleanly transfer the routine with its associated exercises
    private List<RoutineExerciseDTO> exercises;
}

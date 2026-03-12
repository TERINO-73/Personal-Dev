package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineAssignmentDTO {
    private Long id;
    private Long routineId;
    private RoutineDTO routine; // To display Routine details on the assigned date
    private Long userId;
    private LocalDate date;
    private LocalDateTime assignedAt;
}

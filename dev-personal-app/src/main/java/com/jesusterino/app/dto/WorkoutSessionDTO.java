package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutSessionDTO {
    private Long id;
    private Long userId;
    private Long routineAssignmentId;
    private RoutineAssignmentDTO routineAssignment; // to display routines assigned to this session
    private LocalDate date;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String notes;
    private List<SetEntryDTO> sets;
}

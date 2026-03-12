package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyWorkoutSnapshotDTO {
    private Long id;
    private Long userId;
    private LocalDate date;
    private Integer totalExercises;
    private Integer totalSets;
    private Integer totalReps;
    private BigDecimal totalVolumeKg;
    private String jsonDetails;
}

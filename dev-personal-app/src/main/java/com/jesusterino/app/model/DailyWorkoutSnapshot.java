package com.jesusterino.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_workout_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyWorkoutSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer totalExercises;

    @Column(nullable = false)
    private Integer totalSets;

    @Column(nullable = false)
    private Integer totalReps;

    @Column(nullable = false)
    private BigDecimal totalVolumeKg;

    @Column(columnDefinition = "TEXT")
    private String jsonDetails; // Optional comprehensive breakdown
}

package com.jesusterino.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "routine_exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    private Integer defaultSets;

    @Column(nullable = false)
    private String defaultReps; // "8-12", "5"

    private BigDecimal defaultWeightKg;

    @Column(columnDefinition = "TEXT")
    private String notes;
}

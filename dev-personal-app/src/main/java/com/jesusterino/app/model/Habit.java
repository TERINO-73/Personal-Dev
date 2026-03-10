package com.jesusterino.app.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "habits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // daily, weekly, monthly

    private Integer targetCount; // Veces necesarias para completar (ej: 3 veces por semana)

    private Integer currentCount; // Veces completadas actualmente

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}

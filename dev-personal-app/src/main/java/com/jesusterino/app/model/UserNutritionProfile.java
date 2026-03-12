package com.jesusterino.app.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_nutrition_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNutritionProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Double weight;
    private Double height;
    
    private String sex;           // male / female
    private String activityLevel; // Sedentario, Ligero, Moderado, Alto, Muy alto
    private String goal;          // Perder grasa, Mantener peso, Ganar masa muscular

    private Integer age;

    private Double targetCalories;
    private Double targetProtein;
    private Double targetCarbs;
    private Double targetFat;
}

package com.jesusterino.app.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "foods")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double caloriesPer100g;

    @Column(nullable = false)
    private Double proteinPer100g;

    @Column(nullable = false)
    private Double carbsPer100g;

    @Column(nullable = false)
    private Double fatPer100g;

    @Column(unique = true)
    private String barcode;
}

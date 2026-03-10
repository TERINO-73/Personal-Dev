package com.jesusterino.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "daily_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 5000)
    private String journalText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ElementCollection
    @CollectionTable(name = "daily_record_habits", joinColumns = @JoinColumn(name = "daily_record_id"))
    @Column(name = "habit_id")
    @Builder.Default
    private Set<Long> completedHabitIds = new HashSet<>();
}

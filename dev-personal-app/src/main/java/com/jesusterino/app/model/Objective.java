package com.jesusterino.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "objectives")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Objective {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ObjectiveType type;

    @Enumerated(EnumType.STRING)
    private ObjectiveStatus status;

    private LocalDate deadline; // Nullable for infinite objectives

    // Campos para tipo READING (Simplificado si usamos lista de libros, o
    // mantenemos para objetivo único)
    private Integer currentPage;
    private Integer totalPages;

    @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Subtask> subtasks = new ArrayList<>();

    @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Book> books = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public void addSubtask(Subtask subtask) {
        subtasks.add(subtask);
        subtask.setObjective(this);
    }

    public void addBook(Book book) {
        books.add(book);
        book.setObjective(this);
    }
}

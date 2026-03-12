package com.jesusterino.app.controller;

import com.jesusterino.app.dto.ExerciseDTO;
import com.jesusterino.app.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<Page<ExerciseDTO>> getExercises(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(exerciseService.getExercises(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDTO> getExerciseById(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(exerciseService.getExerciseById(id));
    }

    @PostMapping
    public ResponseEntity<ExerciseDTO> createExercise(
            @RequestBody ExerciseDTO dto,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(exerciseService.createExercise(username, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExerciseDTO> updateExercise(
            @PathVariable(name = "id") Long id,
            @RequestBody ExerciseDTO dto,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(exerciseService.updateExercise(id, username, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(
            @PathVariable(name = "id") Long id,
            Authentication authentication
    ) {
        String username = authentication.getName();
        exerciseService.deleteExercise(id, username);
        return ResponseEntity.noContent().build();
    }
}

package com.jesusterino.app.service;

import com.jesusterino.app.dto.ExerciseDTO;
import com.jesusterino.app.model.Exercise;
import com.jesusterino.app.model.User;
import com.jesusterino.app.repository.ExerciseRepository;
import com.jesusterino.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public Page<ExerciseDTO> getExercises(String search, Pageable pageable) {
        Page<Exercise> exercises;
        if (search != null && !search.trim().isEmpty()) {
            exercises = exerciseRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            exercises = exerciseRepository.findAll(pageable);
        }
        return exercises.map(this::mapToDTO);
    }

    public ExerciseDTO getExerciseById(Long id) {
        return exerciseRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
    }

    @Transactional
    public ExerciseDTO createExercise(String username, ExerciseDTO dto) {
         User user = null;
         if (username != null) {
             user = userRepository.findByUsername(username)
                     .orElseThrow(() -> new RuntimeException("User not found"));
         }
         
         Exercise exercise = Exercise.builder()
                 .name(dto.getName())
                 .primaryMuscle(dto.getPrimaryMuscle())
                 .secondaryMuscles(dto.getSecondaryMuscles())
                 .equipment(dto.getEquipment())
                 .description(dto.getDescription())
                 .defaultRestSeconds(dto.getDefaultRestSeconds())
                 .createdBy(user)
                 .build();

         exercise = exerciseRepository.save(exercise);
         return mapToDTO(exercise);
    }

    @Transactional
    public ExerciseDTO updateExercise(Long id, String username, ExerciseDTO dto) {
         Exercise exercise = exerciseRepository.findById(id)
                 .orElseThrow(() -> new RuntimeException("Exercise not found"));
         
         // Only creator can update
         if (exercise.getCreatedBy() == null || !exercise.getCreatedBy().getUsername().equals(username)) {
             throw new RuntimeException("Unauthorized to update this exercise");
         }

         exercise.setName(dto.getName());
         exercise.setPrimaryMuscle(dto.getPrimaryMuscle());
         exercise.setSecondaryMuscles(dto.getSecondaryMuscles());
         exercise.setEquipment(dto.getEquipment());
         exercise.setDescription(dto.getDescription());
         exercise.setDefaultRestSeconds(dto.getDefaultRestSeconds());

         exercise = exerciseRepository.save(exercise);
         return mapToDTO(exercise);
    }

    @Transactional
    public void deleteExercise(Long id, String username) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        
        if (exercise.getCreatedBy() == null || !exercise.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this exercise (may be a global system exercise)");
        }
        
        exerciseRepository.delete(exercise);
    }

    public ExerciseDTO mapToDTO(Exercise exercise) {
        if (exercise == null) return null;
        return ExerciseDTO.builder()
                .id(exercise.getId())
                .name(exercise.getName())
                .primaryMuscle(exercise.getPrimaryMuscle())
                .secondaryMuscles(exercise.getSecondaryMuscles())
                .equipment(exercise.getEquipment())
                .description(exercise.getDescription())
                .defaultRestSeconds(exercise.getDefaultRestSeconds())
                .createdById(exercise.getCreatedBy() != null ? exercise.getCreatedBy().getId() : null)
                .createdAt(exercise.getCreatedAt())
                .build();
    }
}

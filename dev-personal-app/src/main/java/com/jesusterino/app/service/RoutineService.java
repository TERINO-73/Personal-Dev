package com.jesusterino.app.service;

import com.jesusterino.app.dto.RoutineAssignmentDTO;
import com.jesusterino.app.dto.RoutineDTO;
import com.jesusterino.app.dto.RoutineExerciseDTO;
import com.jesusterino.app.model.Exercise;
import com.jesusterino.app.model.Routine;
import com.jesusterino.app.model.RoutineAssignment;
import com.jesusterino.app.model.RoutineExercise;
import com.jesusterino.app.model.User;
import com.jesusterino.app.repository.ExerciseRepository;
import com.jesusterino.app.repository.RoutineAssignmentRepository;
import com.jesusterino.app.repository.RoutineExerciseRepository;
import com.jesusterino.app.repository.RoutineRepository;
import com.jesusterino.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineExerciseRepository routineExerciseRepository;
    private final RoutineAssignmentRepository routineAssignmentRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final ExerciseService exerciseService;

    @Transactional(readOnly = true)
    public List<RoutineDTO> getRoutines(String username, boolean userOnly) {
        List<Routine> routines;
        if (userOnly) {
            routines = routineRepository.findByCreatedByUsername(username);
        } else {
            routines = routineRepository.findByCreatedByUsernameOrIsTemplateTrue(username);
        }
        return routines.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoutineDTO getRoutineById(Long id) {
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Routine not found"));
        return mapToDTO(routine);
    }

    @Transactional
    public RoutineDTO createRoutine(String username, RoutineDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Routine routine = Routine.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .createdBy(user)
                .isTemplate(dto.isTemplate())
                .build();

        routine = routineRepository.save(routine);
        saveRoutineExercises(routine, dto.getExercises());

        return mapToDTO(routine);
    }

    @Transactional
    public RoutineDTO updateRoutine(Long id, String username, RoutineDTO dto) {
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Routine not found"));
        
        if (!routine.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to update this routine");
        }

        routine.setName(dto.getName());
        routine.setDescription(dto.getDescription());
        routine.setTemplate(dto.isTemplate());
        routine = routineRepository.save(routine);

        // Delete existing exercises and replace
        routineExerciseRepository.deleteByRoutineId(routine.getId());
        saveRoutineExercises(routine, dto.getExercises());

        return mapToDTO(routine);
    }

    @Transactional
    public void deleteRoutine(Long id, String username) {
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Routine not found"));
        
        if (!routine.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this routine");
        }
        
        routineExerciseRepository.deleteByRoutineId(routine.getId());
        routineRepository.delete(routine);
    }

    private void saveRoutineExercises(Routine routine, List<RoutineExerciseDTO> exerciseDTOs) {
        if (exerciseDTOs == null || exerciseDTOs.isEmpty()) return;

        int index = 0;
        for (RoutineExerciseDTO dto : exerciseDTOs) {
            Exercise exercise = exerciseRepository.findById(dto.getExerciseId())
                    .orElseThrow(() -> new RuntimeException("Exercise not found ID: " + dto.getExerciseId()));

            RoutineExercise re = RoutineExercise.builder()
                    .routine(routine)
                    .exercise(exercise)
                    .orderIndex(index++) // ensures safe incremental index
                    .defaultSets(dto.getDefaultSets() != null ? dto.getDefaultSets() : 3)
                    .defaultReps(dto.getDefaultReps() != null ? dto.getDefaultReps() : "10")
                    .defaultWeightKg(dto.getDefaultWeightKg())
                    .notes(dto.getNotes())
                    .build();
            routineExerciseRepository.save(re);
        }
    }

    @Transactional
    public RoutineAssignmentDTO assignRoutine(Long routineId, String username, LocalDate date) {
        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new RuntimeException("Routine not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Optional: Check if already assigned to avoid duplicates
        routineAssignmentRepository.findByUserUsernameAndRoutineIdAndDate(username, routineId, date)
            .ifPresent(a -> { throw new RuntimeException("Routine is already assigned for this date"); });

        RoutineAssignment assignment = RoutineAssignment.builder()
                .routine(routine)
                .user(user)
                .date(date)
                .build();
        
        assignment = routineAssignmentRepository.save(assignment);
        return mapAssignmentToDTO(assignment);
    }

    @Transactional(readOnly = true)
    public List<RoutineAssignmentDTO> getAssignments(String username, LocalDate date) {
        return routineAssignmentRepository.findByUserUsernameAndDate(username, date)
                .stream().map(this::mapAssignmentToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void unassignRoutine(Long assignmentId, String username) {
        RoutineAssignment assignment = routineAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        if (!assignment.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }
        
        routineAssignmentRepository.delete(assignment);
    }

    public RoutineDTO mapToDTO(Routine routine) {
        if (routine == null) return null;
        
        List<RoutineExerciseDTO> exerciseDTOs = routineExerciseRepository.findByRoutineIdOrderByOrderIndexAsc(routine.getId())
                .stream().map(re -> RoutineExerciseDTO.builder()
                        .id(re.getId())
                        .routineId(re.getRoutine().getId())
                        .exerciseId(re.getExercise().getId())
                        .exercise(exerciseService.mapToDTO(re.getExercise()))
                        .orderIndex(re.getOrderIndex())
                        .defaultSets(re.getDefaultSets())
                        .defaultReps(re.getDefaultReps())
                        .defaultWeightKg(re.getDefaultWeightKg())
                        .notes(re.getNotes())
                        .build()
                ).collect(Collectors.toList());

        return RoutineDTO.builder()
                .id(routine.getId())
                .name(routine.getName())
                .description(routine.getDescription())
                .createdById(routine.getCreatedBy().getId())
                .isTemplate(routine.isTemplate())
                .createdAt(routine.getCreatedAt())
                .exercises(exerciseDTOs)
                .build();
    }

    private RoutineAssignmentDTO mapAssignmentToDTO(RoutineAssignment assignment) {
        if (assignment == null) return null;
        return RoutineAssignmentDTO.builder()
                .id(assignment.getId())
                .routineId(assignment.getRoutine().getId())
                .routine(mapToDTO(assignment.getRoutine()))
                .userId(assignment.getUser().getId())
                .date(assignment.getDate())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }
}

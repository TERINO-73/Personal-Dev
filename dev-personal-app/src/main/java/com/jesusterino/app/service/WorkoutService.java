package com.jesusterino.app.service;

import com.jesusterino.app.dto.SetEntryDTO;
import com.jesusterino.app.dto.WorkoutSessionDTO;
import com.jesusterino.app.model.Exercise;
import com.jesusterino.app.model.RoutineAssignment;
import com.jesusterino.app.model.SetEntry;
import com.jesusterino.app.model.User;
import com.jesusterino.app.model.WorkoutSession;
import com.jesusterino.app.repository.ExerciseRepository;
import com.jesusterino.app.repository.RoutineAssignmentRepository;
import com.jesusterino.app.repository.SetEntryRepository;
import com.jesusterino.app.repository.UserRepository;
import com.jesusterino.app.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final SetEntryRepository setEntryRepository;
    private final UserRepository userRepository;
    private final RoutineAssignmentRepository routineAssignmentRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseService exerciseService;

    @Transactional
    public WorkoutSessionDTO startSession(String username, Long routineAssignmentId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RoutineAssignment assignment = null;
        if (routineAssignmentId != null) {
            assignment = routineAssignmentRepository.findById(routineAssignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));
            
            if (!assignment.getUser().getUsername().equals(username)) {
                throw new RuntimeException("Unauthorized assignment");
            }
        }

        WorkoutSession session = WorkoutSession.builder()
                .user(user)
                .routineAssignment(assignment)
                .date(LocalDate.now())
                .startedAt(LocalDateTime.now())
                .build();
        
        session = workoutSessionRepository.save(session);
        return mapToDTO(session);
    }

    @Transactional(readOnly = true)
    public WorkoutSessionDTO getSession(Long sessionId, String username) {
        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (!session.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }
        return mapToDTO(session);
    }

    @Transactional
    public SetEntryDTO addSet(Long sessionId, String username, SetEntryDTO dto) {
        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (session.getFinishedAt() != null) {
            throw new RuntimeException("Cannot add sets to a finished session");
        }

        Exercise exercise = exerciseRepository.findById(dto.getExerciseId())
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        if (dto.getReps() < 0) {
            throw new RuntimeException("Reps cannot be negative");
        }

        // Calculate Set Index automatically based on existing sets for this exercise in this session
        List<SetEntry> existingSets = setEntryRepository.findByWorkoutSessionIdAndExerciseIdOrderBySetIndexAsc(sessionId, exercise.getId());
        int newIndex = existingSets.size() + 1;

        SetEntry setEntry = SetEntry.builder()
                .workoutSession(session)
                .exercise(exercise)
                .setIndex(newIndex)
                .reps(dto.getReps())
                .weightKg(dto.getWeightKg())
                .rpe(dto.getRpe())
                .createdAt(LocalDateTime.now())
                .build();

        setEntry = setEntryRepository.save(setEntry);
        return mapSetToDTO(setEntry);
    }

    @Transactional
    public void deleteSet(Long sessionId, Long setId, String username) {
        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        SetEntry set = setEntryRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Set not found"));

        if (!set.getWorkoutSession().getId().equals(sessionId)) {
            throw new RuntimeException("Set does not belong to session");
        }

        setEntryRepository.delete(set);
    }

    @Transactional
    public WorkoutSessionDTO finishSession(Long sessionId, String username) {
        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        session.setFinishedAt(LocalDateTime.now());
        session = workoutSessionRepository.save(session);
        return mapToDTO(session);
    }

    private WorkoutSessionDTO mapToDTO(WorkoutSession session) {
        if (session == null) return null;
        
        List<SetEntryDTO> setDTOs = setEntryRepository.findByWorkoutSessionId(session.getId())
                .stream().map(this::mapSetToDTO).collect(Collectors.toList());

        return WorkoutSessionDTO.builder()
                .id(session.getId())
                .userId(session.getUser().getId())
                .routineAssignmentId(session.getRoutineAssignment() != null ? session.getRoutineAssignment().getId() : null)
                .date(session.getDate())
                .startedAt(session.getStartedAt())
                .finishedAt(session.getFinishedAt())
                .notes(session.getNotes())
                .sets(setDTOs)
                .build();
    }

    private SetEntryDTO mapSetToDTO(SetEntry set) {
        return SetEntryDTO.builder()
                .id(set.getId())
                .workoutSessionId(set.getWorkoutSession().getId())
                .exerciseId(set.getExercise().getId())
                .exercise(exerciseService.mapToDTO(set.getExercise()))
                .setIndex(set.getSetIndex())
                .reps(set.getReps())
                .weightKg(set.getWeightKg())
                .rpe(set.getRpe())
                .createdAt(set.getCreatedAt())
                .build();
    }
}

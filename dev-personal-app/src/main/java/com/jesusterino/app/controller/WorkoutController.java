package com.jesusterino.app.controller;

import com.jesusterino.app.dto.SetEntryDTO;
import com.jesusterino.app.dto.WorkoutSessionDTO;
import com.jesusterino.app.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping("/start")
    public ResponseEntity<WorkoutSessionDTO> startSession(
            @RequestBody(required = false) Map<String, Long> body,
            Authentication authentication
    ) {
        String username = authentication.getName();
        Long routineAssignmentId = body != null ? body.get("routineAssignmentId") : null;
        return ResponseEntity.ok(workoutService.startSession(username, routineAssignmentId));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<WorkoutSessionDTO> getSession(
            @PathVariable Long sessionId,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(workoutService.getSession(sessionId, username));
    }

    @PostMapping("/{sessionId}/sets")
    public ResponseEntity<SetEntryDTO> addSet(
            @PathVariable Long sessionId,
            @RequestBody SetEntryDTO dto,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(workoutService.addSet(sessionId, username, dto));
    }

    @DeleteMapping("/{sessionId}/sets/{setId}")
    public ResponseEntity<Void> deleteSet(
            @PathVariable Long sessionId,
            @PathVariable Long setId,
            Authentication authentication
    ) {
        String username = authentication.getName();
        workoutService.deleteSet(sessionId, setId, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sessionId}/finish")
    public ResponseEntity<WorkoutSessionDTO> finishSession(
            @PathVariable Long sessionId,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(workoutService.finishSession(sessionId, username));
    }
}

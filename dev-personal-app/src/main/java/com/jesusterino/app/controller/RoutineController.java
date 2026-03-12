package com.jesusterino.app.controller;

import com.jesusterino.app.dto.RoutineAssignmentDTO;
import com.jesusterino.app.dto.RoutineDTO;
import com.jesusterino.app.service.RoutineService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routines")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RoutineController {

    private final RoutineService routineService;

    @GetMapping
    public ResponseEntity<List<RoutineDTO>> getRoutines(
            @RequestParam(defaultValue = "false") boolean userOnly,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(routineService.getRoutines(username, userOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoutineDTO> getRoutineById(@PathVariable Long id) {
        return ResponseEntity.ok(routineService.getRoutineById(id));
    }

    @PostMapping
    public ResponseEntity<RoutineDTO> createRoutine(
            @RequestBody RoutineDTO dto,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(routineService.createRoutine(username, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineDTO> updateRoutine(
            @PathVariable Long id,
            @RequestBody RoutineDTO dto,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(routineService.updateRoutine(id, username, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoutine(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String username = authentication.getName();
        routineService.deleteRoutine(id, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<RoutineAssignmentDTO> assignRoutine(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String username = authentication.getName();
        LocalDate date = LocalDate.parse(body.get("date"));
        return ResponseEntity.ok(routineService.assignRoutine(id, username, date));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<RoutineAssignmentDTO>> getAssignments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(routineService.getAssignments(username, date));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> unassignRoutine(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String username = authentication.getName();
        routineService.unassignRoutine(id, username);
        return ResponseEntity.noContent().build();
    }
}

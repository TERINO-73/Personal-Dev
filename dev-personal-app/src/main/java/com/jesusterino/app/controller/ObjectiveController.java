package com.jesusterino.app.controller;

import com.jesusterino.app.dto.ObjectiveDTO;
import com.jesusterino.app.service.ObjectiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.jesusterino.app.model.SubtaskStatus;

@RestController
@RequestMapping("/api/objectives")
@RequiredArgsConstructor
public class ObjectiveController {

    private final ObjectiveService objectiveService;

    @GetMapping("/{username}")
    public ResponseEntity<List<ObjectiveDTO>> getObjectives(@PathVariable("username") String username) {
        return ResponseEntity.ok(objectiveService.getObjectivesByUsername(username));
    }

    @PostMapping("/{username}")
    public ResponseEntity<ObjectiveDTO> addObjective(@PathVariable("username") String username,
            @RequestBody ObjectiveDTO objectiveDTO) {
        return ResponseEntity.ok(objectiveService.addObjective(username, objectiveDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObjectiveDTO> updateObjective(@PathVariable("id") Long id,
            @RequestBody ObjectiveDTO objectiveDTO) {
        return ResponseEntity.ok(objectiveService.updateObjective(id, objectiveDTO));
    }

    @PatchMapping("/books/{bookId}")
    public ResponseEntity<ObjectiveDTO> updateBookProgress(@PathVariable("bookId") Long bookId,
            @RequestParam("currentPage") Integer currentPage) {
        return ResponseEntity.ok(objectiveService.updateBookProgress(bookId, currentPage));
    }

    @PatchMapping("/subtasks/{subtaskId}")
    public ResponseEntity<ObjectiveDTO> updateSubtaskStatus(@PathVariable("subtaskId") Long subtaskId,
            @RequestParam("status") SubtaskStatus status) {
        return ResponseEntity.ok(objectiveService.updateSubtaskStatus(subtaskId, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObjective(@PathVariable("id") Long id) {
        objectiveService.deleteObjective(id);
        return ResponseEntity.noContent().build();
    }
}

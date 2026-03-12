package com.jesusterino.app.controller;

import com.jesusterino.app.dto.HabitDTO;
import com.jesusterino.app.service.HabitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @GetMapping("/{username}")
    public ResponseEntity<List<HabitDTO>> getHabits(@PathVariable("username") String username) {
        return ResponseEntity.ok(habitService.getHabitsByUsername(username));
    }

    @PostMapping("/{username}")
    public ResponseEntity<HabitDTO> addHabit(@PathVariable("username") String username,
            @RequestBody HabitDTO habitDTO) {
        return ResponseEntity.ok(habitService.addHabit(username, habitDTO));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<HabitDTO> toggleHabit(@PathVariable("id") Long id) {
        return ResponseEntity.ok(habitService.toggleHabit(id));
    }

    @PatchMapping("/{id}/decrement")
    public ResponseEntity<HabitDTO> decrementHabit(@PathVariable("id") Long id) {
        return ResponseEntity.ok(habitService.decrementHabit(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable("id") Long id) {
        habitService.deleteHabit(id);
        return ResponseEntity.noContent().build();
    }
}

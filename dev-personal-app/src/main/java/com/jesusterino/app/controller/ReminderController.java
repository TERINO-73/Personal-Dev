package com.jesusterino.app.controller;

import com.jesusterino.app.dto.ReminderDTO;
import com.jesusterino.app.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    @GetMapping("/{username}")
    public ResponseEntity<List<ReminderDTO>> getReminders(@PathVariable("username") String username) {
        return ResponseEntity.ok(reminderService.getReminders(username));
    }

    @PostMapping("/{username}")
    public ResponseEntity<ReminderDTO> addReminder(@PathVariable("username") String username,
            @RequestBody ReminderDTO reminderDTO) {
        return ResponseEntity.ok(reminderService.addReminder(username, reminderDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable("id") Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }
}

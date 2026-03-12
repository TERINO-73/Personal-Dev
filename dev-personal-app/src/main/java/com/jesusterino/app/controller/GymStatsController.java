package com.jesusterino.app.controller;

import com.jesusterino.app.dto.DailyWorkoutSnapshotDTO;
import com.jesusterino.app.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class GymStatsController {

    private final StatsService statsService;

    @GetMapping("/daily")
    public ResponseEntity<DailyWorkoutSnapshotDTO> getDailySnapshot(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication
    ) {
        String username = authentication.getName();
        DailyWorkoutSnapshotDTO snapshot = statsService.getDailySnapshot(username, date);
        if (snapshot == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(snapshot);
    }

    @GetMapping("/range")
    public ResponseEntity<List<DailyWorkoutSnapshotDTO>> getSnapshotsInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(statsService.getRangeSnapshots(username, from, to));
    }
}

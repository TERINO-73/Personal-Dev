package com.jesusterino.app.controller;

import com.jesusterino.app.dto.DailyRecordDTO;
import com.jesusterino.app.service.DailyRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/daily-records")
@RequiredArgsConstructor
public class DailyRecordController {

    private final DailyRecordService dailyRecordService;

    @GetMapping("/{username}/today")
    public ResponseEntity<DailyRecordDTO> getTodayRecord(@PathVariable("username") String username) {
        return ResponseEntity.ok(dailyRecordService.getTodayRecord(username));
    }

    @GetMapping("/{username}/history")
    public ResponseEntity<java.util.List<DailyRecordDTO>> getHistory(@PathVariable("username") String username) {
        return ResponseEntity.ok(dailyRecordService.getHistory(username));
    }

    @PostMapping("/{username}/finalize")
    public ResponseEntity<DailyRecordDTO> finalizeDay(@PathVariable("username") String username,
            @RequestBody DailyRecordDTO dailyRecordDTO) {
        return ResponseEntity.ok(dailyRecordService.finalizeDay(username, dailyRecordDTO));
    }
}

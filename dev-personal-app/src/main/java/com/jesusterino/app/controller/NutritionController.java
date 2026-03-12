package com.jesusterino.app.controller;

import com.jesusterino.app.dto.AddFoodRequestDTO;
import com.jesusterino.app.dto.DailyFoodEntryDTO;
import com.jesusterino.app.dto.NutritionDayResponseDTO;
import com.jesusterino.app.dto.NutritionProfileDTO;
import com.jesusterino.app.service.NutritionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService nutritionService;

    @GetMapping("/{username}/profile")
    public ResponseEntity<NutritionProfileDTO> getProfile(@PathVariable("username") String username) {
        return ResponseEntity.ok(nutritionService.getProfile(username));
    }

    @PostMapping("/{username}/profile")
    public ResponseEntity<NutritionProfileDTO> saveProfile(
            @PathVariable("username") String username,
            @RequestBody NutritionProfileDTO dto) {
        return ResponseEntity.ok(nutritionService.saveProfile(username, dto));
    }

    @PostMapping("/{username}/profile/reset")
    public ResponseEntity<NutritionProfileDTO> resetMacros(@PathVariable("username") String username) {
        return ResponseEntity.ok(nutritionService.resetMacros(username));
    }

    @GetMapping("/{username}/day/{date}")
    public ResponseEntity<NutritionDayResponseDTO> getDayInfo(
            @PathVariable("username") String username,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(nutritionService.getDayInfo(username, date));
    }

    @PostMapping("/{username}/day/addFood")
    public ResponseEntity<DailyFoodEntryDTO> addFoodToDay(
            @PathVariable("username") String username,
            @RequestBody AddFoodRequestDTO req) {
        return ResponseEntity.ok(nutritionService.addFoodToDay(username, req));
    }

    @DeleteMapping("/{username}/day/{entryId}")
    public ResponseEntity<Void> removeFoodFromDay(
            @PathVariable("username") String username,
            @PathVariable("entryId") Long entryId) {
        nutritionService.removeFoodFromDay(entryId, username);
        return ResponseEntity.noContent().build();
    }
}

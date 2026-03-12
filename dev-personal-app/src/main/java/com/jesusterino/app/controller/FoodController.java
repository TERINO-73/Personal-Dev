package com.jesusterino.app.controller;

import com.jesusterino.app.dto.FoodDTO;
import com.jesusterino.app.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<List<FoodDTO>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoods());
    }

    @PostMapping
    public ResponseEntity<FoodDTO> createFood(@RequestBody FoodDTO foodDTO) {
        return ResponseEntity.ok(foodService.createFood(foodDTO));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<FoodDTO> getFoodByBarcode(@PathVariable("barcode") String barcode) {
        return ResponseEntity.ok(foodService.getOrFetchFoodByBarcode(barcode));
    }
}

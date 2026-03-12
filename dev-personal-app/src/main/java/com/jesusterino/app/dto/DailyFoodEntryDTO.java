package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyFoodEntryDTO {
    private Long id;
    private FoodDTO food;
    private LocalDate date;
    private Double grams;
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
}

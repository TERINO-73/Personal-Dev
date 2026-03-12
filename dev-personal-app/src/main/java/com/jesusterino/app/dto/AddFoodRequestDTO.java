package com.jesusterino.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddFoodRequestDTO {
    private Long foodId;
    private Double grams;
    private LocalDate date;
}

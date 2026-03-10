package com.jesusterino.app.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitDTO {
    private Long id;
    private String name;
    private String type;
    private Integer targetCount;
    private Integer currentCount;
    private Boolean completed;
}

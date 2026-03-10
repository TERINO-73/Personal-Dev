package com.jesusterino.app.dto;

import com.jesusterino.app.model.SubtaskStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubtaskDTO {
    private Long id;
    private String title;
    private SubtaskStatus status;
}

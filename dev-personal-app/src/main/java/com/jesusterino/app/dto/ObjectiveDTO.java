package com.jesusterino.app.dto;

import com.jesusterino.app.model.ObjectiveStatus;
import com.jesusterino.app.model.ObjectiveType;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObjectiveDTO {
    private Long id;
    private String title;
    private String description;
    private ObjectiveType type;
    private ObjectiveStatus status;
    private LocalDate deadline;
    private Integer currentPage;
    private Integer totalPages;
    private List<SubtaskDTO> subtasks;
    private List<BookDTO> books;
}

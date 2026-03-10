package com.jesusterino.app.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDTO {
    private Long id;
    private String title;
    private String description;
    private Integer currentPage;
    private Integer totalPages;
    private boolean completed;
}

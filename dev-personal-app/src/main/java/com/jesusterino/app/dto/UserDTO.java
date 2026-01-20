package com.jesusterino.app.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private String username;
    private String email;
    private String password; // Solo para registro/login, nunca enviar en respuestas
}

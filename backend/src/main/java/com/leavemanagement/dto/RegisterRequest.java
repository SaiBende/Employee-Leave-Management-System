package com.leavemanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;

    @NotNull
    private Long departmentId;

    @NotBlank
    private String role;
}

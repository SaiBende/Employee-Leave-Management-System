package com.leavemanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCompanyRequest {
    @NotBlank
    private String companyName;

    @NotBlank
    private String adminName;

    @NotBlank @Email
    private String adminEmail;

    @NotBlank
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String adminPassword;
}

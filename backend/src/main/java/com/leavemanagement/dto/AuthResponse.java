package com.leavemanagement.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String role;
    private String department;
    private Long companyId;
    private String companyName;
    private String companySlug;
    private boolean mustChangePassword;
}

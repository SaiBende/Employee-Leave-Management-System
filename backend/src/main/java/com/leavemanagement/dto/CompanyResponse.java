package com.leavemanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String slug;
    private boolean active;
    private String adminName;
    private String adminEmail;
    private long employeeCount;
    private long departmentCount;
    private LocalDateTime createdAt;
}

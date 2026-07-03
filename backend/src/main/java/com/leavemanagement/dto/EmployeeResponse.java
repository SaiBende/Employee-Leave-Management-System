package com.leavemanagement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeResponse {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String role;
    private Long managerId;
    private String managerName;
    private LocalDateTime createdAt;
}

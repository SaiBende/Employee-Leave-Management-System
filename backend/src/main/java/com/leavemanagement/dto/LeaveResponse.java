package com.leavemanagement.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private String managerComments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

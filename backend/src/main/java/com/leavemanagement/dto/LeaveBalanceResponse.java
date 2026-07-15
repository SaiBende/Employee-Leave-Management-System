package com.leavemanagement.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveBalanceResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String leaveType;
    private int totalDays;
    private int usedDays;
    private int remainingDays;
    private int year;
}

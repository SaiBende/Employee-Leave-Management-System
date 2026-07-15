package com.leavemanagement.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateLeaveBalanceRequest {
    private int totalDays;
    private int usedDays;
}

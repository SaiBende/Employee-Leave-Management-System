package com.leavemanagement.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateLeaveBalanceRequest {
    @Min(0)
    private int totalDays;

    @Min(0)
    private int usedDays;
}

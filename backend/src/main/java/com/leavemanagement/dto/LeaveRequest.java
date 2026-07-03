package com.leavemanagement.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LeaveRequest {
    @NotBlank
    private String leaveType;

    @NotNull @FutureOrPresent
    private LocalDate startDate;

    @NotNull @FutureOrPresent
    private LocalDate endDate;

    @NotBlank
    private String reason;
}

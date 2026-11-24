package com.leavemanagement.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlatformDashboardResponse {
    private long totalCompanies;
    private long activeCompanies;
    private long totalEmployees;
    private long totalLeaves;
}

package com.leavemanagement.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private long totalLeaves;
    private long approvedLeaves;
    private long pendingLeaves;
    private long rejectedLeaves;
    private long totalEmployees;
    private long pendingApprovals;
    private List<LeaveResponse> recentActivities;
}

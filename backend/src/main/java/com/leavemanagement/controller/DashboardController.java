package com.leavemanagement.controller;

import com.leavemanagement.dto.ApiResponse;
import com.leavemanagement.dto.DashboardResponse;
import com.leavemanagement.dto.LeaveResponse;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Leave;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveRepository;
import com.leavemanagement.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics endpoints")
public class DashboardController {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public DashboardController(LeaveRepository leaveRepository,
                               EmployeeRepository employeeRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/employee")
    @Operation(summary = "Get employee dashboard statistics")
    public ResponseEntity<?> employeeDashboard(@CurrentUser Employee employee) {
        List<Leave> leaves = leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId());

        DashboardResponse dashboard = DashboardResponse.builder()
            .totalLeaves(leaves.size())
            .approvedLeaves(leaves.stream().filter(l -> l.getStatus() == LeaveStatus.APPROVED).count())
            .pendingLeaves(leaves.stream().filter(l -> l.getStatus() == LeaveStatus.PENDING).count())
            .rejectedLeaves(leaves.stream().filter(l -> l.getStatus() == LeaveStatus.REJECTED).count())
            .recentActivities(leaves.stream().limit(5)
                .map(l -> LeaveResponse.builder()
                    .id(l.getId())
                    .employeeId(l.getEmployee().getId())
                    .employeeName(l.getEmployee().getName())
                    .leaveType(l.getLeaveType().name())
                    .startDate(l.getStartDate())
                    .endDate(l.getEndDate())
                    .reason(l.getReason())
                    .status(l.getStatus().name())
                    .managerComments(l.getManagerComments())
                    .decidedByName(l.getDecidedBy() != null ? l.getDecidedBy().getName() : null)
                    .createdAt(l.getCreatedAt())
                    .build())
                .toList())
            .build();

        return ResponseEntity.ok(new ApiResponse(true, "Success", dashboard));
    }

    @GetMapping("/manager")
    @Operation(summary = "Get manager dashboard statistics")
    public ResponseEntity<?> managerDashboard(@CurrentUser Employee employee) {
        if (employee.getRole() != Role.MANAGER) {
            return ResponseEntity.status(403)
                .body(new ApiResponse(false, "Manager access required", null));
        }

        List<Employee> team = employeeRepository.findByManagerId(employee.getId());
        List<Long> teamIds = team.stream().map(Employee::getId).toList();

        if (teamIds.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse(true, "Success",
                DashboardResponse.builder().totalEmployees(0).build()));
        }

        List<Leave> teamLeaves = leaveRepository.findByEmployeeIdIn(teamIds);
        List<Leave> recentLeaves = leaveRepository.findTop5ByEmployeeIdInOrderByCreatedAtDesc(teamIds);

        DashboardResponse dashboard = DashboardResponse.builder()
            .totalEmployees(team.size())
            .totalLeaves(teamLeaves.size())
            .pendingApprovals(teamLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.PENDING).count())
            .approvedLeaves(teamLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.APPROVED).count())
            .rejectedLeaves(teamLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.REJECTED).count())
            .recentActivities(recentLeaves.stream()
                .map(l -> LeaveResponse.builder()
                    .id(l.getId())
                    .employeeId(l.getEmployee().getId())
                    .employeeName(l.getEmployee().getName())
                    .leaveType(l.getLeaveType().name())
                    .startDate(l.getStartDate())
                    .endDate(l.getEndDate())
                    .reason(l.getReason())
                    .status(l.getStatus().name())
                    .managerComments(l.getManagerComments())
                    .decidedByName(l.getDecidedBy() != null ? l.getDecidedBy().getName() : null)
                    .createdAt(l.getCreatedAt())
                    .build())
                .toList())
            .build();

        return ResponseEntity.ok(new ApiResponse(true, "Success", dashboard));
    }
}
package com.leavemanagement.controller;

import com.leavemanagement.dto.*;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.security.CurrentUser;
import com.leavemanagement.service.LeaveService;
import com.leavemanagement.service.ManagerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@Tag(name = "Manager Operations", description = "Manager approval and team management")
public class ManagerController {

    private final ManagerService managerService;
    private final LeaveService leaveService;

    public ManagerController(ManagerService managerService, LeaveService leaveService) {
        this.managerService = managerService;
        this.leaveService = leaveService;
    }

    @GetMapping("/pending-leaves")
    @Operation(summary = "View all pending leave requests from team")
    public ResponseEntity<?> getPendingLeaves(@CurrentUser Employee employee) {
        requireManager(employee);
        List<LeaveResponse> leaves = managerService.getPendingLeaves(employee);
        return ResponseEntity.ok(new ApiResponse(true, "Success", leaves));
    }

    @PutMapping("/leaves/{id}/approve")
    @Operation(summary = "Approve a pending leave request")
    public ResponseEntity<?> approveLeave(@PathVariable Long id,
                                           @CurrentUser Employee employee) {
        requireManager(employee);
        try {
            LeaveResponse leave = managerService.approveLeave(id, employee);
            return ResponseEntity.ok(new ApiResponse(true, "Leave approved", leave));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PutMapping("/leaves/{id}/reject")
    @Operation(summary = "Reject a pending leave request with comments")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id,
                                          @RequestBody Map<String, String> body,
                                          @CurrentUser Employee employee) {
        requireManager(employee);
        try {
            String comments = body.getOrDefault("comments", "");
            LeaveResponse leave = managerService.rejectLeave(id, comments, employee);
            return ResponseEntity.ok(new ApiResponse(true, "Leave rejected", leave));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping("/employees")
    @Operation(summary = "View all employees under this manager")
    public ResponseEntity<?> getMyEmployees(@CurrentUser Employee employee) {
        requireManager(employee);
        List<EmployeeResponse> employees = managerService.getMyEmployees(employee);
        return ResponseEntity.ok(new ApiResponse(true, "Success", employees));
    }

    @GetMapping("/employees/{id}/leaves")
    @Operation(summary = "View leave history of a specific employee")
    public ResponseEntity<?> getEmployeeLeaves(@PathVariable Long id,
                                                @CurrentUser Employee employee) {
        requireManager(employee);
        List<LeaveResponse> leaves = leaveService.getEmployeeLeaves(id);
        return ResponseEntity.ok(new ApiResponse(true, "Success", leaves));
    }

    private void requireManager(Employee employee) {
        if (employee.getRole() != Role.MANAGER) {
            throw new AccessDeniedException("Manager access required");
        }
    }
}

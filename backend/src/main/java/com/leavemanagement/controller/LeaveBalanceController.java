package com.leavemanagement.controller;

import com.leavemanagement.dto.ApiResponse;
import com.leavemanagement.dto.LeaveBalanceResponse;
import com.leavemanagement.dto.UpdateLeaveBalanceRequest;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.security.CurrentUser;
import com.leavemanagement.service.LeaveBalanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-balances")
@Tag(name = "Leave Balances", description = "Leave balance tracking endpoints")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get my leave balances for current year")
    public ResponseEntity<?> getMyBalances(@CurrentUser Employee employee) {
        List<LeaveBalanceResponse> balances = leaveBalanceService.getMyBalances(employee.getId());
        return ResponseEntity.ok(new com.leavemanagement.dto.ApiResponse(true, "Success", balances));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get leave balances for a specific employee (manager only)")
    public ResponseEntity<?> getEmployeeBalances(@PathVariable Long employeeId,
                                                  @CurrentUser Employee employee) {
        if (employee.getRole() != Role.MANAGER) {
            return ResponseEntity.status(403)
                .body(new com.leavemanagement.dto.ApiResponse(false, "Manager access required", null));
        }
        List<LeaveBalanceResponse> balances = leaveBalanceService.getEmployeeBalances(employeeId);
        return ResponseEntity.ok(new com.leavemanagement.dto.ApiResponse(true, "Success", balances));
    }

    @GetMapping("/team")
    @Operation(summary = "Get leave balances for all team members (manager only)")
    public ResponseEntity<?> getTeamBalances(@CurrentUser Employee employee) {
        if (employee.getRole() != Role.MANAGER) {
            return ResponseEntity.status(403)
                .body(new com.leavemanagement.dto.ApiResponse(false, "Manager access required", null));
        }
        List<LeaveBalanceResponse> balances = leaveBalanceService.getTeamBalances(employee.getId());
        return ResponseEntity.ok(new com.leavemanagement.dto.ApiResponse(true, "Success", balances));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update leave balance for a team member (manager only)")
    public ResponseEntity<?> updateBalance(@PathVariable Long id,
                                            @RequestBody UpdateLeaveBalanceRequest request,
                                            @CurrentUser Employee employee) {
        if (employee.getRole() != Role.MANAGER) {
            return ResponseEntity.status(403)
                .body(new com.leavemanagement.dto.ApiResponse(false, "Manager access required", null));
        }
        try {
            LeaveBalanceResponse balance = leaveBalanceService.updateBalance(id, request);
            return ResponseEntity.ok(new com.leavemanagement.dto.ApiResponse(true, "Balance updated", balance));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new com.leavemanagement.dto.ApiResponse(false, e.getMessage(), null));
        }
    }
}

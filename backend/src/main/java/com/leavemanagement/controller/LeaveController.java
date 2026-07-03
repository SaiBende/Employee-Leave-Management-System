package com.leavemanagement.controller;

import com.leavemanagement.dto.*;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.security.CurrentUser;
import com.leavemanagement.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@Tag(name = "Leaves", description = "Leave request management endpoints")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @Operation(summary = "Apply for a new leave")
    public ResponseEntity<?> applyLeave(@Valid @RequestBody LeaveRequest request,
                                         @CurrentUser Employee employee) {
        try {
            LeaveResponse leave = leaveService.apply(request, employee);
            return ResponseEntity.ok(new ApiResponse(true, "Leave applied successfully", leave));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping
    @Operation(summary = "Get my leave history")
    public ResponseEntity<?> getMyLeaves(@CurrentUser Employee employee) {
        List<LeaveResponse> leaves = leaveService.getMyLeaves(employee);
        return ResponseEntity.ok(new ApiResponse(true, "Success", leaves));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get leave details by ID")
    public ResponseEntity<?> getLeaveById(@PathVariable Long id,
                                           @CurrentUser Employee employee) {
        try {
            LeaveResponse leave = leaveService.getLeaveById(id, employee);
            return ResponseEntity.ok(new ApiResponse(true, "Success", leave));
        } catch (Exception e) {
            return ResponseEntity.status(403)
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit a pending leave request")
    public ResponseEntity<?> updateLeave(@PathVariable Long id,
                                          @Valid @RequestBody LeaveRequest request,
                                          @CurrentUser Employee employee) {
        try {
            LeaveResponse leave = leaveService.updateLeave(id, request, employee);
            return ResponseEntity.ok(new ApiResponse(true, "Leave updated", leave));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a pending leave request")
    public ResponseEntity<?> cancelLeave(@PathVariable Long id,
                                          @CurrentUser Employee employee) {
        try {
            ApiResponse response = leaveService.cancelLeave(id, employee);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search/filter leave history by type or status")
    public ResponseEntity<?> searchLeaves(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @CurrentUser Employee employee) {
        List<LeaveResponse> leaves = leaveService.searchLeaves(employee, type, status);
        return ResponseEntity.ok(new ApiResponse(true, "Success", leaves));
    }
}

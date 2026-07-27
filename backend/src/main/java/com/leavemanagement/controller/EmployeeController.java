package com.leavemanagement.controller;

import com.leavemanagement.dto.*;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.security.CurrentUser;
import com.leavemanagement.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employees", description = "Employee management endpoints")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<?> getMyProfile(@CurrentUser Employee employee) {
        return ResponseEntity.ok(new ApiResponse(true, "Success",
            employeeService.getMyProfile(employee)));
    }

    @GetMapping
    @Operation(summary = "Get all employees (Admin) or team members (Manager)")
    public ResponseEntity<?> getAllEmployees(@CurrentUser Employee employee) {
        List<EmployeeResponse> employees;
        if (employee.getRole() == Role.ADMIN) {
            employees = employeeService.getAllEmployees();
        } else if (employee.getRole() == Role.MANAGER) {
            employees = employeeService.getTeamMembers(employee.getId());
        } else {
            throw new AccessDeniedException("Access denied");
        }
        return ResponseEntity.ok(new ApiResponse(true, "Success", employees));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id,
                                              @CurrentUser Employee employee) {
        try {
            EmployeeResponse emp = employeeService.getEmployeeById(id, employee);
            return ResponseEntity.ok(new ApiResponse(true, "Success", emp));
        } catch (Exception e) {
            return ResponseEntity.status(403)
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping
    @Operation(summary = "Create a new employee (Manager/Admin only)")
    public ResponseEntity<?> createEmployee(@Valid @RequestBody RegisterRequest request,
                                             @CurrentUser Employee employee) {
        if (employee.getRole() != Role.MANAGER && employee.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only managers and admins can create employees");
        }
        try {
            EmployeeResponse created = employeeService.createEmployee(request, employee);
            return ResponseEntity.ok(new ApiResponse(true, "Employee created", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee (Admin only)")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id,
                                             @RequestBody RegisterRequest request,
                                             @CurrentUser Employee employee) {
        if (employee.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can update employees");
        }
        try {
            EmployeeResponse updated = employeeService.updateEmployee(id, request);
            return ResponseEntity.ok(new ApiResponse(true, "Employee updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete employee (Admin only)")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id,
                                             @CurrentUser Employee employee) {
        if (employee.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can delete employees");
        }
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok(new ApiResponse(true, "Employee deleted", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}
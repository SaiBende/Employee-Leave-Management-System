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
    @Operation(summary = "Get all employees (Manager only)")
    public ResponseEntity<?> getAllEmployees(@CurrentUser Employee employee) {
        if (employee.getRole() != Role.MANAGER) {
            throw new AccessDeniedException("Only managers can view all employees");
        }
        List<EmployeeResponse> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(new ApiResponse(true, "Success", employees));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        EmployeeResponse emp = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Success", emp));
    }

    @PostMapping
    @Operation(summary = "Create a new employee (Manager only)")
    public ResponseEntity<?> createEmployee(@Valid @RequestBody RegisterRequest request,
                                             @CurrentUser Employee employee) {
        if (employee.getRole() != Role.MANAGER) {
            throw new AccessDeniedException("Only managers can create employees");
        }
        try {
            EmployeeResponse created = employeeService.createEmployee(request, employee);
            return ResponseEntity.ok(new ApiResponse(true, "Employee created", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}

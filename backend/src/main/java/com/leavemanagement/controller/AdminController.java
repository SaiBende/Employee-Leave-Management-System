package com.leavemanagement.controller;

import com.leavemanagement.dto.ApiResponse;
import com.leavemanagement.dto.DashboardResponse;
import com.leavemanagement.dto.DepartmentResponse;
import com.leavemanagement.dto.EmployeeResponse;
import com.leavemanagement.dto.LeaveResponse;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.security.CurrentUser;
import com.leavemanagement.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Operations", description = "Company-admin management endpoints")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get company dashboard statistics")
    public ResponseEntity<?> getDashboard(@CurrentUser Employee employee) {
        DashboardResponse dashboard = adminService.getDashboard(companyId(employee));
        return ResponseEntity.ok(new ApiResponse(true, "Success", dashboard));
    }

    @GetMapping("/employees")
    @Operation(summary = "Get all employees in the company")
    public ResponseEntity<?> getAllEmployees(@CurrentUser Employee employee) {
        List<EmployeeResponse> employees = adminService.getAllEmployees(companyId(employee));
        return ResponseEntity.ok(new ApiResponse(true, "Success", employees));
    }

    @GetMapping("/leaves")
    @Operation(summary = "Get all leave requests in the company")
    public ResponseEntity<?> getAllLeaves(@CurrentUser Employee employee) {
        List<LeaveResponse> leaves = adminService.getAllLeaves(companyId(employee));
        return ResponseEntity.ok(new ApiResponse(true, "Success", leaves));
    }

    @GetMapping("/departments")
    @Operation(summary = "Get all departments in the company")
    public ResponseEntity<?> getAllDepartments(@CurrentUser Employee employee) {
        List<DepartmentResponse> departments =
            adminService.getAllDepartments(companyId(employee));
        return ResponseEntity.ok(new ApiResponse(true, "Success", departments));
    }

    @PostMapping("/departments")
    @Operation(summary = "Create a new department in the company")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, String> body,
                                               @CurrentUser Employee employee) {
        try {
            DepartmentResponse dept = adminService.createDepartment(
                body.get("name"), companyId(employee));
            return ResponseEntity.ok(new ApiResponse(true, "Department created", dept));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/departments/{id}")
    @Operation(summary = "Delete a department from the company")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id,
                                               @CurrentUser Employee employee) {
        try {
            adminService.deleteDepartment(id, companyId(employee));
            return ResponseEntity.ok(new ApiResponse(true, "Department deleted", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    private Long companyId(Employee employee) {
        if (employee == null || employee.getCompany() == null) {
            throw new AccessDeniedException("Company admin account required");
        }
        return employee.getCompany().getId();
    }
}

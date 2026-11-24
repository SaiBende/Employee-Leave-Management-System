package com.leavemanagement.controller;

import com.leavemanagement.dto.ApiResponse;
import com.leavemanagement.dto.DepartmentResponse;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@Tag(name = "Departments", description = "Company-scoped department endpoints")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    @Operation(summary = "Get all departments in the current user's company")
    public ResponseEntity<?> getAllDepartments(@CurrentUser Employee employee) {
        if (employee.getCompany() == null) {
            return ResponseEntity.ok(new ApiResponse(true, "Success", List.of()));
        }

        List<DepartmentResponse> departments = departmentRepository
            .findByCompanyIdOrderByNameAsc(employee.getCompany().getId())
            .stream()
            .map(DepartmentResponse::from)
            .toList();

        return ResponseEntity.ok(new ApiResponse(true, "Success", departments));
    }
}

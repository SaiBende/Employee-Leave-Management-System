package com.leavemanagement.controller;

import com.leavemanagement.dto.ApiResponse;
import com.leavemanagement.entity.Department;
import com.leavemanagement.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@Tag(name = "Departments", description = "Department endpoints")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    @Operation(summary = "Get all departments")
    public ResponseEntity<?> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return ResponseEntity.ok(new ApiResponse(true, "Success", departments));
    }
}

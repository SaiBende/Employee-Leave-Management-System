package com.leavemanagement.service;

import com.leavemanagement.dto.EmployeeResponse;
import com.leavemanagement.dto.RegisterRequest;
import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
            .map(this::toResponse).toList();
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        return toResponse(employee);
    }

    public EmployeeResponse createEmployee(RegisterRequest request, Employee manager) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        Role role = Role.valueOf(request.getRole().toUpperCase());

        Employee employee = Employee.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .department(department)
            .role(role)
            .manager(manager.getRole() == Role.MANAGER ? manager : null)
            .build();

        employee = employeeRepository.save(employee);
        return toResponse(employee);
    }

    public EmployeeResponse getMyProfile(Employee employee) {
        return toResponse(employee);
    }

    private EmployeeResponse toResponse(Employee emp) {
        return EmployeeResponse.builder()
            .id(emp.getId())
            .name(emp.getName())
            .email(emp.getEmail())
            .department(emp.getDepartment().getName())
            .role(emp.getRole().name())
            .managerId(emp.getManager() != null ? emp.getManager().getId() : null)
            .managerName(emp.getManager() != null ? emp.getManager().getName() : null)
            .createdAt(emp.getCreatedAt())
            .build();
    }
}

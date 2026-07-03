package com.leavemanagement.service;

import com.leavemanagement.dto.*;
import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(EmployeeRepository employeeRepository,
                       DepartmentRepository departmentRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
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
            .build();

        employee = employeeRepository.save(employee);

        String token = jwtService.generateToken(employee.getEmail(), employee.getId(), employee.getRole().name());

        return new AuthResponse(token, employee.getId(), employee.getName(),
            employee.getEmail(), employee.getRole().name(), department.getName());
    }

    public AuthResponse login(LoginRequest request) {
        Employee employee = employeeRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(employee.getEmail(), employee.getId(), employee.getRole().name());

        return new AuthResponse(token, employee.getId(), employee.getName(),
            employee.getEmail(), employee.getRole().name(), employee.getDepartment().getName());
    }
}

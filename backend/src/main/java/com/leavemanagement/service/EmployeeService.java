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

    public List<EmployeeResponse> getTeamMembers(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream()
            .map(this::toResponse).toList();
    }

    public EmployeeResponse getEmployeeById(Long id, Employee currentUser) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (!employee.getId().equals(currentUser.getId())
            && !isManagerOf(currentUser, employee)
            && currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("Access denied");
        }

        return toResponse(employee);
    }

    public EmployeeResponse createEmployee(RegisterRequest request, Employee creator) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        Role role = Role.valueOf(request.getRole().toUpperCase());

        Employee manager = null;
        if (creator.getRole() == Role.MANAGER) {
            manager = creator;
        } else if (creator.getRole() == Role.ADMIN && request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId()).orElse(null);
        }

        Employee employee = Employee.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .department(department)
            .role(role)
            .manager(manager)
            .build();

        employee = employeeRepository.save(employee);
        return toResponse(employee);
    }

    public EmployeeResponse updateEmployee(Long id, RegisterRequest request) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            employee.setDepartment(department);
        }
        if (request.getRole() != null) {
            employee.setRole(Role.valueOf(request.getRole().toUpperCase()));
        }
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId()).orElse(null);
            employee.setManager(manager);
        }

        employee = employeeRepository.save(employee);
        return toResponse(employee);
    }

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new IllegalArgumentException("Employee not found");
        }
        employeeRepository.deleteById(id);
    }

    public EmployeeResponse getMyProfile(Employee employee) {
        return toResponse(employee);
    }

    private boolean isManagerOf(Employee manager, Employee employee) {
        return employee.getManager() != null
            && employee.getManager().getId().equals(manager.getId());
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
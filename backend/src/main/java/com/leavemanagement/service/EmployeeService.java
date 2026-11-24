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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           LeaveBalanceService leaveBalanceService,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveBalanceService = leaveBalanceService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees(Long companyId) {
        return employeeRepository.findByCompanyIdOrderByNameAsc(companyId).stream()
            .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getTeamMembers(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream()
            .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id, Employee currentUser) {
        Long companyId = requireCompanyId(currentUser);

        Employee employee = employeeRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (!employee.getId().equals(currentUser.getId())
            && !isManagerOf(currentUser, employee)
            && currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("Access denied");
        }

        return toResponse(employee);
    }

    public EmployeeResponse createEmployee(RegisterRequest request, Employee creator) {
        Long companyId = requireCompanyId(creator);
        String email = normalizeEmail(request.getEmail());

        if (employeeRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        Department department = departmentRepository
            .findByIdAndCompanyId(request.getDepartmentId(), companyId)
            .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        Role role;
        Employee manager = null;

        if (creator.getRole() == Role.MANAGER) {
            // Managers can only create employees, and those employees report to them.
            role = Role.EMPLOYEE;
            manager = creator;
        } else if (creator.getRole() == Role.ADMIN) {
            role = parseAssignableRole(request.getRole());
            if (request.getManagerId() != null && request.getManagerId() > 0) {
                manager = employeeRepository
                    .findByIdAndCompanyId(request.getManagerId(), companyId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
                if (manager.getRole() != Role.MANAGER) {
                    throw new IllegalArgumentException("Selected manager must have the MANAGER role");
                }
            }
        } else {
            throw new SecurityException("Only managers and admins can create employees");
        }

        Employee employee = Employee.builder()
            .name(request.getName().trim())
            .email(email)
            .password(passwordEncoder.encode(request.getPassword()))
            .company(creator.getCompany())
            .department(department)
            .role(role)
            .manager(manager)
            .mustChangePassword(true)
            .build();

        employee = employeeRepository.save(employee);
        leaveBalanceService.initializeDefaults(employee);
        return toResponse(employee);
    }

    public EmployeeResponse updateEmployee(Long id, RegisterRequest request, Employee currentUser) {
        Long companyId = requireCompanyId(currentUser);

        if (currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("Only admins can update employees");
        }

        Employee employee = employeeRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            employee.setName(request.getName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = normalizeEmail(request.getEmail());
            if (!email.equals(employee.getEmail()) && employeeRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email already registered");
            }
            employee.setEmail(email);
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
            employee.setMustChangePassword(true);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository
                .findByIdAndCompanyId(request.getDepartmentId(), companyId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            employee.setDepartment(department);
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            if (employee.getRole() == Role.ADMIN) {
                // The company must always keep its admin account. Allow the role
                // field to be echoed back unchanged, but never demote an admin.
                if (!"ADMIN".equalsIgnoreCase(request.getRole().trim())) {
                    throw new IllegalArgumentException("Company admin role cannot be changed");
                }
            } else {
                employee.setRole(parseAssignableRole(request.getRole()));
            }
        }

        if (request.getManagerId() != null) {
            if (request.getManagerId() <= 0) {
                employee.setManager(null);
            } else {
                Employee manager = employeeRepository
                    .findByIdAndCompanyId(request.getManagerId(), companyId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
                if (manager.getRole() != Role.MANAGER) {
                    throw new IllegalArgumentException("Selected manager must have the MANAGER role");
                }
                employee.setManager(manager);
            }
        }

        employee = employeeRepository.save(employee);
        return toResponse(employee);
    }

    public void deleteEmployee(Long id, Employee currentUser) {
        Long companyId = requireCompanyId(currentUser);

        if (currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("Only admins can delete employees");
        }

        Employee employee = employeeRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (employee.getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You cannot delete your own account");
        }
        if (employee.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Company admin accounts cannot be deleted here");
        }

        employeeRepository.delete(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getMyProfile(Employee employee) {
        return toResponse(employee);
    }

    private boolean isManagerOf(Employee manager, Employee employee) {
        return employee.getManager() != null
            && employee.getManager().getId().equals(manager.getId());
    }

    private Role parseAssignableRole(String role) {
        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException("Role must be EMPLOYEE or MANAGER");
        }

        Role parsed;
        try {
            parsed = Role.valueOf(role.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Role must be EMPLOYEE or MANAGER");
        }

        if (parsed == Role.ADMIN || parsed == Role.SUPER_ADMIN) {
            throw new IllegalArgumentException(
                "Admin accounts cannot be created through this endpoint");
        }
        return parsed;
    }

    private Long requireCompanyId(Employee employee) {
        if (employee == null || employee.getCompany() == null) {
            throw new SecurityException("Account is not linked to a company");
        }
        return employee.getCompany().getId();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private EmployeeResponse toResponse(Employee emp) {
        return EmployeeResponse.builder()
            .id(emp.getId())
            .name(emp.getName())
            .email(emp.getEmail())
            .department(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
            .role(emp.getRole().name())
            .mustChangePassword(emp.isMustChangePassword())
            .companyId(emp.getCompany() != null ? emp.getCompany().getId() : null)
            .companyName(emp.getCompany() != null ? emp.getCompany().getName() : null)
            .companySlug(emp.getCompany() != null ? emp.getCompany().getSlug() : null)
            .managerId(emp.getManager() != null ? emp.getManager().getId() : null)
            .managerName(emp.getManager() != null ? emp.getManager().getName() : null)
            .createdAt(emp.getCreatedAt())
            .build();
    }
}

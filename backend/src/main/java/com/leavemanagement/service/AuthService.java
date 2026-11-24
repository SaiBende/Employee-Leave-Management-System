package com.leavemanagement.service;

import com.leavemanagement.dto.AuthResponse;
import com.leavemanagement.dto.ChangePasswordRequest;
import com.leavemanagement.dto.LoginRequest;
import com.leavemanagement.dto.SetupRequest;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.exception.PortalMismatchException;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(EmployeeRepository employeeRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public boolean needsSetup() {
        return !employeeRepository.existsByRole(Role.SUPER_ADMIN);
    }

    /**
     * Creates the platform owner account. This account is not attached to any
     * company and can only be created once.
     */
    @Transactional
    public synchronized AuthResponse setup(SetupRequest request) {
        if (employeeRepository.existsByRole(Role.SUPER_ADMIN)) {
            throw new IllegalStateException("Platform setup is already complete");
        }

        String email = normalizeEmail(request.getEmail());
        if (employeeRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        Employee superAdmin = employeeRepository.save(Employee.builder()
            .name(request.getName().trim())
            .email(email)
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.SUPER_ADMIN)
            .company(null)
            .department(null)
            .build());

        return toAuthResponse(superAdmin);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        Employee employee = employeeRepository.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (employee.getRole() != Role.SUPER_ADMIN && employee.getCompany() == null) {
            throw new IllegalStateException(
                "This account is not linked to a company. Contact the platform administrator.");
        }

        if (employee.getCompany() != null && !employee.getCompany().isActive()) {
            throw new IllegalStateException(
                "This company account is suspended. Contact the platform administrator.");
        }

        Role expectedRole = expectedRole(request.getPortal());
        if (expectedRole != employee.getRole()) {
            throw new PortalMismatchException(
                "This account is registered as " + roleLabel(employee.getRole())
                    + ". Use the " + roleLabel(employee.getRole()) + " portal to sign in.",
                employee.getRole());
        }

        return toAuthResponse(employee);
    }

    @Transactional
    public void changePassword(Employee employee, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), employee.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), employee.getPassword())) {
            throw new IllegalArgumentException("New password must be different from the current password");
        }

        employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
        employee.setMustChangePassword(false);
        employeeRepository.save(employee);
    }

    private AuthResponse toAuthResponse(Employee employee) {
        Long companyId = employee.getCompany() != null ? employee.getCompany().getId() : null;
        String token = jwtService.generateToken(
            employee.getEmail(),
            employee.getId(),
            employee.getRole().name(),
            companyId
        );

        return AuthResponse.builder()
            .token(token)
            .id(employee.getId())
            .name(employee.getName())
            .email(employee.getEmail())
            .role(employee.getRole().name())
            .department(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
            .companyId(companyId)
            .companyName(employee.getCompany() != null ? employee.getCompany().getName() : null)
            .companySlug(employee.getCompany() != null ? employee.getCompany().getSlug() : null)
            .mustChangePassword(employee.isMustChangePassword())
            .build();
    }

    private Role expectedRole(String portal) {
        if (portal == null || portal.isBlank()) {
            throw new IllegalArgumentException("Login portal is required");
        }

        return switch (portal.trim().toUpperCase(Locale.ROOT)) {
            case "PLATFORM" -> Role.SUPER_ADMIN;
            case "ADMIN" -> Role.ADMIN;
            case "MANAGER" -> Role.MANAGER;
            case "EMPLOYEE" -> Role.EMPLOYEE;
            default -> throw new IllegalArgumentException("Unknown login portal");
        };
    }

    private String roleLabel(Role role) {
        return switch (role) {
            case SUPER_ADMIN -> "Platform Admin";
            case ADMIN -> "Company Admin";
            case MANAGER -> "Manager";
            case EMPLOYEE -> "Employee";
        };
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

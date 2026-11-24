package com.leavemanagement.service;

import com.leavemanagement.dto.*;
import com.leavemanagement.entity.Company;
import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.CompanyRepository;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class CompanyService {

    private static final List<String> DEFAULT_DEPARTMENTS = List.of(
        "General",
        "Engineering",
        "Human Resources",
        "Marketing",
        "Finance",
        "Operations"
    );

    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRepository leaveRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final PasswordEncoder passwordEncoder;

    public CompanyService(CompanyRepository companyRepository,
                          EmployeeRepository employeeRepository,
                          DepartmentRepository departmentRepository,
                          LeaveRepository leaveRepository,
                          LeaveBalanceService leaveBalanceService,
                          PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRepository = leaveRepository;
        this.leaveBalanceService = leaveBalanceService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public synchronized CompanySignupResponse signupCompany(CompanySignupRequest request) {
        if (!employeeRepository.existsByRole(Role.SUPER_ADMIN)) {
            throw new IllegalStateException(
                "Platform setup is not complete. Ask the platform administrator to initialize the system.");
        }

        Company company = createCompanyWithAdmin(
            request.getCompanyName(),
            request.getName(),
            request.getEmail(),
            request.getPassword(),
            false
        );

        return CompanySignupResponse.builder()
            .companyId(company.getId())
            .companyName(company.getName())
            .adminEmail(normalizeEmail(request.getEmail()))
            .build();
    }

    @Transactional
    public synchronized CompanyResponse createCompany(CreateCompanyRequest request) {
        Company company = createCompanyWithAdmin(
            request.getCompanyName(),
            request.getAdminName(),
            request.getAdminEmail(),
            request.getAdminPassword(),
            true
        );
        return toResponse(company);
    }

    private Company createCompanyWithAdmin(String companyName,
                                           String adminName,
                                           String adminEmail,
                                           String adminPassword,
                                           boolean temporaryPassword) {
        String email = normalizeEmail(adminEmail);
        if (employeeRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        Company company = companyRepository.save(Company.builder()
            .name(companyName.trim())
            .slug(nextAvailableSlug(companyName))
            .active(true)
            .build());

        Department general = null;
        for (String departmentName : DEFAULT_DEPARTMENTS) {
            Department department = departmentRepository.save(Department.builder()
                .name(departmentName)
                .company(company)
                .build());
            if (general == null) {
                general = department;
            }
        }

        Employee admin = employeeRepository.save(Employee.builder()
            .name(adminName.trim())
            .email(email)
            .password(passwordEncoder.encode(adminPassword))
            .company(company)
            .department(general)
            .role(Role.ADMIN)
            .mustChangePassword(temporaryPassword)
            .build());

        leaveBalanceService.initializeDefaults(admin);
        return company;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompany(Long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        return toResponse(company);
    }

    @Transactional
    public CompanyResponse updateStatus(Long id, boolean active) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        company.setActive(active);
        return toResponse(companyRepository.save(company));
    }

    @Transactional(readOnly = true)
    public PlatformDashboardResponse getDashboard() {
        return PlatformDashboardResponse.builder()
            .totalCompanies(companyRepository.count())
            .activeCompanies(companyRepository.countByActiveTrue())
            .totalEmployees(employeeRepository.countByRoleNot(Role.SUPER_ADMIN))
            .totalLeaves(leaveRepository.count())
            .build();
    }

    private CompanyResponse toResponse(Company company) {
        Employee admin = employeeRepository
            .findFirstByCompanyIdAndRole(company.getId(), Role.ADMIN)
            .orElse(null);

        return CompanyResponse.builder()
            .id(company.getId())
            .name(company.getName())
            .slug(company.getSlug())
            .active(company.isActive())
            .adminName(admin != null ? admin.getName() : null)
            .adminEmail(admin != null ? admin.getEmail() : null)
            .employeeCount(employeeRepository.countByCompanyId(company.getId()))
            .departmentCount(departmentRepository.countByCompanyId(company.getId()))
            .createdAt(company.getCreatedAt())
            .build();
    }

    private String nextAvailableSlug(String companyName) {
        String base = slugify(companyName);
        String candidate = base;
        int suffix = 2;
        while (companyRepository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");

        return normalized.isBlank() ? "company" : normalized;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

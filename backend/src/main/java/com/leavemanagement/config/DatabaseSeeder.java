package com.leavemanagement.config;

import com.leavemanagement.entity.Company;
import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.LeaveBalance;
import com.leavemanagement.enums.LeaveType;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.CompanyRepository;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveBalanceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Development-only demo data. Production starts empty and uses the setup and
 * company signup flows.
 */
@Component
@Profile("dev")
public class DatabaseSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public DatabaseSeeder(CompanyRepository companyRepository,
                          DepartmentRepository departmentRepository,
                          EmployeeRepository employeeRepository,
                          PasswordEncoder passwordEncoder,
                          LeaveBalanceRepository leaveBalanceRepository) {
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.leaveBalanceRepository = leaveBalanceRepository;
    }

    @Override
    public void run(String... args) {
        if (companyRepository.count() > 0) {
            return;
        }

        Company demo = companyRepository.save(Company.builder()
            .name("Demo Company")
            .slug("demo-company")
            .active(true)
            .build());

        Department engineering = departmentRepository.save(Department.builder()
            .name("Engineering").company(demo).build());
        Department hr = departmentRepository.save(Department.builder()
            .name("Human Resources").company(demo).build());
        Department general = departmentRepository.save(Department.builder()
            .name("General").company(demo).build());

        if (!employeeRepository.existsByRole(Role.SUPER_ADMIN)) {
            employeeRepository.save(Employee.builder()
                .name("Platform Owner")
                .email("platform@demo.com")
                .password(passwordEncoder.encode("Platform@123"))
                .role(Role.SUPER_ADMIN)
                .build());
        }

        String password = passwordEncoder.encode("password123");

        Employee admin = employeeRepository.save(Employee.builder()
            .name("Demo Admin")
            .email("admin@demo.com")
            .password(passwordEncoder.encode("Admin@123"))
            .company(demo)
            .department(general)
            .role(Role.ADMIN)
            .build());

        Employee alice = employeeRepository.save(Employee.builder()
            .name("Alice Manager").email("alice@demo.com")
            .password(password).company(demo).department(engineering)
            .role(Role.MANAGER).build());

        Employee bob = employeeRepository.save(Employee.builder()
            .name("Bob Manager").email("bob@demo.com")
            .password(password).company(demo).department(hr)
            .role(Role.MANAGER).build());

        Employee charlie = employeeRepository.save(Employee.builder()
            .name("Charlie Employee").email("charlie@demo.com")
            .password(password).company(demo).department(engineering)
            .role(Role.EMPLOYEE).manager(alice).build());

        Employee diana = employeeRepository.save(Employee.builder()
            .name("Diana Employee").email("diana@demo.com")
            .password(password).company(demo).department(engineering)
            .role(Role.EMPLOYEE).manager(bob).build());

        initLeaveBalances(admin, alice, bob, charlie, diana);
    }

    private void initLeaveBalances(Employee... employees) {
        int year = java.time.Year.now().getValue();
        for (Employee emp : employees) {
            leaveBalanceRepository.save(LeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.ANNUAL).totalDays(20).usedDays(0).year(year).build());
            leaveBalanceRepository.save(LeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.SICK).totalDays(12).usedDays(0).year(year).build());
            leaveBalanceRepository.save(LeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.PERSONAL).totalDays(5).usedDays(0).year(year).build());
        }
    }
}

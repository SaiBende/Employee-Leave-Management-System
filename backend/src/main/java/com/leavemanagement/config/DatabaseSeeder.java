package com.leavemanagement.config;

import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(DepartmentRepository departmentRepository,
                          EmployeeRepository employeeRepository,
                          PasswordEncoder passwordEncoder) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            Department eng = departmentRepository.save(
                Department.builder().name("Engineering").build());
            Department hr = departmentRepository.save(
                Department.builder().name("Human Resources").build());
            departmentRepository.save(Department.builder().name("Marketing").build());
            departmentRepository.save(Department.builder().name("Finance").build());
            departmentRepository.save(Department.builder().name("Operations").build());

            String password = passwordEncoder.encode("password123");

            Employee alice = employeeRepository.save(Employee.builder()
                .name("Alice Manager").email("alice@company.com")
                .password(password).department(eng).role(Role.MANAGER).build());

            Employee bob = employeeRepository.save(Employee.builder()
                .name("Bob Manager").email("bob@company.com")
                .password(password).department(hr).role(Role.MANAGER).build());

            employeeRepository.save(Employee.builder()
                .name("Charlie Employee").email("charlie@company.com")
                .password(password).department(eng).role(Role.EMPLOYEE).manager(alice).build());

            employeeRepository.save(Employee.builder()
                .name("Diana Employee").email("diana@company.com")
                .password(password).department(eng).role(Role.EMPLOYEE).manager(bob).build());
        }
    }
}

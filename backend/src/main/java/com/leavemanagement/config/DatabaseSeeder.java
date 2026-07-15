package com.leavemanagement.config;

import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.LeaveBalance;
import com.leavemanagement.enums.LeaveType;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveBalanceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public DatabaseSeeder(DepartmentRepository departmentRepository,
                          EmployeeRepository employeeRepository,
                          PasswordEncoder passwordEncoder,
                          LeaveBalanceRepository leaveBalanceRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.leaveBalanceRepository = leaveBalanceRepository;
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

            Employee charlie = employeeRepository.save(Employee.builder()
                .name("Charlie Employee").email("charlie@company.com")
                .password(password).department(eng).role(Role.EMPLOYEE).manager(alice).build());

            employeeRepository.save(Employee.builder()
                .name("Diana Employee").email("diana@company.com")
                .password(password).department(eng).role(Role.EMPLOYEE).manager(bob).build());

            initLeaveBalances(alice, bob, charlie);
        }
    }

    private void initLeaveBalances(Employee alice, Employee bob, Employee charlie) {
        int year = java.time.Year.now().getValue();
        for (Employee emp : new Employee[]{alice, bob, charlie}) {
            leaveBalanceRepository.save(LeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.ANNUAL).totalDays(20).usedDays(0).year(year).build());
            leaveBalanceRepository.save(LeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.SICK).totalDays(12).usedDays(0).year(year).build());
            leaveBalanceRepository.save(LeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.PERSONAL).totalDays(5).usedDays(0).year(year).build());
        }
    }
}
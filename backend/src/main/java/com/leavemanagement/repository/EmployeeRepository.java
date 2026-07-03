package com.leavemanagement.repository;

import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    List<Employee> findByRole(Role role);
    List<Employee> findByManagerId(Long managerId);
    boolean existsByEmail(String email);
}

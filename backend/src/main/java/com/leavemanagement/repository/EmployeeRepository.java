package com.leavemanagement.repository;

import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    @EntityGraph(attributePaths = {"company", "department", "manager"})
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByIdAndCompanyId(Long id, Long companyId);
    Optional<Employee> findFirstByCompanyIdAndRole(Long companyId, Role role);
    List<Employee> findByRole(Role role);
    List<Employee> findByCompanyIdOrderByNameAsc(Long companyId);
    List<Employee> findByCompanyIdAndRole(Long companyId, Role role);
    List<Employee> findByManagerId(Long managerId);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
    long countByCompanyId(Long companyId);
    long countByRoleNot(Role role);
}

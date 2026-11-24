package com.leavemanagement.repository;

import com.leavemanagement.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    Optional<Department> findByIdAndCompanyId(Long id, Long companyId);
    Optional<Department> findByCompanyIdAndName(Long companyId, String name);
    List<Department> findByCompanyIdOrderByNameAsc(Long companyId);
    long countByCompanyId(Long companyId);
}

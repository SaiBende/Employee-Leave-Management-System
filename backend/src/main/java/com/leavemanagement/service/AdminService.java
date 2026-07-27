package com.leavemanagement.service;

import com.leavemanagement.dto.DashboardResponse;
import com.leavemanagement.dto.EmployeeResponse;
import com.leavemanagement.dto.LeaveResponse;
import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Leave;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRepository leaveRepository;
    private final DepartmentRepository departmentRepository;

    public AdminService(EmployeeRepository employeeRepository,
                        LeaveRepository leaveRepository,
                        DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRepository = leaveRepository;
        this.departmentRepository = departmentRepository;
    }

    public DashboardResponse getDashboard() {
        List<Employee> allEmployees = employeeRepository.findAll();
        List<Leave> allLeaves = leaveRepository.findAll();

        return DashboardResponse.builder()
            .totalEmployees(allEmployees.size())
            .totalLeaves(allLeaves.size())
            .pendingApprovals(allLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.PENDING).count())
            .approvedLeaves(allLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.APPROVED).count())
            .rejectedLeaves(allLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.REJECTED).count())
            .recentActivities(allLeaves.stream().limit(10)
                .map(l -> LeaveResponse.builder()
                    .id(l.getId())
                    .employeeId(l.getEmployee().getId())
                    .employeeName(l.getEmployee().getName())
                    .leaveType(l.getLeaveType().name())
                    .startDate(l.getStartDate())
                    .endDate(l.getEndDate())
                    .reason(l.getReason())
                    .status(l.getStatus().name())
                    .createdAt(l.getCreatedAt())
                    .build())
                .toList())
            .build();
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
            .map(this::toEmployeeResponse).toList();
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department createDepartment(String name) {
        if (departmentRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Department already exists");
        }
        return departmentRepository.save(Department.builder().name(name).build());
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    private EmployeeResponse toEmployeeResponse(Employee emp) {
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
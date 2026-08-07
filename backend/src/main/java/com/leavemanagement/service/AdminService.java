package com.leavemanagement.service;

import com.leavemanagement.dto.DashboardResponse;
import com.leavemanagement.dto.DepartmentResponse;
import com.leavemanagement.dto.EmployeeResponse;
import com.leavemanagement.dto.LeaveCommentResponse;
import com.leavemanagement.dto.LeaveResponse;
import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Leave;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveCommentRepository;
import com.leavemanagement.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class AdminService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRepository leaveRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveCommentRepository commentRepository;

    public AdminService(EmployeeRepository employeeRepository,
                        LeaveRepository leaveRepository,
                        DepartmentRepository departmentRepository,
                        LeaveCommentRepository commentRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRepository = leaveRepository;
        this.departmentRepository = departmentRepository;
        this.commentRepository = commentRepository;
    }

    public List<LeaveResponse> getAllLeaves() {
        return leaveRepository.findAll().stream()
            .sorted(Comparator.comparing(Leave::getCreatedAt).reversed())
            .map(l -> LeaveResponse.builder()
                .id(l.getId())
                .employeeId(l.getEmployee().getId())
                .employeeName(l.getEmployee().getName())
                .employeeRole(l.getEmployee().getRole().name())
                .leaveType(l.getLeaveType().name())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .reason(l.getReason())
                .status(l.getStatus().name())
                .managerComments(l.getManagerComments())
                .decidedById(l.getDecidedBy() != null ? l.getDecidedBy().getId() : null)
                .decidedByName(l.getDecidedBy() != null ? l.getDecidedBy().getName() : null)
                .decidedAt(l.getDecidedAt())
                .createdAt(l.getCreatedAt())
                .updatedAt(l.getUpdatedAt())
                .comments(commentRepository.findByLeaveIdOrderByCreatedAtAsc(l.getId())
                    .stream().map(LeaveCommentResponse::from).toList())
                .build())
            .toList();
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
                    .managerComments(l.getManagerComments())
                    .decidedByName(l.getDecidedBy() != null ? l.getDecidedBy().getName() : null)
                    .decidedAt(l.getDecidedAt())
                    .createdAt(l.getCreatedAt())
                    .build())
                .toList())
            .build();
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
            .map(this::toEmployeeResponse).toList();
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
            .map(DepartmentResponse::from).toList();
    }

    public DepartmentResponse createDepartment(String name) {
        if (departmentRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Department already exists");
        }
        return DepartmentResponse.from(departmentRepository.save(Department.builder().name(name).build()));
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
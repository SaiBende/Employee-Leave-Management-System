package com.leavemanagement.service;

import com.leavemanagement.dto.DashboardResponse;
import com.leavemanagement.dto.DepartmentResponse;
import com.leavemanagement.dto.EmployeeResponse;
import com.leavemanagement.dto.LeaveCommentResponse;
import com.leavemanagement.dto.LeaveResponse;
import com.leavemanagement.entity.Company;
import com.leavemanagement.entity.Department;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Leave;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.repository.CompanyRepository;
import com.leavemanagement.repository.DepartmentRepository;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveCommentRepository;
import com.leavemanagement.repository.LeaveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRepository leaveRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveCommentRepository commentRepository;
    private final CompanyRepository companyRepository;

    public AdminService(EmployeeRepository employeeRepository,
                        LeaveRepository leaveRepository,
                        DepartmentRepository departmentRepository,
                        LeaveCommentRepository commentRepository,
                        CompanyRepository companyRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRepository = leaveRepository;
        this.departmentRepository = departmentRepository;
        this.commentRepository = commentRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public List<LeaveResponse> getAllLeaves(Long companyId) {
        return leaveRepository.findByEmployeeCompanyIdOrderByCreatedAtDesc(companyId)
            .stream()
            .map(this::toLeaveResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long companyId) {
        List<Leave> companyLeaves =
            leaveRepository.findByEmployeeCompanyIdOrderByCreatedAtDesc(companyId);

        return DashboardResponse.builder()
            .totalEmployees(employeeRepository.countByCompanyId(companyId))
            .totalLeaves(companyLeaves.size())
            .pendingApprovals(companyLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.PENDING).count())
            .approvedLeaves(companyLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.APPROVED).count())
            .rejectedLeaves(companyLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.REJECTED).count())
            .recentActivities(companyLeaves.stream()
                .limit(10)
                .map(this::toRecentLeaveResponse)
                .toList())
            .build();
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees(Long companyId) {
        return employeeRepository.findByCompanyIdOrderByNameAsc(companyId).stream()
            .map(this::toEmployeeResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments(Long companyId) {
        return departmentRepository.findByCompanyIdOrderByNameAsc(companyId).stream()
            .map(DepartmentResponse::from)
            .toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(String name, Long companyId) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Department name is required");
        }

        String trimmed = name.trim();
        if (departmentRepository.findByCompanyIdAndName(companyId, trimmed).isPresent()) {
            throw new IllegalArgumentException("Department already exists");
        }

        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        Department department = departmentRepository.save(Department.builder()
            .name(trimmed)
            .company(company)
            .build());

        return DepartmentResponse.from(department);
    }

    @Transactional
    public void deleteDepartment(Long id, Long companyId) {
        Department department = departmentRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        departmentRepository.delete(department);
    }

    private LeaveResponse toLeaveResponse(Leave leave) {
        return LeaveResponse.builder()
            .id(leave.getId())
            .employeeId(leave.getEmployee().getId())
            .employeeName(leave.getEmployee().getName())
            .employeeRole(leave.getEmployee().getRole().name())
            .leaveType(leave.getLeaveType().name())
            .startDate(leave.getStartDate())
            .endDate(leave.getEndDate())
            .reason(leave.getReason())
            .status(leave.getStatus().name())
            .managerComments(leave.getManagerComments())
            .decidedById(leave.getDecidedBy() != null ? leave.getDecidedBy().getId() : null)
            .decidedByName(leave.getDecidedBy() != null ? leave.getDecidedBy().getName() : null)
            .decidedAt(leave.getDecidedAt())
            .cancelledById(leave.getCancelledBy() != null ? leave.getCancelledBy().getId() : null)
            .cancelledByName(leave.getCancelledBy() != null ? leave.getCancelledBy().getName() : null)
            .cancelledAt(leave.getCancelledAt())
            .createdAt(leave.getCreatedAt())
            .updatedAt(leave.getUpdatedAt())
            .comments(commentRepository.findByLeaveIdOrderByCreatedAtAsc(leave.getId())
                .stream().map(LeaveCommentResponse::from).toList())
            .build();
    }

    private LeaveResponse toRecentLeaveResponse(Leave leave) {
        return LeaveResponse.builder()
            .id(leave.getId())
            .employeeId(leave.getEmployee().getId())
            .employeeName(leave.getEmployee().getName())
            .leaveType(leave.getLeaveType().name())
            .startDate(leave.getStartDate())
            .endDate(leave.getEndDate())
            .reason(leave.getReason())
            .status(leave.getStatus().name())
            .managerComments(leave.getManagerComments())
            .decidedByName(leave.getDecidedBy() != null ? leave.getDecidedBy().getName() : null)
            .decidedAt(leave.getDecidedAt())
            .createdAt(leave.getCreatedAt())
            .build();
    }

    private EmployeeResponse toEmployeeResponse(Employee emp) {
        return EmployeeResponse.builder()
            .id(emp.getId())
            .name(emp.getName())
            .email(emp.getEmail())
            .department(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
            .role(emp.getRole().name())
            .companyId(emp.getCompany() != null ? emp.getCompany().getId() : null)
            .companyName(emp.getCompany() != null ? emp.getCompany().getName() : null)
            .companySlug(emp.getCompany() != null ? emp.getCompany().getSlug() : null)
            .managerId(emp.getManager() != null ? emp.getManager().getId() : null)
            .managerName(emp.getManager() != null ? emp.getManager().getName() : null)
            .createdAt(emp.getCreatedAt())
            .build();
    }
}

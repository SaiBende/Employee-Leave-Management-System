package com.leavemanagement.service;

import com.leavemanagement.dto.*;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Leave;
import com.leavemanagement.entity.LeaveBalance;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveBalanceRepository;
import com.leavemanagement.repository.LeaveCommentRepository;
import com.leavemanagement.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ManagerService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveCommentRepository commentRepository;

    public ManagerService(LeaveRepository leaveRepository,
                          EmployeeRepository employeeRepository,
                          LeaveBalanceRepository leaveBalanceRepository,
                          LeaveCommentRepository commentRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.commentRepository = commentRepository;
    }

    public List<LeaveResponse> getPendingLeaves(Employee actor) {
        List<Leave> pending = leaveRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING);

        if (actor.getRole() == Role.ADMIN) {
            return pending.stream().map(this::toResponse).toList();
        }

        List<Long> teamIds = employeeRepository.findByManagerId(actor.getId())
            .stream().map(Employee::getId).toList();

        return pending.stream()
            .filter(l -> teamIds.contains(l.getEmployee().getId()))
            .map(this::toResponse)
            .toList();
    }

    public LeaveResponse approveLeave(Long leaveId, String comment, Employee actor) {
        Leave leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Leave is not in pending state");
        }
        ensureCanDecide(actor, leave);

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setManagerComments(comment);
        leave.setDecidedBy(actor);
        leave.setDecidedAt(java.time.LocalDateTime.now());
        leave = leaveRepository.save(leave);

        deductBalance(leave);
        addComment(leave, actor, "APPROVED" + (comment != null && !comment.isBlank() ? " - " + comment.trim() : ""));
        return toResponse(leave);
    }

    private void deductBalance(Leave leave) {
        int year = leave.getStartDate().getYear();
        int days = (int) ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
        LeaveBalance balance = leaveBalanceRepository
            .findByEmployeeIdAndLeaveTypeAndYear(leave.getEmployee().getId(), leave.getLeaveType(), year)
            .orElse(null);
        if (balance != null) {
            balance.setUsedDays(balance.getUsedDays() + days);
            leaveBalanceRepository.save(balance);
        }
    }

    public LeaveResponse rejectLeave(Long leaveId, String comments, Employee actor) {
        Leave leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Leave is not in pending state");
        }
        ensureCanDecide(actor, leave);

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setManagerComments(comments);
        leave.setDecidedBy(actor);
        leave.setDecidedAt(java.time.LocalDateTime.now());
        leave = leaveRepository.save(leave);

        addComment(leave, actor, "REJECTED" + (comments != null && !comments.isBlank() ? " - " + comments.trim() : ""));
        return toResponse(leave);
    }

    private void ensureCanDecide(Employee actor, Leave leave) {
        if (actor.getRole() == Role.ADMIN) {
            return;
        }
        if (!isTeamMember(actor, leave.getEmployee())) {
            throw new SecurityException("This leave does not belong to your team");
        }
    }

    private void addComment(Leave leave, Employee author, String comment) {
        commentRepository.save(com.leavemanagement.entity.LeaveComment.builder()
            .leave(leave)
            .author(author)
            .comment(comment)
            .build());
    }

    public List<EmployeeResponse> getMyEmployees(Employee manager) {
        return employeeRepository.findByManagerId(manager.getId())
            .stream().map(this::toEmployeeResponse).toList();
    }

    private LeaveResponse toResponse(Leave leave) {
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

    private boolean isTeamMember(Employee manager, Employee employee) {
        return employee.getManager() != null
            && employee.getManager().getId().equals(manager.getId());
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

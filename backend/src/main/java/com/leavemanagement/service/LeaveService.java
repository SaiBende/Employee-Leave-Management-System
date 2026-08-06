package com.leavemanagement.service;

import com.leavemanagement.dto.ApiResponse;
import com.leavemanagement.dto.LeaveCommentResponse;
import com.leavemanagement.dto.LeaveRequest;
import com.leavemanagement.dto.LeaveResponse;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Leave;
import com.leavemanagement.entity.LeaveComment;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.enums.LeaveType;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveCommentRepository;
import com.leavemanagement.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveCommentRepository commentRepository;

    public LeaveService(LeaveRepository leaveRepository,
                        EmployeeRepository employeeRepository,
                        LeaveCommentRepository commentRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.commentRepository = commentRepository;
    }

    public LeaveResponse apply(LeaveRequest request, Employee employee) {
        Leave leave = Leave.builder()
            .employee(employee)
            .leaveType(LeaveType.valueOf(request.getLeaveType().toUpperCase()))
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .reason(request.getReason())
            .status(LeaveStatus.PENDING)
            .build();

        leave = leaveRepository.save(leave);
        return toResponse(leave);
    }

    public List<LeaveResponse> getMyLeaves(Employee employee) {
        return leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId())
            .stream().map(this::toResponse).toList();
    }

    public LeaveResponse getLeaveById(Long id, Employee employee) {
        Leave leave = leaveRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (!leave.getEmployee().getId().equals(employee.getId())
            && !isManagerOf(employee, leave.getEmployee())
            && employee.getRole() != Role.ADMIN) {
            throw new SecurityException("Access denied");
        }

        return toResponse(leave);
    }

    public LeaveResponse updateLeave(Long id, LeaveRequest request, Employee employee) {
        Leave leave = leaveRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (!leave.getEmployee().getId().equals(employee.getId())) {
            throw new SecurityException("Access denied");
        }
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Can only edit pending leaves");
        }

        leave.setLeaveType(LeaveType.valueOf(request.getLeaveType().toUpperCase()));
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());

        leave = leaveRepository.save(leave);
        return toResponse(leave);
    }

    public ApiResponse cancelLeave(Long id, Employee employee) {
        Leave leave = leaveRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (!leave.getEmployee().getId().equals(employee.getId())) {
            throw new SecurityException("Access denied");
        }
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Can only cancel pending leaves");
        }

        leave.setStatus(LeaveStatus.CANCELLED);
        leaveRepository.save(leave);

        return new ApiResponse(true, "Leave cancelled successfully", null);
    }

    public List<LeaveResponse> searchLeaves(Employee employee, String type, String status) {
        List<Leave> leaves;

        if (type != null && !type.isBlank()) {
            LeaveType leaveType = LeaveType.valueOf(type.toUpperCase());
            leaves = leaveRepository.findByEmployeeIdAndLeaveTypeOrderByCreatedAtDesc(
                employee.getId(), leaveType);
        } else if (status != null && !status.isBlank()) {
            LeaveStatus leaveStatus = LeaveStatus.valueOf(status.toUpperCase());
            leaves = leaveRepository.findByEmployeeIdAndStatusOrderByCreatedAtDesc(
                employee.getId(), leaveStatus);
        } else {
            leaves = leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId());
        }

        return leaves.stream().map(this::toResponse).toList();
    }

    public List<LeaveResponse> getCalendarLeaves(Employee employee) {
        List<Leave> leaves;

        switch (employee.getRole()) {
            case ADMIN -> leaves = leaveRepository.findAll();
            case MANAGER -> {
                List<Long> teamIds = employeeRepository.findByManagerId(employee.getId())
                    .stream().map(Employee::getId).toList();
                leaves = teamIds.isEmpty()
                    ? List.of()
                    : leaveRepository.findByEmployeeIdIn(teamIds);
            }
            default -> leaves = leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId());
        }

        return leaves.stream().map(this::toResponse).toList();
    }

    public List<LeaveResponse> getEmployeeLeaves(Long employeeId, Employee currentUser) {
        Employee target = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (!currentUser.getId().equals(employeeId)
            && !isManagerOf(currentUser, target)
            && currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("Access denied");
        }

        return leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
            .stream().map(this::toResponse).toList();
    }

    private boolean isManagerOf(Employee manager, Employee employee) {
        return employee.getManager() != null
            && employee.getManager().getId().equals(manager.getId());
    }

    public LeaveCommentResponse addComment(Long leaveId, String comment, Employee actor) {
        if (comment == null || comment.isBlank()) {
            throw new IllegalArgumentException("Comment cannot be empty");
        }

        Leave leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (!canAccess(leave, actor)) {
            throw new SecurityException("Access denied");
        }

        LeaveComment saved = commentRepository.save(LeaveComment.builder()
            .leave(leave)
            .author(actor)
            .comment(comment.trim())
            .build());
        return LeaveCommentResponse.from(saved);
    }

    public void addSystemComment(Leave leave, String comment, Employee author) {
        commentRepository.save(LeaveComment.builder()
            .leave(leave)
            .author(author)
            .comment(comment)
            .build());
    }

    private boolean canAccess(Leave leave, Employee actor) {
        return actor.getRole() == Role.ADMIN
            || leave.getEmployee().getId().equals(actor.getId())
            || isManagerOf(actor, leave.getEmployee());
    }

    private List<LeaveCommentResponse> getComments(Long leaveId) {
        return commentRepository.findByLeaveIdOrderByCreatedAtAsc(leaveId)
            .stream().map(LeaveCommentResponse::from).toList();
    }

    private LeaveResponse toResponse(Leave leave) {
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
            .decidedById(leave.getDecidedBy() != null ? leave.getDecidedBy().getId() : null)
            .decidedByName(leave.getDecidedBy() != null ? leave.getDecidedBy().getName() : null)
            .decidedAt(leave.getDecidedAt())
            .createdAt(leave.getCreatedAt())
            .updatedAt(leave.getUpdatedAt())
            .comments(getComments(leave.getId()))
            .build();
    }
}
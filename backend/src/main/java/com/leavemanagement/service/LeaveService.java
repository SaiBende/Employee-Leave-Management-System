package com.leavemanagement.service;

import com.leavemanagement.dto.ApiResponse;
import com.leavemanagement.dto.LeaveRequest;
import com.leavemanagement.dto.LeaveResponse;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Leave;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.enums.LeaveType;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;

    public LeaveService(LeaveRepository leaveRepository) {
        this.leaveRepository = leaveRepository;
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
            && employee.getRole() != Role.MANAGER) {
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

    public List<LeaveResponse> getEmployeeLeaves(Long employeeId) {
        return leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
            .stream().map(this::toResponse).toList();
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
            .createdAt(leave.getCreatedAt())
            .updatedAt(leave.getUpdatedAt())
            .build();
    }
}
package com.leavemanagement.service;

import com.leavemanagement.dto.*;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Leave;
import com.leavemanagement.entity.LeaveBalance;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.enums.Role;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveBalanceRepository;
import com.leavemanagement.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ManagerService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public ManagerService(LeaveRepository leaveRepository,
                          EmployeeRepository employeeRepository,
                          LeaveBalanceRepository leaveBalanceRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
    }

    public List<LeaveResponse> getPendingLeaves(Employee manager) {
        List<Employee> team = employeeRepository.findByManagerId(manager.getId());
        List<Long> teamIds = team.stream().map(Employee::getId).toList();

        return leaveRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING)
            .stream()
            .filter(l -> teamIds.contains(l.getEmployee().getId()))
            .map(this::toResponse)
            .toList();
    }

    public LeaveResponse approveLeave(Long leaveId, Employee manager) {
        Leave leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Leave is not in pending state");
        }

        leave.setStatus(LeaveStatus.APPROVED);
        leave = leaveRepository.save(leave);

        deductBalance(leave);
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

    public LeaveResponse rejectLeave(Long leaveId, String comments, Employee manager) {
        Leave leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Leave is not in pending state");
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setManagerComments(comments);
        leave = leaveRepository.save(leave);
        return toResponse(leave);
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

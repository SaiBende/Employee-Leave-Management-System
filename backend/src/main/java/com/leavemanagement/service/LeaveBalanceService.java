package com.leavemanagement.service;

import com.leavemanagement.dto.LeaveBalanceResponse;
import com.leavemanagement.dto.UpdateLeaveBalanceRequest;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.LeaveBalance;
import com.leavemanagement.enums.LeaveType;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveBalanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveBalanceService(LeaveBalanceRepository leaveBalanceRepository,
                                EmployeeRepository employeeRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<LeaveBalanceResponse> getMyBalances(Long employeeId) {
        int year = java.time.Year.now().getValue();
        return leaveBalanceRepository.findByEmployeeIdAndYearOrderByLeaveType(employeeId, year)
            .stream().map(this::toResponse).toList();
    }

    public List<LeaveBalanceResponse> getEmployeeBalances(Long employeeId) {
        int year = java.time.Year.now().getValue();
        return leaveBalanceRepository.findByEmployeeIdAndYearOrderByLeaveType(employeeId, year)
            .stream().map(this::toResponse).toList();
    }

    public List<LeaveBalanceResponse> getTeamBalances(Long managerId) {
        int year = java.time.Year.now().getValue();
        List<Long> teamIds = employeeRepository.findByManagerId(managerId)
            .stream().map(com.leavemanagement.entity.Employee::getId).toList();
        if (teamIds.isEmpty()) return List.of();
        return leaveBalanceRepository.findByEmployeeIdInAndYear(teamIds, year)
            .stream().map(this::toResponse).toList();
    }

    public LeaveBalanceResponse updateBalance(Long balanceId, UpdateLeaveBalanceRequest request) {
        LeaveBalance balance = leaveBalanceRepository.findById(balanceId)
            .orElseThrow(() -> new IllegalArgumentException("Leave balance not found"));
        balance.setTotalDays(request.getTotalDays());
        balance.setUsedDays(request.getUsedDays());
        balance = leaveBalanceRepository.save(balance);
        return toResponse(balance);
    }

    private LeaveBalanceResponse toResponse(LeaveBalance balance) {
        return LeaveBalanceResponse.builder()
            .id(balance.getId())
            .employeeId(balance.getEmployee().getId())
            .employeeName(balance.getEmployee().getName())
            .leaveType(balance.getLeaveType().name())
            .totalDays(balance.getTotalDays())
            .usedDays(balance.getUsedDays())
            .remainingDays(balance.getTotalDays() - balance.getUsedDays())
            .year(balance.getYear())
            .build();
    }
}

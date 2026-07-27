package com.leavemanagement.service;

import com.leavemanagement.dto.LeaveBalanceResponse;
import com.leavemanagement.dto.UpdateLeaveBalanceRequest;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.LeaveBalance;
import com.leavemanagement.enums.Role;
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

    public List<LeaveBalanceResponse> getEmployeeBalances(Long employeeId, Employee currentUser) {
        Employee target = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (!isManagerOf(currentUser, target) && currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("Access denied");
        }

        int year = java.time.Year.now().getValue();
        return leaveBalanceRepository.findByEmployeeIdAndYearOrderByLeaveType(employeeId, year)
            .stream().map(this::toResponse).toList();
    }

    public List<LeaveBalanceResponse> getTeamBalances(Employee currentUser) {
        int year = java.time.Year.now().getValue();
        List<Long> employeeIds;
        if (currentUser.getRole() == Role.ADMIN) {
            employeeIds = employeeRepository.findAll().stream()
                .map(Employee::getId).toList();
        } else {
            employeeIds = employeeRepository.findByManagerId(currentUser.getId())
                .stream().map(Employee::getId).toList();
        }
        if (employeeIds.isEmpty()) return List.of();
        return leaveBalanceRepository.findByEmployeeIdInAndYear(employeeIds, year)
            .stream().map(this::toResponse).toList();
    }

    public List<LeaveBalanceResponse> getAllBalances() {
        int year = java.time.Year.now().getValue();
        List<Long> allIds = employeeRepository.findAll().stream()
            .map(Employee::getId).toList();
        return leaveBalanceRepository.findByEmployeeIdInAndYear(allIds, year)
            .stream().map(this::toResponse).toList();
    }

    public LeaveBalanceResponse updateBalance(Long balanceId, UpdateLeaveBalanceRequest request, Employee currentUser) {
        LeaveBalance balance = leaveBalanceRepository.findById(balanceId)
            .orElseThrow(() -> new IllegalArgumentException("Leave balance not found"));

        if (!isManagerOf(currentUser, balance.getEmployee()) && currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("Access denied");
        }

        balance.setTotalDays(request.getTotalDays());
        balance.setUsedDays(request.getUsedDays());
        balance = leaveBalanceRepository.save(balance);
        return toResponse(balance);
    }

    private boolean isManagerOf(Employee manager, Employee employee) {
        return employee.getManager() != null
            && employee.getManager().getId().equals(manager.getId());
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
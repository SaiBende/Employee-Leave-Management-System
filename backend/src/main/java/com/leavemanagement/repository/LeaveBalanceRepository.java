package com.leavemanagement.repository;

import com.leavemanagement.entity.LeaveBalance;
import com.leavemanagement.enums.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    List<LeaveBalance> findByEmployeeIdAndYearOrderByLeaveType(Long employeeId, int year);
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeAndYear(Long employeeId, LeaveType leaveType, int year);
    List<LeaveBalance> findByEmployeeIdInAndYear(List<Long> employeeIds, int year);
}

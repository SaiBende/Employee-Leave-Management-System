package com.leavemanagement.repository;

import com.leavemanagement.entity.Leave;
import com.leavemanagement.enums.LeaveStatus;
import com.leavemanagement.enums.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<Leave> findByEmployeeIdAndStatusOrderByCreatedAtDesc(Long employeeId, LeaveStatus status);
    List<Leave> findByStatusOrderByCreatedAtDesc(LeaveStatus status);
    List<Leave> findByEmployeeIdAndLeaveTypeOrderByCreatedAtDesc(Long employeeId, LeaveType leaveType);
}

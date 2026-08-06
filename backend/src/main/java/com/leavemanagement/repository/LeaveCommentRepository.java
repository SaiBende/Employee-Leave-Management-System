package com.leavemanagement.repository;

import com.leavemanagement.entity.LeaveComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveCommentRepository extends JpaRepository<LeaveComment, Long> {
    List<LeaveComment> findByLeaveIdOrderByCreatedAtAsc(Long leaveId);
}
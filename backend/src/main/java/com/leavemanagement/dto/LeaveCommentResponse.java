package com.leavemanagement.dto;

import com.leavemanagement.entity.LeaveComment;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveCommentResponse {
    private Long id;
    private Long leaveId;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String comment;
    private LocalDateTime createdAt;

    public static LeaveCommentResponse from(LeaveComment c) {
        return LeaveCommentResponse.builder()
            .id(c.getId())
            .leaveId(c.getLeave().getId())
            .authorId(c.getAuthor().getId())
            .authorName(c.getAuthor().getName())
            .authorRole(c.getAuthor().getRole().name())
            .comment(c.getComment())
            .createdAt(c.getCreatedAt())
            .build();
    }
}
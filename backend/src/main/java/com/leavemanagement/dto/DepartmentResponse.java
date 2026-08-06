package com.leavemanagement.dto;

import com.leavemanagement.entity.Department;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DepartmentResponse {
    private Long id;
    private String name;

    public static DepartmentResponse from(Department dept) {
        return DepartmentResponse.builder()
            .id(dept.getId())
            .name(dept.getName())
            .build();
    }
}
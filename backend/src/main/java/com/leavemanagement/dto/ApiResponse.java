package com.leavemanagement.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiResponse {
    private boolean success;
    private String message;
    private Object data;
}

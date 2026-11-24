package com.leavemanagement.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CompanySignupResponse {
    private Long companyId;
    private String companyName;
    private String adminEmail;
}

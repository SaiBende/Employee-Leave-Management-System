package com.leavemanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateCompanyStatusRequest {
    @NotNull
    private Boolean active;

    public boolean isActive() {
        return Boolean.TRUE.equals(active);
    }
}

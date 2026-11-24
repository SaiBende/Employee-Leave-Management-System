package com.leavemanagement.exception;

import com.leavemanagement.enums.Role;
import lombok.Getter;

@Getter
public class PortalMismatchException extends RuntimeException {

    private final Role actualRole;

    public PortalMismatchException(String message, Role actualRole) {
        super(message);
        this.actualRole = actualRole;
    }
}

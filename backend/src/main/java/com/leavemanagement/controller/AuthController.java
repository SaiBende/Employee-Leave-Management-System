package com.leavemanagement.controller;

import com.leavemanagement.dto.*;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.enums.Role;
import com.leavemanagement.exception.PortalMismatchException;
import com.leavemanagement.security.CurrentUser;
import com.leavemanagement.service.AuthService;
import com.leavemanagement.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Platform setup, company signup, and role-based login")
public class AuthController {

    private final AuthService authService;
    private final CompanyService companyService;

    public AuthController(AuthService authService, CompanyService companyService) {
        this.authService = authService;
        this.companyService = companyService;
    }

    @GetMapping("/setup")
    @Operation(summary = "Check whether the platform super admin has been created")
    public ResponseEntity<?> checkSetup() {
        return ResponseEntity.ok(Map.of("needsSetup", authService.needsSetup()));
    }

    @PostMapping("/setup")
    @Operation(summary = "Create the platform super admin (one-time setup)")
    public ResponseEntity<?> setup(@Valid @RequestBody SetupRequest request) {
        try {
            AuthResponse response = authService.setup(request);
            return ResponseEntity.ok(new ApiResponse(true, "Platform setup complete", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/signup-company")
    @Operation(summary = "Create a company and its first company admin")
    public ResponseEntity<?> signupCompany(@Valid @RequestBody CompanySignupRequest request) {
        try {
            CompanySignupResponse response = companyService.signupCompany(request);
            return ResponseEntity.ok(new ApiResponse(true, "Company created successfully", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change the signed-in user's password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                            @CurrentUser Employee employee) {
        try {
            authService.changePassword(employee, request);
            return ResponseEntity.ok(new ApiResponse(true, "Password updated successfully", null));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login through a role-specific portal")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse(true, "Login successful", response));
        } catch (PortalMismatchException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse(false, e.getMessage(), Map.of(
                    "role", e.getActualRole().name(),
                    "portal", portalForRole(e.getActualRole())
                )));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse(false, e.getMessage(), null));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, "Invalid email or password", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout (client-side token discard)")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new ApiResponse(true, "Logged out successfully", null));
    }

    private String portalForRole(Role role) {
        return switch (role) {
            case SUPER_ADMIN -> "/platform/login";
            case ADMIN -> "/admin/login";
            case MANAGER -> "/manager/login";
            case EMPLOYEE -> "/employee/login";
        };
    }
}

package com.leavemanagement.controller;

package com.leavemanagement.controller;

import com.leavemanagement.dto.*;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Login and registration endpoints")
public class AuthController {

    private final AuthService authService;
    private final EmployeeRepository employeeRepository;

    public AuthController(AuthService authService, EmployeeRepository employeeRepository) {
        this.authService = authService;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/setup")
    @Operation(summary = "Check if system needs initial setup")
    public ResponseEntity<?> checkSetup() {
        boolean needsSetup = employeeRepository.count() == 0;
        return ResponseEntity.ok(Map.of("needsSetup", needsSetup));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(new ApiResponse(true, "Registration successful", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse(true, "Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(new ApiResponse(false, "Invalid email or password", null));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout (client-side token discard)")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new ApiResponse(true, "Logged out successfully", null));
    }
}

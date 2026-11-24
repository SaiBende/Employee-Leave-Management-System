package com.leavemanagement.controller;

import com.leavemanagement.dto.*;
import com.leavemanagement.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/platform")
@Tag(name = "Platform Console", description = "Super admin company management")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide statistics")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(new ApiResponse(true, "Success",
            companyService.getDashboard()));
    }

    @GetMapping("/companies")
    @Operation(summary = "List all companies")
    public ResponseEntity<?> getCompanies() {
        List<CompanyResponse> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(new ApiResponse(true, "Success", companies));
    }

    @GetMapping("/companies/{id}")
    @Operation(summary = "Get a company by ID")
    public ResponseEntity<?> getCompany(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(new ApiResponse(true, "Success",
                companyService.getCompany(id)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/companies")
    @Operation(summary = "Create a company and its first company admin")
    public ResponseEntity<?> createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        try {
            CompanyResponse company = companyService.createCompany(request);
            return ResponseEntity.ok(new ApiResponse(true, "Company created", company));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PutMapping("/companies/{id}/status")
    @Operation(summary = "Activate or suspend a company")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @Valid @RequestBody UpdateCompanyStatusRequest request) {
        try {
            CompanyResponse company = companyService.updateStatus(id, request.isActive());
            return ResponseEntity.ok(new ApiResponse(true,
                company.isActive() ? "Company activated" : "Company suspended", company));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}

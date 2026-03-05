package com.arah.apartment_management_system.controller;

import java.util.List;

import com.arah.apartment_management_system.dto.maintenance.CreateMaintenanceRequest;
import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.dto.maintenance.UpdateMaintenanceRequest;
import com.arah.apartment_management_system.service.MaintenanceService;
import com.arah.apartment_management_system.util.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<String> createMaintenance(@RequestBody CreateMaintenanceRequest request) {
        maintenanceService.createBill(
                request.getFlatId(),
                request.getAmount(),
                request.getMonth(),
                request.getYear());
        return ApiResponse.success("Maintenance bill created", null);
    }

    /**
     * Returns a plain list (frontend iterates directly) instead of paginated
     * wrapper.
     * Frontend's AdminDashboard loads data with data.data.content fallback
     * handling.
     */
    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @GetMapping
    public ApiResponse<List<MaintenanceResponseDTO>> getAllMaintenance(Pageable pageable) {
        // Extract only the content list from paginated response for simpler frontend
        // consumption
        return ApiResponse.success(
                "Maintenance fetched successfully",
                maintenanceService.getAllMaintenance(pageable).getData().getContent());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<String> updateMaintenance(
            @PathVariable Long id,
            @RequestBody UpdateMaintenanceRequest request) {
        maintenanceService.updateMaintenance(id, request.getAmount());
        return ApiResponse.success("Maintenance updated", null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteMaintenance(@PathVariable Long id) {
        maintenanceService.deleteMaintenance(id);
        return ApiResponse.success("Maintenance deleted", null);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @GetMapping("/current/{flatId}")
    public ApiResponse<MaintenanceResponseDTO> getCurrentMaintenance(@PathVariable Long flatId) {
        return ApiResponse.success(
                "Current maintenance fetched successfully",
                maintenanceService.getCurrentMaintenance(flatId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/mark-paid")
    public ApiResponse<MaintenanceResponseDTO> markMaintenanceAsPaid(@PathVariable Long id) {
        return ApiResponse.success("Maintenance marked as PAID", maintenanceService.markAsPaid(id));
    }
}

package com.arah.apartment_management_system.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.flat.FlatResponseDTO;
import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.dto.staff.StaffResponse;
import com.arah.apartment_management_system.service.AdminService;
import com.arah.apartment_management_system.service.FlatService;
import com.arah.apartment_management_system.service.MaintenanceService;
import com.arah.apartment_management_system.service.NoticeService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.util.ApiResponse;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESIDENT')")
public class UserController {

    private final FlatService flatService;
    private final UserService userService;
    private final MaintenanceService maintenanceService;
    private final NoticeService noticeService;
    private final AdminService adminService;

    // =============================================
    // PROFILE
    // =============================================

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getMyProfile() {
        return ApiResponse.success("Profile fetched successfully", userService.getLoggedInUserProfile());
    }

    @PutMapping("/profile")
    public ApiResponse<String> updateProfile(@RequestBody UpdateUserRequest request) {
        String username = userService.getLoggedInUser().getUsername();
        userService.updateProfile(username, request);
        return ApiResponse.success("Profile updated successfully", null);
    }

    // =============================================
    // FLAT (supports both /flat and legacy /my-flat)
    // =============================================

    @GetMapping("/flat")
    public ApiResponse<FlatResponseDTO> getMyFlat() {
        return ApiResponse.success("Flat fetched successfully", flatService.getMyFlat());
    }

    // =============================================
    // MAINTENANCE (returns list of all records)
    // =============================================

    @GetMapping("/maintenance")
    public ApiResponse<List<MaintenanceResponseDTO>> getMyMaintenance() {
        return ApiResponse.success("Maintenance fetched successfully", maintenanceService.getMyMaintenance());
    }

    // =============================================
    // NOTICES
    // =============================================

    @GetMapping("/notices")
    public ApiResponse<List<Notice>> getNotices() {
        return ApiResponse.success("Notices fetched successfully", noticeService.getAllNotices());
    }

    // =============================================
    // STAFF
    // =============================================

    @GetMapping("/staff")
    public ApiResponse<List<StaffResponse>> getStaffList() {
        return ApiResponse.success("Staff list fetched successfully", adminService.getAllStaff());
    }
}
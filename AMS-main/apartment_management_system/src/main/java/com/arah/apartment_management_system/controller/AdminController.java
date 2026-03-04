package com.arah.apartment_management_system.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.staff.CreateStaffRequest;
import com.arah.apartment_management_system.dto.staff.StaffResponse;
import com.arah.apartment_management_system.dto.user.CreateUserRequest;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.service.AdminService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AdminService adminService;

    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.success(
                "Users fetched successfully",
                userService.getAllUsers());
    }

    @PutMapping("/users/{id}")
    public ApiResponse<String> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        userService.updateUser(id, request);
        return ApiResponse.success("User updated successfully", null);
    }

    @PutMapping("/users/{id}/deactivate")
    public ApiResponse<String> deleteUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ApiResponse.success("User deactivated successfully", null);
    }

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile() {

        return ApiResponse.success(
                "Profile fetched successfully",
                userService.getLoggedInUserProfile());
    }

    @PutMapping("/update-profile")
    public ApiResponse<String> updateProfile(
            Principal principal,
            @RequestBody UpdateUserRequest request) {

        userService.updateProfile(principal.getName(), request);

        return ApiResponse.success("Profile updated successfully", null);
    }

    @GetMapping("/pending-users")
    public ApiResponse<List<UserResponse>> getPendingUsers() {
        return ApiResponse.success(
                "Pending users fetched",
                userService.getPendingUsers());
    }

    @PostMapping("/users")
    public ApiResponse<String> createUser(@RequestBody CreateUserRequest request) {
        userService.createUser(request);
        return ApiResponse.success("User created successfully", null);
    }

    @PutMapping("/users/{id}/approve")
    public ApiResponse<String> approveUser(
            @PathVariable Long id,
            @RequestParam Long flatId) {

        adminService.approveAndAllocate(id, flatId);
        return ApiResponse.success("User approved and flat allocated", null);
    }

    @PutMapping("/users/{id}/reject")
    public ApiResponse<String> rejectUser(@PathVariable Long id) {
        userService.rejectUser(id);
        return ApiResponse.success("User rejected", null);
    }

    @PutMapping("/users/{id}/reactivate")
    public ApiResponse<String> reactivateUser(@PathVariable Long id) {
        userService.reactivateUser(id);
        return ApiResponse.success("User reactivated successfully", null);
    }

    @PutMapping("/users/{userId}/allocate/{flatId}")
    public ApiResponse<String> allocateFlat(
            @PathVariable Long userId,
            @PathVariable Long flatId) {

        adminService.allocateFlatToUser(userId, flatId);
        return ApiResponse.success("Flat allocated successfully", null);
    }

    @PostMapping("/staff")
    public ApiResponse<String> createStaff(
            @RequestBody CreateStaffRequest request) {

        adminService.createStaff(request);
        return ApiResponse.success("Staff created successfully", null);
    }

    @GetMapping("/staff")
    public ApiResponse<List<StaffResponse>> getAllStaff() {

        return ApiResponse.success(
                "Staff fetched successfully",
                adminService.getAllStaff());
    }

    @PutMapping("/staff/{id}")
    public ApiResponse<String> updateStaff(
            @PathVariable Long id,
            @RequestBody CreateStaffRequest request) {

        adminService.updateStaff(id, request);
        return ApiResponse.success("Staff updated successfully", null);
    }

    @DeleteMapping("/staff/{id}")
    public ApiResponse<String> deleteStaff(@PathVariable Long id) {

        adminService.deleteStaff(id);
        return ApiResponse.success("Staff deleted successfully", null);
    }
}
package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.user.CreateUserRequest;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.User;

public interface UserService {

    // ===============================
    // 🔹 Create
    // ===============================
    void createUser(CreateUserRequest request);

    // ===============================
    // 🔹 Manage Users (Admin Panel)
    // ===============================
    List<UserResponse> getAllUsers();

    void updateUser(Long id, UpdateUserRequest request);

    void deactivateUser(Long id);

    // ===============================
    // 🔹 Approval Flow
    // ===============================
    List<UserResponse> getPendingUsers();

    void approveUser(Long userId);

    void rejectUser(Long userId);

    // ===============================
    // 🔹 Profile
    // ===============================
    User getLoggedInUser();

    UserResponse getLoggedInUserProfile();

    UserResponse getUserByUsername(String username);

    void updateProfile(String username, UpdateUserRequest request);

	public void reactivateUser(Long id);
}
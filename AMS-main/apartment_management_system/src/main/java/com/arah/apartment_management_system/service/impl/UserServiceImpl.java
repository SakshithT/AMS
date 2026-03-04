package com.arah.apartment_management_system.service.impl;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.user.CreateUserRequest;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.FlatStatus;
import com.arah.apartment_management_system.enums.UserStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.security.CustomUserDetails;
import com.arah.apartment_management_system.service.UserService;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AllotmentRepository apartmentAllotmentRepository;
    private final FlatRepository flatRepository;

    @Override
    public void createUser(CreateUserRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setContactNumber(request.getContactNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(request.getRole());
        user.setStatus(UserStatus.APPROVED);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public List<UserResponse> getPendingUsers() {

        List<User> users = userRepository.findByStatus(UserStatus.PENDING);

        return users.stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    public void approveUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setStatus(UserStatus.APPROVED);
        userRepository.save(user);
    }

    @Override
    public void rejectUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setStatus(UserStatus.REJECTED);
        userRepository.save(user);
    }

    public User getLoggedInUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser();
    }

    @Override
    @Transactional
    public UserResponse getLoggedInUserProfile() {
        User loggedInUser = getLoggedInUser();
        User user = userRepository.findById(loggedInUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserResponse(user);
    }

    // ==========================================
    // ✅ GET ALL USERS (Manage Users Page)
    // ==========================================
    @Override
    @Transactional
    public List<UserResponse> getAllUsers() {

        List<User> users = userRepository.findAll();

        return users.stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    // ==========================================
    // ✅ UPDATE USER (Admin Panel)
    // ==========================================
    @Override
    public void updateUser(Long id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            user.setStatus(UserStatus.valueOf(request.getStatus()));
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }

        if (request.getContactNumber() != null && !request.getContactNumber().isBlank()) {
            user.setContactNumber(request.getContactNumber());
        }

        // Update password only if provided
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
    }

    // ==========================================
    // ✅ DEACTIVATE USER
    // ==========================================
    @Override
    @Transactional
    public void deactivateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new RuntimeException("User already deactivated");
        }

        // 1️⃣ Deactivate User
        user.setStatus(UserStatus.DEACTIVATED);

        // 2️⃣ Find active allotment
        apartmentAllotmentRepository
                .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                .ifPresent(allotment -> {

                    // 3️⃣ Update allotment
                    allotment.setStatus(AllotmentStatus.INACTIVE);
                    allotment.setEndDate(LocalDate.now());

                    apartmentAllotmentRepository.save(allotment);

                    // 4️⃣ Update flat
                    Flat flat = allotment.getFlat();
                    if (flat != null) {
                        flat.setStatus(FlatStatus.AVAILABLE);
                        flatRepository.save(flat);
                    }
                });

        userRepository.save(user);
    }

    // ==========================================
    // ✅ GET USER BY USERNAME
    // ==========================================
    @Override
    @Transactional
    public UserResponse getUserByUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToUserResponse(user);
    }

    @Override
    public void reactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.APPROVED);
        userRepository.save(user);
    }

    // ==========================================
    // ✅ UPDATE PROFILE (Logged-in Admin)
    // ==========================================
    @Override
    public void updateProfile(String username, UpdateUserRequest request) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }

        if (request.getContactNumber() != null && !request.getContactNumber().isBlank()) {
            user.setContactNumber(request.getContactNumber());
        }

        userRepository.save(user);
    }

    private UserResponse mapToUserResponse(User user) {
        String flatNumber = null;
        String blockName = null;

        if (user.getAllotments() != null) {
            String tempFlat = null;
            String tempBlock = null;
            for (Allotment allotment : user.getAllotments()) {
                if (allotment.getStatus() == AllotmentStatus.ACTIVE) {
                    tempFlat = allotment.getFlat().getFlatNumber();
                    if (allotment.getFlat().getBlock() != null) {
                        tempBlock = allotment.getFlat().getBlock().getBlockName();
                    }
                    break;
                }
            }
            flatNumber = tempFlat;
            blockName = tempBlock;
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getContactNumber(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getStatus() != null ? user.getStatus().name() : "APPROVED",
                user.getDesignation(),
                flatNumber,
                blockName);
    }
}
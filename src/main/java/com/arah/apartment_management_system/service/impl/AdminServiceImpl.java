package com.arah.apartment_management_system.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.staff.CreateStaffRequest;
import com.arah.apartment_management_system.dto.staff.StaffResponse;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.FlatStatus;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final FlatRepository flatRepository;
    private final AllotmentRepository allotmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Allotment allocateFlatToUser(Long userId, Long flatId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() -> new RuntimeException("Flat not found"));

        Allotment allotment = new Allotment();
        allotment.setUser(user);
        allotment.setFlat(flat);
        allotment.setStartDate(LocalDate.now());
        allotment.setStatus(AllotmentStatus.ACTIVE);
        flat.setStatus(FlatStatus.ALLOCATED);
        user.setStatus(UserStatus.APPROVED);

        return allotmentRepository.save(allotment);
    }

    public void approveAndAllocate(Long userId, Long flatId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() -> new RuntimeException("Flat not found"));

        if (flat.getStatus() == FlatStatus.ALLOCATED) {
            throw new RuntimeException("Flat already allocated");
        }

        // Approve user
        user.setStatus(UserStatus.APPROVED);
        userRepository.save(user);

        // Allocate flat
        Allotment allotment = new Allotment();
        allotment.setUser(user);
        allotment.setFlat(flat);
        allotment.setStartDate(LocalDate.now());
        allotment.setStatus(AllotmentStatus.ACTIVE);

        allotmentRepository.save(allotment);

        // Update flat status
        flat.setStatus(FlatStatus.ALLOCATED);
        flatRepository.save(flat);
    }

    @Override
    public void createStaff(CreateStaffRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User staff = new User();
        staff.setUsername(request.getUsername());
        staff.setEmail(request.getEmail());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setRole(Role.ROLE_SECURITY);
        staff.setStatus(UserStatus.APPROVED);
        staff.setContactNumber(request.getContactNumber());
        staff.setDesignation(request.getDesignation());

        userRepository.save(staff);
    }

    @Override
    public List<StaffResponse> getAllStaff() {

        List<Role> roles = List.of(Role.ROLE_SECURITY);

        return userRepository.findByRoleIn(roles)
                .stream()
                .map(user -> StaffResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .contactNumber(user.getContactNumber())
                        .designation(user.getDesignation())
                        .role(user.getRole() != null ? user.getRole().name() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void updateStaff(Long id, CreateStaffRequest request) {

        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (!staff.getUsername().equals(request.getUsername())
                && userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        if (!staff.getEmail().equals(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        staff.setUsername(request.getUsername());
        staff.setEmail(request.getEmail());
        staff.setContactNumber(request.getContactNumber());
        staff.setDesignation(request.getDesignation());

        userRepository.save(staff);
    }

    @Override
    public void deleteStaff(Long id) {

        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        userRepository.delete(staff);
    }
}
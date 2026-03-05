package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.dto.staff.CreateStaffRequest;
import com.arah.apartment_management_system.dto.staff.StaffResponse;

public interface AdminService {
    Allotment allocateFlatToUser(Long userId, Long flatId);

    void approveAndAllocate(Long userId, Long flatId);

    List<StaffResponse> getAllStaff();

    void createStaff(CreateStaffRequest request);

    void updateStaff(Long id, CreateStaffRequest request);

    void deleteStaff(Long id);
}
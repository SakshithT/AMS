package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.complaint.ComplaintResponseDTO;
import com.arah.apartment_management_system.dto.complaint.CreateComplaintRequest;
import com.arah.apartment_management_system.enums.ComplaintStatus;

public interface ComplaintService {

    // Resident: submit complaint
    ComplaintResponseDTO createComplaint(CreateComplaintRequest request);

    // Resident: view own complaints
    List<ComplaintResponseDTO> getMyComplaints();

    // Admin: view all complaints
    List<ComplaintResponseDTO> getAllComplaints();

    // Admin: update complaint status
    ComplaintResponseDTO updateStatus(Long id, ComplaintStatus status);

    // Admin: assign staff to a complaint (also sets status to IN_PROGRESS)
    ComplaintResponseDTO assignStaff(Long complaintId, Long staffId);

    // Admin: delete complaint
    void deleteComplaint(Long id);
}

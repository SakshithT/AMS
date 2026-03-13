package com.arah.apartment_management_system.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.complaint.ComplaintResponseDTO;
import com.arah.apartment_management_system.dto.complaint.CreateComplaintRequest;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Complaint;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.ComplaintPriority;
import com.arah.apartment_management_system.enums.ComplaintStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.ComplaintRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.service.ComplaintService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.mapper.ComplaintMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AllotmentRepository allotmentRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ComplaintMapper complaintMapper;

    @Override
    public ComplaintResponseDTO createComplaint(CreateComplaintRequest request) {
        User user = userService.getLoggedInUser();

        // Get resident's flat from their active allotment
        Flat flat = allotmentRepository
                .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                .map(Allotment::getFlat)
                .orElse(null);

        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory() != null ? request.getCategory() : "GENERAL");
        complaint.setPriority(request.getPriority() != null ? request.getPriority() : ComplaintPriority.MEDIUM);
        complaint.setStatus(ComplaintStatus.PENDING);
        complaint.setUser(user);
        complaint.setFlat(flat);

        return complaintMapper.toDTO(complaintRepository.save(complaint));
    }

    @Override
    public List<ComplaintResponseDTO> getMyComplaints() {
        User user = userService.getLoggedInUser();
        return complaintRepository.findByUser(user)
                .stream()
                .map(complaintMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintResponseDTO> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(complaintMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ComplaintResponseDTO updateStatus(Long id, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        complaint.setStatus(status);
        if (status == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        return complaintMapper.toDTO(complaintRepository.save(complaint));
    }

    @Override
    public ComplaintResponseDTO assignStaff(Long complaintId, Long staffId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        complaint.setAssignedStaff(staff);
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);

        return complaintMapper.toDTO(complaintRepository.save(complaint));
    }

    @Override
    public void deleteComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        complaintRepository.delete(complaint);
    }
}

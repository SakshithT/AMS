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
import com.arah.apartment_management_system.service.ComplaintService;
import com.arah.apartment_management_system.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AllotmentRepository allotmentRepository;
    private final UserService userService;

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

        return mapToDTO(complaintRepository.save(complaint));
    }

    @Override
    public List<ComplaintResponseDTO> getMyComplaints() {
        User user = userService.getLoggedInUser();
        return complaintRepository.findByUser(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintResponseDTO> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
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

        return mapToDTO(complaintRepository.save(complaint));
    }

    @Override
    public void deleteComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        complaintRepository.delete(complaint);
    }

    private ComplaintResponseDTO mapToDTO(Complaint complaint) {
        return ComplaintResponseDTO.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .userId(complaint.getUser() != null ? complaint.getUser().getId() : null)
                .username(complaint.getUser() != null ? complaint.getUser().getUsername() : null)
                .flatId(complaint.getFlat() != null ? complaint.getFlat().getId() : null)
                .flatNumber(complaint.getFlat() != null ? complaint.getFlat().getFlatNumber() : null)
                .createdAt(complaint.getCreatedAt())
                .resolvedAt(complaint.getResolvedAt())
                .build();
    }
}

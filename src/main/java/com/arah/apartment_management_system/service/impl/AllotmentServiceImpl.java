package com.arah.apartment_management_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.allotment.*;
import com.arah.apartment_management_system.entity.*;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.*;
import com.arah.apartment_management_system.service.AllotmentService;
import com.arah.apartment_management_system.service.UserService;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AllotmentServiceImpl implements AllotmentService {

    private final AllotmentRepository allotmentRepository;
    private final UserRepository userRepository;
    private final FlatRepository flatRepository;
    private final UserService userService;

    @Override
    public AllotmentResponseDTO createAllotment(AllotmentRequestDTO request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Flat flat = flatRepository.findById(request.getFlatId())
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        Allotment allotment = Allotment.builder()
                .user(user)
                .flat(flat)
                .startDate(request.getStartDate())
                .status(AllotmentStatus.ACTIVE)
                .build();

        return mapToDTO(allotmentRepository.save(allotment));
    }

    public AllotmentResponseDTO getMyAllotment() {

        User user = userService.getLoggedInUser();

        Allotment allotment =
                allotmentRepository.findByUserAndStatus(
                        user,
                        AllotmentStatus.ACTIVE
                ).orElseThrow(() ->
                        new RuntimeException("No active allotment"));

        return mapToDTO(allotment);
    }

    @Override
    public void vacateFlat(Long allotmentId) {

        Allotment allotment = 
            allotmentRepository.findById(allotmentId)
                .orElseThrow(() -> 
                    new ResourceNotFoundException("Allotment not found"));

        allotment.setStatus(AllotmentStatus.VACATED);
        allotment.setEndDate(LocalDate.now());

        allotmentRepository.save(allotment);
    }

    private AllotmentResponseDTO mapToDTO(Allotment allotment) {
        return new AllotmentResponseDTO(
                allotment.getId(),
                allotment.getUser().getId(),
                allotment.getFlat().getId(),
                allotment.getStartDate(),
                allotment.getStatus().name()
        );
    }
}

package com.arah.apartment_management_system.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.facility.FacilityRequestDTO;
import com.arah.apartment_management_system.dto.facility.FacilityResponseDTO;
import com.arah.apartment_management_system.entity.Facility;
import com.arah.apartment_management_system.enums.FacilityStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.FacilityRepository;
import com.arah.apartment_management_system.service.FacilityService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;

    @Override
    public FacilityResponseDTO createFacility(FacilityRequestDTO request) {
        Facility facility = Facility.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : FacilityStatus.AVAILABLE)
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .charges(request.getCharges())
                .capacity(request.getCapacity())
                .build();

        return mapToDTO(facilityRepository.save(facility));
    }

    @Override
    public FacilityResponseDTO updateFacility(Long id, FacilityRequestDTO request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));

        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            facility.setStatus(request.getStatus());
        }
        facility.setOpeningTime(request.getOpeningTime());
        facility.setClosingTime(request.getClosingTime());
        facility.setCharges(request.getCharges());
        facility.setCapacity(request.getCapacity());

        return mapToDTO(facilityRepository.save(facility));
    }

    @Override
    public void deleteFacility(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
        facilityRepository.delete(facility);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacilityResponseDTO> getAllFacilities() {
        return facilityRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FacilityResponseDTO getFacilityById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
        return mapToDTO(facility);
    }

    private FacilityResponseDTO mapToDTO(Facility facility) {
        return FacilityResponseDTO.builder()
                .id(facility.getId())
                .name(facility.getName())
                .description(facility.getDescription())
                .status(facility.getStatus())
                .openingTime(facility.getOpeningTime())
                .closingTime(facility.getClosingTime())
                .charges(facility.getCharges())
                .capacity(facility.getCapacity())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();
    }
}

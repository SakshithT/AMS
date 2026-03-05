package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.facility.FacilityRequestDTO;
import com.arah.apartment_management_system.dto.facility.FacilityResponseDTO;

public interface FacilityService {

    // Admin: create facility
    FacilityResponseDTO createFacility(FacilityRequestDTO request);

    // Admin: update facility
    FacilityResponseDTO updateFacility(Long id, FacilityRequestDTO request);

    // Admin: delete facility
    void deleteFacility(Long id);

    // Admin + Resident: get all facilities
    List<FacilityResponseDTO> getAllFacilities();

    // Admin + Resident: get facility by id
    FacilityResponseDTO getFacilityById(Long id);
}

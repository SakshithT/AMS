package com.arah.apartment_management_system.service;


import com.arah.apartment_management_system.dto.apartment.ApartmentRequestDTO;
import com.arah.apartment_management_system.dto.apartment.ApartmentResponseDTO;
import com.arah.apartment_management_system.dto.apartment.UpdateApartmentRequest;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;


public interface ApartmentService {

    ApartmentResponseDTO createApartment(ApartmentRequestDTO request);

    ApiResponse<PageResponse<ApartmentResponseDTO>>getAllApartments(int page, int size, String sortBy);


    ApartmentResponseDTO getApartmentById(Long id);

    void deleteApartment(Long id);

	void updateApartment(Long id, UpdateApartmentRequest request);
}

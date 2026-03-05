package com.arah.apartment_management_system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.arah.apartment_management_system.dto.apartment.ApartmentRequestDTO;
import com.arah.apartment_management_system.dto.apartment.ApartmentResponseDTO;
import com.arah.apartment_management_system.dto.apartment.UpdateApartmentRequest;
import com.arah.apartment_management_system.service.ApartmentService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/apartments")
@RequiredArgsConstructor
public class ApartmentController {

    private final ApartmentService apartmentService;

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @PostMapping
    public ApiResponse<ApartmentResponseDTO> createApartment(
            @Valid @RequestBody ApartmentRequestDTO request) {
    	
    	ApartmentResponseDTO apartment = apartmentService.createApartment(request);
    	
    	return ApiResponse.success("Apartment created successfully", apartment);
    }
    
    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ApartmentResponseDTO>>>getAllApartments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy) {

        return ResponseEntity.ok(
                apartmentService.getAllApartments(page, size, sortBy)
        );
    }


    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @GetMapping("/{id}")
    public ApiResponse<ApartmentResponseDTO> getById(@PathVariable Long id) {
    	ApartmentResponseDTO apartment = apartmentService.getApartmentById(id);
        
        return ApiResponse.success("Apartment by ID fetched successfully", apartment);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @DeleteMapping("/{id}")
    public ApiResponse<Object> delete(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        
        return ApiResponse.success("Apartment deleted successfully", null);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> updateApartment(
            @PathVariable Long id,
            @RequestBody UpdateApartmentRequest request) {

        apartmentService.updateApartment(id, request);
        return ApiResponse.success("Apartment updated successfully", null);
    }
}



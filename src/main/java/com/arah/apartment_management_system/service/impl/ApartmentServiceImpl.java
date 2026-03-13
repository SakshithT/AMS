package com.arah.apartment_management_system.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import com.arah.apartment_management_system.dto.apartment.ApartmentResponseDTO;
import com.arah.apartment_management_system.dto.apartment.UpdateApartmentRequest;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.arah.apartment_management_system.dto.apartment.ApartmentRequestDTO;
import com.arah.apartment_management_system.entity.Apartment;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.ApartmentRepository;
import com.arah.apartment_management_system.service.ApartmentService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;
import com.arah.apartment_management_system.mapper.ApartmentMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApartmentServiceImpl implements ApartmentService {

        private final ApartmentRepository apartmentRepository;
        private final ApartmentMapper apartmentMapper;

        @Override
        public ApartmentResponseDTO createApartment(ApartmentRequestDTO request) {

                Apartment apartment = apartmentMapper.toEntity(request);
                Apartment saved = apartmentRepository.save(apartment);

                return apartmentMapper.toDTO(saved);
        }

        @Override
        public ApiResponse<PageResponse<ApartmentResponseDTO>> getAllApartments(
                        int page,
                        int size,
                        String sortBy) {

                Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));

                Page<Apartment> apartmentPage = apartmentRepository.findAll(pageable);

                List<ApartmentResponseDTO> content = apartmentPage.getContent()
                                .stream()
                                .map(apartmentMapper::toDTO)
                                .toList();

                PageResponse<ApartmentResponseDTO> pageResponse = new PageResponse<>(
                                content,
                                apartmentPage.getNumber(),
                                apartmentPage.getSize(),
                                apartmentPage.getTotalElements(),
                                apartmentPage.getTotalPages(),
                                apartmentPage.isLast());

                return ApiResponse.success("Apartments fetched successfully", pageResponse);

        }

        @Override
        public ApartmentResponseDTO getApartmentById(Long id) {

                Apartment apartment = apartmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

                return apartmentMapper.toDTO(apartment);
        }

        @Override
        public void deleteApartment(Long id) {

                Apartment apartment = apartmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

                apartmentRepository.delete(apartment);
        }

        @Override
        public void updateApartment(Long id, UpdateApartmentRequest request) {

                Apartment apartment = apartmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

                apartment.setName(request.getName());
                apartment.setAddress(request.getAddress());

                apartmentRepository.save(apartment);
        }
}

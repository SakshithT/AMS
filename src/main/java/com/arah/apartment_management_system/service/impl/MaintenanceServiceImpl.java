package com.arah.apartment_management_system.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.Maintenance;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.PaymentStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.MaintenanceRepository;
import com.arah.apartment_management_system.service.MaintenanceService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

        private final MaintenanceRepository maintenanceRepository;
        private final AllotmentRepository allotmentRepository;
        private final FlatRepository flatRepository;
        private final UserService userService;

        @Override
        public ApiResponse<PageResponse<MaintenanceResponseDTO>> getAllMaintenance(Pageable pageable) {

                User user = userService.getLoggedInUser();
                Page<Maintenance> maintenancePage;

                if (user.getRole().name().equals("ROLE_RESIDENT")) {

                        Allotment allotment = allotmentRepository
                                        .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                                        .orElseThrow(() -> new ResourceNotFoundException("No active allotment found"));

                        maintenancePage = maintenanceRepository.findByFlatId(
                                        allotment.getFlat().getId(),
                                        pageable);

                } else {
                        maintenancePage = maintenanceRepository.findAll(pageable);
                }

                Page<MaintenanceResponseDTO> dtoPage = maintenancePage.map(this::mapToDTO);

                PageResponse<MaintenanceResponseDTO> response = new PageResponse<>(
                                dtoPage.getContent(),
                                dtoPage.getNumber(),
                                dtoPage.getSize(),
                                dtoPage.getTotalElements(),
                                dtoPage.getTotalPages(),
                                dtoPage.isLast());

                return ApiResponse.success("Maintenance fetched successfully", response);
        }

        @Override
        public MaintenanceResponseDTO getCurrentMaintenance(Long flatId) {

                int currentMonth = java.time.LocalDate.now().getMonthValue();
                int currentYear = java.time.LocalDate.now().getYear();

                Flat flat = flatRepository.findById(flatId)
                                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

                Maintenance maintenance = maintenanceRepository
                                .findByFlatAndMonthAndYear(flat, currentMonth, currentYear)
                                .orElseThrow(() -> new ResourceNotFoundException("No maintenance for current month"));

                return mapToDTO(maintenance);
        }

        @Override
        public void updateMaintenance(Long maintenanceId, Double amount, Integer month, Integer year) {

                Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found"));

                if (amount != null) {
                        maintenance.setAmount(amount);
                }
                if (month != null) {
                        maintenance.setMonth(month);
                }
                if (year != null) {
                        maintenance.setYear(year);
                }
                // Recalculate due date if month or year changed
                int updatedMonth = month != null ? month : maintenance.getMonth();
                int updatedYear = year != null ? year : maintenance.getYear();
                maintenance.setDueDate(LocalDate.of(updatedYear, updatedMonth, 1).plusDays(10));

                maintenanceRepository.save(maintenance);
        }

        @Override
        public void deleteMaintenance(Long maintenanceId) {

                Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found"));

                maintenanceRepository.delete(maintenance);
        }

        @Override
        public List<MaintenanceResponseDTO> getMyMaintenance() {

                User user = userService.getLoggedInUser();

                Allotment allotment = allotmentRepository
                                .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                                .orElseThrow(() -> new ResourceNotFoundException("No active allotment found"));

                return maintenanceRepository
                                .findByFlatId(allotment.getFlat().getId(), Pageable.unpaged())
                                .stream()
                                .map(this::mapToDTO)
                                .toList();
        }

        @Override
        public MaintenanceResponseDTO getMaintenanceById(Long id) {

                Maintenance maintenance = maintenanceRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found"));

                User user = userService.getLoggedInUser();

                if (user.getRole().name().equals("ROLE_RESIDENT")) {

                        Allotment allotment = allotmentRepository
                                        .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                                        .orElseThrow(() -> new ResourceNotFoundException("No active allotment found"));

                        if (!maintenance.getFlat().getId()
                                        .equals(allotment.getFlat().getId())) {

                                throw new RuntimeException(
                                                "You can only access your flat maintenance");
                        }
                }

                return mapToDTO(maintenance);
        }

        @Override
        public MaintenanceResponseDTO markAsPaid(Long id) {
                Maintenance maintenance = maintenanceRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Maintenance not found"));

                maintenance.setPaymentStatus(PaymentStatus.PAID);
                maintenance.setPaidDate(LocalDate.now());

                maintenanceRepository.save(maintenance);

                return mapToDTO(maintenance);
        }

        private MaintenanceResponseDTO mapToDTO(Maintenance maintenance) {
                return new MaintenanceResponseDTO(maintenance.getId(), maintenance.getMonth(), maintenance.getYear(),
                                maintenance.getAmount(), maintenance.getDueDate(), maintenance.getPaidDate(),
                                maintenance.getPaymentStatus(), maintenance.getFlat().getId(),
                                maintenance.getFlat().getFlatNumber());
        }

        @Override
        public void createBill(Long flatId, Double amount, int month, int year) {

                Flat flat = flatRepository.findById(flatId)
                                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

                // Check duplicate for SAME flat + month + year
                maintenanceRepository
                                .findByFlatAndMonthAndYear(flat, month, year)
                                .ifPresent(m -> {
                                        throw new RuntimeException(
                                                        "Maintenance already generated for this flat for this month & year");
                                });

                Maintenance maintenance = new Maintenance();
                maintenance.setFlat(flat);
                maintenance.setMonth(month);
                maintenance.setYear(year);
                maintenance.setAmount(amount);
                maintenance.setDueDate(
                                LocalDate.of(year, month, 1).plusDays(10));
                maintenance.setPaymentStatus(PaymentStatus.PENDING);

                maintenanceRepository.save(maintenance);
        }
}

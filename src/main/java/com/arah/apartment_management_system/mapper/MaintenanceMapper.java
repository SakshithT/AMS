package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.entity.Maintenance;

@Component
public class MaintenanceMapper {

    public MaintenanceResponseDTO toDTO(Maintenance maintenance) {

        return new MaintenanceResponseDTO(
                maintenance.getId(),
                maintenance.getMonth(),
                maintenance.getYear(),
                maintenance.getAmount(),
                maintenance.getDueDate(),
                maintenance.getPaidDate(),
                maintenance.getPaymentStatus(),
                maintenance.getFlat().getId(),
                maintenance.getFlat().getFlatNumber());
    }
}
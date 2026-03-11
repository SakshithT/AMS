package com.arah.apartment_management_system.service;

import java.util.List;
import org.springframework.data.domain.Pageable;

import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;

public interface MaintenanceService {

    ApiResponse<PageResponse<MaintenanceResponseDTO>>
    getAllMaintenance(Pageable pageable);

    MaintenanceResponseDTO getMaintenanceById(Long id);

    List<MaintenanceResponseDTO> getMyMaintenance();

    MaintenanceResponseDTO getCurrentMaintenance(Long flatId);

    public MaintenanceResponseDTO markAsPaid(Long id);

    void createBill(Long flatId, Double amount, int month, int year);

    void updateMaintenance(Long maintenanceId, Double amount, Integer month, Integer year);

    void deleteMaintenance(Long maintenanceId);
    
}
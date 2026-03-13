package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.allotment.AllotmentResponseDTO;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;

@Component
public class AllotmentMapper {

    public AllotmentResponseDTO toDTO(Allotment allotment) {

        User user = allotment.getUser();
        Flat flat = allotment.getFlat();

        String blockName = flat.getBlock() != null
                ? flat.getBlock().getBlockName()
                : "";

        return new AllotmentResponseDTO(
                allotment.getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                flat.getId(),
                flat.getFlatNumber(),
                blockName,
                allotment.getStartDate(),
                allotment.getEndDate(),
                allotment.getStatus().name());
    }
}

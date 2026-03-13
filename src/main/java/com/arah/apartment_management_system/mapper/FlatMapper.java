package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.flat.FlatRequestDTO;
import com.arah.apartment_management_system.dto.flat.FlatResponseDTO;
import com.arah.apartment_management_system.entity.Block;
import com.arah.apartment_management_system.entity.Flat;

@Component
public class FlatMapper {

    // DTO → Entity
    public Flat toEntity(FlatRequestDTO dto, Block block) {

        Flat flat = new Flat();

        flat.setFlatNumber(dto.getFlatNumber());
        flat.setFloorNumber(dto.getFloorNumber());
        flat.setType(dto.getType());
        flat.setStatus(dto.getStatus());
        flat.setBlock(block);

        return flat;
    }

    // Entity → DTO
    public FlatResponseDTO toDTO(Flat flat) {

        return new FlatResponseDTO(
                flat.getId(),
                flat.getFlatNumber(),
                flat.getFloorNumber(),
                flat.getType(),
                flat.getStatus(),
                flat.getBlock().getId(),
                flat.getBlock().getBlockName());
    }
}

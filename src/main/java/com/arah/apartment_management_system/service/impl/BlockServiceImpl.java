package com.arah.apartment_management_system.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.block.BlockRequestDTO;
import com.arah.apartment_management_system.dto.block.BlockResponseDTO;
import com.arah.apartment_management_system.dto.block.UpdateBlockRequest;
import com.arah.apartment_management_system.entity.Apartment;
import com.arah.apartment_management_system.entity.Block;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.ApartmentRepository;
import com.arah.apartment_management_system.repository.BlockRepository;
import com.arah.apartment_management_system.service.BlockService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;
import com.arah.apartment_management_system.mapper.BlockMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlockServiceImpl implements BlockService {

    private final BlockRepository blockRepository;
    private final ApartmentRepository apartmentRepository;
    private final BlockMapper blockMapper;

    @Override
    public BlockResponseDTO createBlock(BlockRequestDTO request) {

        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

        Block block = blockMapper.toEntity(request, apartment);

        Block saved = blockRepository.save(block);

        return blockMapper.toDTO(saved);
    }

    @Override
    public ApiResponse<PageResponse<BlockResponseDTO>> getAllBlocks(String search, Pageable pageable) {

        Page<Block> blocks;

        if (search != null && !search.isBlank()) {
            blocks = blockRepository
                    .findByBlockNameContainingIgnoreCase(search, pageable);
        } else {
            blocks = blockRepository.findAll(pageable);
        }

        Page<BlockResponseDTO> dtoPage = blocks.map(blockMapper::toDTO);

        PageResponse<BlockResponseDTO> pageResponse = new PageResponse<>(
                dtoPage.getContent(),
                dtoPage.getNumber(),
                dtoPage.getSize(),
                dtoPage.getTotalElements(),
                dtoPage.getTotalPages(),
                dtoPage.isLast());

        return ApiResponse.success("Blocks fetched successfully", pageResponse);
    }

    @Override
    public BlockResponseDTO getBlockById(Long id) {

        Block block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        return blockMapper.toDTO(block);
    }

    @Override
    public void deleteBlock(Long id) {

        Block block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        blockRepository.delete(block);
    }

    @Override
    public void updateBlock(Long id, UpdateBlockRequest request) {

        Block block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        block.setBlockName(request.getBlockName());

        blockRepository.save(block);
    }
}

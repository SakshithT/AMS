package com.arah.apartment_management_system.dto.flat;

import com.arah.apartment_management_system.enums.FlatStatus;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FlatResponseDTO {

    private Long id;
    private String flatNumber;
    private Integer floorNumber;
    private String type;
    private FlatStatus status;
    private Long blockId;
    private String blockName;
}

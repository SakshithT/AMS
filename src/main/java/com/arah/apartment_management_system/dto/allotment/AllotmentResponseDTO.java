package com.arah.apartment_management_system.dto.allotment;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class AllotmentResponseDTO {
    private Long id;
    private Long userId;
    private Long flatId;
    private LocalDate startDate;
    private String status;
}


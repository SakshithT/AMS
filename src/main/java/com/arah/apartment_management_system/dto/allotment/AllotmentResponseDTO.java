package com.arah.apartment_management_system.dto.allotment;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class AllotmentResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private Long flatId;
    private String flatNumber;
    private String blockName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}

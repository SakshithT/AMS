package com.arah.apartment_management_system.dto.allotment;

import lombok.Data;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

@Data
public class AllotmentRequestDTO {
	
	@NotNull
    private Long userId;
	
	@NotNull
    private Long flatId;
	
	@NotNull
    private LocalDate startDate;
}

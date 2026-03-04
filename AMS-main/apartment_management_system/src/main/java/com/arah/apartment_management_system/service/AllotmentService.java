package com.arah.apartment_management_system.service;

import com.arah.apartment_management_system.dto.allotment.*;

public interface AllotmentService {

    AllotmentResponseDTO createAllotment(AllotmentRequestDTO request);

    public AllotmentResponseDTO getMyAllotment();

    void vacateFlat(Long allotmentId);
}

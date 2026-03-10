package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.ClubhouseBookingRequest;
import com.arah.apartment_management_system.dto.ClubhouseBookingResponse;
import com.arah.apartment_management_system.enums.BookingStatus;

public interface ClubhouseBookingService {

    ClubhouseBookingResponse createBooking(ClubhouseBookingRequest request);

    List<ClubhouseBookingResponse> getMyBookings();

    List<ClubhouseBookingResponse> getAllBookings();

    ClubhouseBookingResponse updateStatus(Long bookingId, BookingStatus status);

    void deleteBooking(Long id);

    Integer getMaxCapacity();

    Integer setMaxCapacity(Integer capacity);
}

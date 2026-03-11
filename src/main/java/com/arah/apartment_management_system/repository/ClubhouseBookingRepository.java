package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.ClubhouseBooking;
import com.arah.apartment_management_system.enums.BookingStatus;
import com.arah.apartment_management_system.enums.ClubhouseSlot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.arah.apartment_management_system.entity.User;

@Repository
public interface ClubhouseBookingRepository extends JpaRepository<ClubhouseBooking, Long> {
    List<ClubhouseBooking> findByUserOrderByCreatedAtDesc(User user);

    List<ClubhouseBooking> findAllByOrderByCreatedAtDesc();

    // Check if a slot on a given date is already booked (PENDING or APPROVED)
    Optional<ClubhouseBooking> findByOccasionDateAndSlotAndStatusIn(
            LocalDate occasionDate,
            ClubhouseSlot slot,
            List<BookingStatus> statuses);
}

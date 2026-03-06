package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.ClubhouseBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.arah.apartment_management_system.entity.User;

@Repository
public interface ClubhouseBookingRepository extends JpaRepository<ClubhouseBooking, Long> {
    List<ClubhouseBooking> findByUserOrderByCreatedAtDesc(User user);

    List<ClubhouseBooking> findAllByOrderByCreatedAtDesc();
}

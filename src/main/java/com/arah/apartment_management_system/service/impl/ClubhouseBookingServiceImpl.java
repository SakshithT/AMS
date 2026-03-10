package com.arah.apartment_management_system.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.ClubhouseBookingRequest;
import com.arah.apartment_management_system.dto.ClubhouseBookingResponse;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.ClubhouseBooking;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.BookingStatus;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.ClubhouseBookingRepository;
import com.arah.apartment_management_system.repository.SystemSettingRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.entity.SystemSetting;
import com.arah.apartment_management_system.service.ClubhouseBookingService;
import com.arah.apartment_management_system.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ClubhouseBookingServiceImpl implements ClubhouseBookingService {

    private final ClubhouseBookingRepository clubhouseBookingRepository;
    private final AllotmentRepository allotmentRepository;
    private final UserService userService;
    private final SystemSettingRepository systemSettingRepository;
    private final FlatRepository flatRepository;

    @Override
    public ClubhouseBookingResponse createBooking(ClubhouseBookingRequest request) {
        User user = userService.getLoggedInUser();

        Flat flat = null;
        if (request.getFlatId() != null) {
            flat = flatRepository.findById(request.getFlatId())
                    .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));
        } else {
            flat = allotmentRepository
                    .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                    .map(Allotment::getFlat)
                    .orElse(null);
        }

        if (flat == null) {
            throw new IllegalArgumentException("Flat ID is required for clubhouse booking");
        }

        if (request.getCapacity() != null) {
            Integer maxCapacity = getMaxCapacity();
            if (maxCapacity != null && request.getCapacity() > maxCapacity) {
                throw new IllegalArgumentException(
                        "Requested capacity exceeds maximum allowed capacity of " + maxCapacity);
            }
        }

        ClubhouseBooking booking = new ClubhouseBooking();
        booking.setName(request.getName());
        booking.setUser(user);
        booking.setFlat(flat);
        booking.setOccasionType(request.getOccasionType());
        booking.setOccasionDate(request.getOccasionDate());
        booking.setCapacity(request.getCapacity());
        booking.setRoomsForGuests(request.getRoomsForGuests());
        booking.setSpecialRequests(request.getSpecialRequests());

        if (user.getRole() == Role.ROLE_ADMIN) {
            booking.setStatus(BookingStatus.APPROVED);
        } else {
            booking.setStatus(BookingStatus.PENDING);
        }

        return mapToDTO(clubhouseBookingRepository.save(booking));
    }

    @Override
    public List<ClubhouseBookingResponse> getMyBookings() {
        User user = userService.getLoggedInUser();
        return clubhouseBookingRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClubhouseBookingResponse> getAllBookings() {
        return clubhouseBookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ClubhouseBookingResponse updateStatus(Long bookingId, BookingStatus status) {
        ClubhouseBooking booking = clubhouseBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(status);

        return mapToDTO(clubhouseBookingRepository.save(booking));
    }

    @Override
    public void deleteBooking(Long id) {
        ClubhouseBooking booking = clubhouseBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        clubhouseBookingRepository.delete(booking);
    }

    @Override
    public Integer getMaxCapacity() {
        return systemSettingRepository.findById("CLUBHOUSE_MAX_CAPACITY")
                .map(setting -> Integer.parseInt(setting.getSettingValue()))
                .orElse(null);
    }

    @Override
    public Integer setMaxCapacity(Integer capacity) {
        SystemSetting setting = systemSettingRepository.findById("CLUBHOUSE_MAX_CAPACITY")
                .orElse(new SystemSetting("CLUBHOUSE_MAX_CAPACITY", ""));
        setting.setSettingValue(String.valueOf(capacity));
        systemSettingRepository.save(setting);
        return capacity;
    }

    private ClubhouseBookingResponse mapToDTO(ClubhouseBooking booking) {
        String blockName = null;
        String apartmentName = null;
        if (booking.getFlat() != null && booking.getFlat().getBlock() != null) {
            blockName = booking.getFlat().getBlock().getBlockName();
            if (booking.getFlat().getBlock().getApartment() != null) {
                apartmentName = booking.getFlat().getBlock().getApartment().getName();
            }
        }

        return ClubhouseBookingResponse.builder()
                .id(booking.getId())
                .name(booking.getName())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .username(booking.getUser() != null ? booking.getUser().getUsername() : null)
                .flatId(booking.getFlat() != null ? booking.getFlat().getId() : null)
                .flatNumber(booking.getFlat() != null ? booking.getFlat().getFlatNumber() : null)
                .blockName(blockName)
                .apartmentName(apartmentName)
                .occasionType(booking.getOccasionType())
                .occasionDate(booking.getOccasionDate())
                .capacity(booking.getCapacity())
                .roomsForGuests(booking.getRoomsForGuests())
                .specialRequests(booking.getSpecialRequests())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}

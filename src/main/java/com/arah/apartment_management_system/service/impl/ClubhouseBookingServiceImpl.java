package com.arah.apartment_management_system.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingRequest;
import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingResponse;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.ClubhouseBooking;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.SystemSetting;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.BookingStatus;
import com.arah.apartment_management_system.enums.ClubhouseSlot;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.mapper.ClubhouseMapper;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.ClubhouseBookingRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.SystemSettingRepository;
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
    private final ClubhouseMapper clubhouseMapper;

    @Override
    public ClubhouseBookingResponse createBooking(ClubhouseBookingRequest request) {
        User user = userService.getLoggedInUser();

        Flat flat;
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

        ClubhouseSlot slot = request.getSlot() != null ? request.getSlot() : ClubhouseSlot.DAY;

        boolean slotTaken = clubhouseBookingRepository
                .findByOccasionDateAndSlotAndStatusIn(
                        request.getOccasionDate(),
                        slot,
                        List.of(BookingStatus.PENDING, BookingStatus.APPROVED))
                .isPresent();

        if (slotTaken) {
            String slotLabel = slot == ClubhouseSlot.DAY ? "Day" : "Night";
            throw new IllegalArgumentException(
                    "The " + slotLabel + " slot on " + request.getOccasionDate() +
                    " is already booked. Please choose a different date or slot.");
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
        booking.setSlot(slot);
        booking.setCapacity(request.getCapacity());
        booking.setRoomsForGuests(request.getRoomsForGuests());
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setStatus(user.getRole() == Role.ROLE_ADMIN ? BookingStatus.APPROVED : BookingStatus.PENDING);

        return clubhouseMapper.toDTO(clubhouseBookingRepository.save(booking));
    }

    @Override
    public List<ClubhouseBookingResponse> getMyBookings() {
        User user = userService.getLoggedInUser();
        return clubhouseBookingRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(clubhouseMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClubhouseBookingResponse> getAllBookings() {
        return clubhouseBookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(clubhouseMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ClubhouseBookingResponse updateStatus(Long bookingId, BookingStatus status) {
        ClubhouseBooking booking = clubhouseBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(status);
        return clubhouseMapper.toDTO(clubhouseBookingRepository.save(booking));
    }

    @Override
    public ClubhouseBookingResponse updateBooking(Long id, ClubhouseBookingRequest request) {
        ClubhouseBooking booking = clubhouseBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        ClubhouseSlot newSlot = request.getSlot() != null ? request.getSlot() : booking.getSlot();

        boolean dateOrSlotChanged = !booking.getOccasionDate().equals(request.getOccasionDate())
                || booking.getSlot() != newSlot;

        if (dateOrSlotChanged) {
            boolean slotTaken = clubhouseBookingRepository
                    .findByOccasionDateAndSlotAndStatusIn(
                            request.getOccasionDate(),
                            newSlot,
                            List.of(BookingStatus.PENDING, BookingStatus.APPROVED))
                    .filter(existing -> !existing.getId().equals(id))
                    .isPresent();

            if (slotTaken) {
                String slotLabel = newSlot == ClubhouseSlot.DAY ? "Day" : "Night";
                throw new IllegalArgumentException(
                        "The " + slotLabel + " slot on " + request.getOccasionDate() +
                        " is already booked. Please choose a different date or slot.");
            }
        }

        booking.setName(request.getName());
        booking.setOccasionType(request.getOccasionType());
        booking.setOccasionDate(request.getOccasionDate());
        booking.setSlot(newSlot);
        if (request.getCapacity() != null) booking.setCapacity(request.getCapacity());
        if (request.getRoomsForGuests() != null) booking.setRoomsForGuests(request.getRoomsForGuests());
        booking.setSpecialRequests(request.getSpecialRequests());

        return clubhouseMapper.toDTO(clubhouseBookingRepository.save(booking));
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
}

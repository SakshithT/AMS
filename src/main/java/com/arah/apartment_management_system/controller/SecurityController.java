package com.arah.apartment_management_system.controller;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.security.ParcelDTO;
import com.arah.apartment_management_system.dto.security.VehicleDTO;
import com.arah.apartment_management_system.dto.security.VisitorDTO;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.Parcel;
import com.arah.apartment_management_system.entity.Vehicle;
import com.arah.apartment_management_system.entity.Visitor;
import com.arah.apartment_management_system.enums.ParcelStatus;
import com.arah.apartment_management_system.enums.VehicleStatus;
import com.arah.apartment_management_system.enums.VisitorStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.ParcelRepository;
import com.arah.apartment_management_system.repository.VehicleRepository;
import com.arah.apartment_management_system.repository.VisitorRepository;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SECURITY')")
public class SecurityController {

    private final UserService userService;
    private final VisitorRepository visitorRepository;
    private final ParcelRepository parcelRepository;
    private final VehicleRepository vehicleRepository;

    // ========================
    // PROFILE
    // ========================

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile() {
        return ApiResponse.success("Profile fetched", userService.getLoggedInUserProfile());
    }

    @PutMapping("/profile")
    public ApiResponse<String> updateProfile(@RequestBody UpdateUserRequest request) {
        String username = userService.getLoggedInUser().getUsername();
        userService.updateProfile(username, request);
        return ApiResponse.success("Profile updated successfully", null);
    }

    // ========================
    // VISITORS
    // ========================

    @GetMapping("/visitors")
    public ApiResponse<List<VisitorDTO>> getAllVisitors() {
        List<VisitorDTO> visitors = visitorRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Visitor::getEntryTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toVisitorDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Visitors fetched", visitors);
    }

    @PostMapping("/visitors")
    public ApiResponse<VisitorDTO> checkInVisitor(@RequestBody VisitorDTO request) {
        Visitor visitor = new Visitor();
        visitor.setName(request.getName());
        visitor.setPhone(request.getPhone());
        visitor.setFlatNumber(request.getFlatNumber());
        visitor.setPurpose(request.getPurpose());
        visitor.setStatus(VisitorStatus.CHECKED_IN);
        visitor.setEntryTime(LocalDateTime.now());
        return ApiResponse.success("Visitor checked in", toVisitorDTO(visitorRepository.save(visitor)));
    }

    @PutMapping("/visitors/{id}/checkout")
    public ApiResponse<VisitorDTO> checkOutVisitor(@PathVariable Long id) {
        Visitor visitor = visitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor not found"));
        visitor.setStatus(VisitorStatus.CHECKED_OUT);
        visitor.setExitTime(LocalDateTime.now());
        return ApiResponse.success("Visitor checked out", toVisitorDTO(visitorRepository.save(visitor)));
    }

    // ========================
    // PARCELS
    // ========================

    @GetMapping("/parcels")
    public ApiResponse<List<ParcelDTO>> getAllParcels() {
        List<ParcelDTO> parcels = parcelRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Parcel::getReceivedTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toParcelDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Parcels fetched", parcels);
    }

    @PostMapping("/parcels")
    public ApiResponse<ParcelDTO> registerParcel(@RequestBody ParcelDTO request) {
        Parcel parcel = new Parcel();
        parcel.setRecipientName(request.getRecipientName());
        parcel.setFlatNumber(request.getFlatNumber());
        parcel.setCourier(request.getCourier());
        parcel.setTrackingNumber(request.getTrackingNumber());
        parcel.setStatus(ParcelStatus.PENDING);
        parcel.setReceivedTime(LocalDateTime.now());
        return ApiResponse.success("Parcel registered", toParcelDTO(parcelRepository.save(parcel)));
    }

    @PutMapping("/parcels/{id}/collect")
    public ApiResponse<ParcelDTO> markParcelCollected(@PathVariable Long id) {
        Parcel parcel = parcelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parcel not found"));
        parcel.setStatus(ParcelStatus.COLLECTED);
        parcel.setCollectedTime(LocalDateTime.now());
        return ApiResponse.success("Parcel marked as collected", toParcelDTO(parcelRepository.save(parcel)));
    }

    // ========================
    // VEHICLES
    // ========================

    @GetMapping("/vehicles")
    public ApiResponse<List<VehicleDTO>> getAllVehicles() {
        List<VehicleDTO> vehicles = vehicleRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Vehicle::getEntryTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toVehicleDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Vehicles fetched", vehicles);
    }

    @PostMapping("/vehicles")
    public ApiResponse<VehicleDTO> recordVehicleEntry(@RequestBody VehicleDTO request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setOwnerName(request.getOwnerName());
        vehicle.setFlatNumber(request.getFlatNumber());
        vehicle.setStatus(VehicleStatus.PARKED);
        vehicle.setEntryTime(LocalDateTime.now());
        return ApiResponse.success("Vehicle entry recorded", toVehicleDTO(vehicleRepository.save(vehicle)));
    }

    @PutMapping("/vehicles/{id}/exit")
    public ApiResponse<VehicleDTO> recordVehicleExit(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        vehicle.setStatus(VehicleStatus.EXITED);
        vehicle.setExitTime(LocalDateTime.now());
        return ApiResponse.success("Vehicle exit recorded", toVehicleDTO(vehicleRepository.save(vehicle)));
    }

    // ========================
    // MAPPERS
    // ========================

    private VisitorDTO toVisitorDTO(Visitor v) {
        return VisitorDTO.builder()
                .id(v.getId())
                .name(v.getName())
                .phone(v.getPhone())
                .flatNumber(v.getFlatNumber())
                .purpose(v.getPurpose())
                .status(v.getStatus())
                .entryTime(v.getEntryTime())
                .exitTime(v.getExitTime())
                .build();
    }

    private ParcelDTO toParcelDTO(Parcel p) {
        return ParcelDTO.builder()
                .id(p.getId())
                .recipientName(p.getRecipientName())
                .flatNumber(p.getFlatNumber())
                .courier(p.getCourier())
                .trackingNumber(p.getTrackingNumber())
                .status(p.getStatus())
                .receivedTime(p.getReceivedTime())
                .collectedTime(p.getCollectedTime())
                .build();
    }

    private VehicleDTO toVehicleDTO(Vehicle v) {
        return VehicleDTO.builder()
                .id(v.getId())
                .vehicleNumber(v.getVehicleNumber())
                .vehicleType(v.getVehicleType())
                .ownerName(v.getOwnerName())
                .flatNumber(v.getFlatNumber())
                .status(v.getStatus())
                .entryTime(v.getEntryTime())
                .exitTime(v.getExitTime())
                .build();
    }
}

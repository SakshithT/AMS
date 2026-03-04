package com.arah.apartment_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

import com.arah.apartment_management_system.enums.AllotmentStatus;

@Entity
@Table(name = "apartment_allotments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allotment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many allotments -> One user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Many allotments -> One flat
    @ManyToOne
    @JoinColumn(name = "flat_id", nullable = false)
    private Flat flat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllotmentStatus status;

    private LocalDate startDate;

    private LocalDate endDate;
}
package com.arah.apartment_management_system.entity;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.VisitorStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;

    private String flatNumber;

    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitorStatus status;

    private LocalDateTime entryTime;

    private LocalDateTime exitTime;

    @PrePersist
    public void prePersist() {
        if (this.status == null)
            this.status = VisitorStatus.CHECKED_IN;
        if (this.entryTime == null)
            this.entryTime = LocalDateTime.now();
    }
}

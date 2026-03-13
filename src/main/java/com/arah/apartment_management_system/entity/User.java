package com.arah.apartment_management_system.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Allotment> allotments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;
    
    @Column(name = "contact_number", unique = true, nullable = false)
    private String contactNumber;

    @Column(name = "designation")
    private String designation;

    private String resetToken;

    private LocalDateTime resetTokenExpiry;
}
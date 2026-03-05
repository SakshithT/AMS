package com.arah.apartment_management_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByResetToken(String token);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<User> findByStatus(UserStatus status);

    List<User> findByRoleIn(List<Role> roles);
}
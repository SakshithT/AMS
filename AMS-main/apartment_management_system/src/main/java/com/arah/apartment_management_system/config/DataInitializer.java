package com.arah.apartment_management_system.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;
import com.arah.apartment_management_system.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void createTestUsers() {
        createUserIfNotFound("admin", "admin@gmail.com", "admin123", Role.ROLE_ADMIN);
        createUserIfNotFound("security", "security@gmail.com", "security123", Role.ROLE_SECURITY);
        createUserIfNotFound("resident", "resident@gmail.com", "resident123", Role.ROLE_RESIDENT);
    }

    private void createUserIfNotFound(String username, String email, String password, Role role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setStatus(UserStatus.APPROVED);
            user.setContactNumber("9999999999");
            if (role == Role.ROLE_SECURITY) {
                user.setDesignation("Security Guard");
            }
            // ADMIN and RESIDENT have no designation (nullable column)
            userRepository.save(user);
            System.out.println(role + " user created: " + username);
        }
    }
}

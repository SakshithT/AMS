package com.arah.apartment_management_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Complaint;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.ComplaintStatus;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUser(User user);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();
}

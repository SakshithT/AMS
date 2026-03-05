package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.arah.apartment_management_system.entity.Apartment;

public interface ApartmentRepository extends JpaRepository<Apartment, Long>{
	
}

package com.arah.apartment_management_system.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.arah.apartment_management_system.entity.Poll;
import com.arah.apartment_management_system.enums.PollStatus;

public interface PollRepository extends JpaRepository<Poll, Long>{
	List<Poll> findByStatus(PollStatus status);

    @Modifying
    @Query("UPDATE Poll p SET p.status = 'CLOSED' WHERE p.endDate < :today AND p.status = 'ACTIVE'")
    void closeExpiredPolls(@Param("today") LocalDate today);
}

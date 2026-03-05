package com.arah.apartment_management_system;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.repository.PollRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PollScheduler {

    private final PollRepository pollRepository;

    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    @Transactional
    public void closeExpiredPolls() {
        pollRepository.closeExpiredPolls(LocalDate.now());
    }
}
package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.arah.apartment_management_system.entity.NoticeResponse;
import java.util.List;

public interface NoticeResponseRepository extends JpaRepository<NoticeResponse, Long> {
    List<NoticeResponse> findByNoticeIdOrderByCreatedAtDesc(Long noticeId);
}

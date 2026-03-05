package com.arah.apartment_management_system.service.impl;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.repository.NoticeRepository;
import com.arah.apartment_management_system.service.NoticeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService{

	private final NoticeRepository noticeRepository;
	@Override
	public List<Notice> getAllNotices() {
		return noticeRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
	}

	@Override
	public Notice createNotice(Notice notice) {
		return noticeRepository.save(notice);
	}

	@Override
	public void deleteNotice(Long id) {
		noticeRepository.deleteById(id);
	}

}

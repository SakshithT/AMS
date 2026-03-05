package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.entity.Notice;

public interface NoticeService {

	public List<Notice> getAllNotices();
	
	public Notice createNotice(Notice notice);
	
	public void deleteNotice(Long id);
}

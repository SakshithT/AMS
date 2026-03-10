package com.arah.apartment_management_system.service.impl;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.notice.NoticeResponseDTO;
import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.entity.NoticeResponse;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.NoticeRepository;
import com.arah.apartment_management_system.repository.NoticeResponseRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.service.NoticeService;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {
	private final NoticeRepository noticeRepository;
	private final NoticeResponseRepository noticeResponseRepository;
	private final UserRepository userRepository;

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

	@Override
	public List<NoticeResponseDTO> getNoticeResponses(Long noticeId) {
		List<NoticeResponse> responses = noticeResponseRepository.findByNoticeIdOrderByCreatedAtDesc(noticeId);
		return responses.stream().map(this::toNoticeResponseDTO).collect(Collectors.toList());
	}

	@Override
	public void addNoticeResponse(Long noticeId, String responseText, String username) {
		Notice notice = noticeRepository.findById(noticeId)
				.orElseThrow(() -> new ResourceNotFoundException("Notice not found"));
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		NoticeResponse response = NoticeResponse.builder()
				.notice(notice)
				.resident(user)
				.responseText(responseText)
				.build();
		noticeResponseRepository.save(response);
	}

	private NoticeResponseDTO toNoticeResponseDTO(NoticeResponse response) {
		User resident = response.getResident();
		String flatNumber = "N/A";
		if (resident != null && resident.getAllotments() != null && !resident.getAllotments().isEmpty()) {
			for (Allotment allotment : resident.getAllotments()) {
				if (allotment.getFlat() != null) {
					flatNumber = allotment.getFlat().getFlatNumber();
					break;
				}
			}
		}

		return NoticeResponseDTO.builder()
				.id(response.getId())
				.noticeId(response.getNotice().getId())
				.residentName(resident != null ? resident.getUsername() : "Unknown")
				.flatNumber(flatNumber)
				.responseText(response.getResponseText())
				.createdAt(response.getCreatedAt())
				.build();
	}

}

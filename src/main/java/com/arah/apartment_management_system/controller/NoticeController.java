package com.arah.apartment_management_system.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.notice.NoticeResponseDTO;
import com.arah.apartment_management_system.dto.notice.NoticeResponseRequest;
import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.service.NoticeService;
import com.arah.apartment_management_system.util.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class NoticeController {

	private final NoticeService noticeService;

	@PreAuthorize("hasAnyRole('ADMIN','RESIDENT')")
	@GetMapping
	public ApiResponse<List<Notice>> getAllNotices() {
		return ApiResponse.success("Notices fetched successfully", noticeService.getAllNotices());
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping
	public ApiResponse<Notice> createNotice(@RequestBody Notice notice) {
		return ApiResponse.success("Notice created successfully", noticeService.createNotice(notice));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@DeleteMapping("/{id}")
	public ApiResponse<String> deleteNotice(@PathVariable Long id) {
		noticeService.deleteNotice(id);
		return ApiResponse.success("Notice deleted successfully", null);
	}

	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/{id}/responses")
	public ApiResponse<List<NoticeResponseDTO>> getNoticeResponses(@PathVariable Long id) {
		return ApiResponse.success("Notice responses fetched", noticeService.getNoticeResponses(id));
	}

	@PreAuthorize("hasRole('RESIDENT')")
	@PostMapping("/{id}/responses")
	public ApiResponse<String> addNoticeResponse(@PathVariable Long id, @RequestBody NoticeResponseRequest request,
			Principal principal) {
		noticeService.addNoticeResponse(id, request.getResponseText(), principal.getName());
		return ApiResponse.success("Response added successfully", null);
	}
}

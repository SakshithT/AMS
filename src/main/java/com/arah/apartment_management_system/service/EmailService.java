package com.arah.apartment_management_system.service;

public interface EmailService {

    void sendResetPasswordEmail(String toEmail, String token);
}
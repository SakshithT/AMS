package com.arah.apartment_management_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendResetPasswordEmail(String toEmail, String token) {

        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("lachochow1991@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password - BR Meadowlands");

            String htmlContent =
                    "<div style='font-family:Arial,sans-serif; background-color:#f4f6f8; padding:30px;'>"
                            + "<div style='max-width:600px; margin:auto; background:white; padding:30px; border-radius:8px;'>"
                            + "<h2 style='color:#2c3e50; text-align:center;'>BR Meadowlands</h2>"
                            + "<p>Hello,</p>"
                            + "<p>We received a request to reset your password.</p>"
                            + "<p style='text-align:center;'>"
                            + "<a href='" + resetLink + "' "
                            + "style='background-color:#007bff; color:white; padding:12px 20px; "
                            + "text-decoration:none; border-radius:5px; font-weight:bold;'>"
                            + "Reset Password"
                            + "</a>"
                            + "</p>"
                            + "<p>This link will expire in <b>15 minutes</b>.</p>"
                            + "<p>If you did not request this, please ignore this email.</p>"
                            + "<hr style='margin:20px 0;'>"
                            + "<p style='font-size:12px; color:gray; text-align:center;'>"
                            + "© 2026 BR Meadowlands Apartment Management System"
                            + "</p>"
                            + "</div>"
                            + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
package com.easepath.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Email service for sending transactional emails via Resend SMTP.
 * Uses Spring's JavaMailSender (already configured in application.properties).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String FROM_EMAIL = "EasePath@mail.easepath.app";
    private static final java.util.regex.Pattern EMAIL_REGEX = java.util.regex.Pattern
            .compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send a welcome email to a first-time user.
     * Validates email format with regex before sending.
     * Runs asynchronously so it doesn't block the login response.
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        if (mailSender == null) {
            log.warn("Mail sender not configured — skipping welcome email for {}", toEmail);
            return;
        }

        if (toEmail == null || !EMAIL_REGEX.matcher(toEmail).matches()) {
            log.warn("Invalid email format — skipping welcome email for {}", toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to EasePath!");

            String greeting = (firstName != null && !firstName.isBlank())
                    ? firstName
                    : "there";

            // Build icon helper — blue circle with white letter
            String iconStyle = "display:inline-block;width:36px;height:36px;background:#2563eb;"
                    + "border-radius:50%;color:#ffffff;text-align:center;line-height:36px;"
                    + "font-size:16px;font-weight:700;";

            String htmlBody = "<!DOCTYPE html>"
                    + "<html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head>"
                    + "<body style=\"margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Arial, sans-serif;\">"
                    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f0f4f8;\">"
                    + "<tr><td align=\"center\" style=\"padding: 40px 20px;\">"
                    + "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;\">"

                    // Header with CID logo
                    + "<tr><td style=\"background: linear-gradient(135deg, #1a56db 0%, #2563eb 50%, #3b82f6 100%); padding: 48px 40px 40px; text-align: center;\">"
                    + "<img src=\"cid:eplogo\" alt=\"EP\" width=\"52\" height=\"52\" style=\"margin-bottom: 16px; border-radius: 12px;\" />"
                    + "<h1 style=\"color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 700;\">Welcome to EasePath!</h1>"
                    + "<p style=\"color: rgba(255,255,255,0.75); margin: 0; font-size: 15px;\">Your job search just got a whole lot easier</p>"
                    + "</td></tr>"

                    // Greeting
                    + "<tr><td style=\"padding: 36px 40px 16px;\">"
                    + "<p style=\"color: #1e293b; font-size: 17px; line-height: 1.7; margin: 0;\">Hey <strong style=\"color: #2563eb;\">"
                    + greeting + "</strong>,</p>"
                    + "<p style=\"color: #475569; font-size: 15px; line-height: 1.7; margin: 12px 0 0;\">We're thrilled to have you on board! EasePath is designed to streamline every step of your job search &mdash; from discovering roles to applying for applications.</p>"
                    + "</td></tr>"

                    // Feature Cards
                    + "<tr><td style=\"padding: 20px 40px;\">"
                    + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">"

                    // Search Jobs
                    + featureCard(iconStyle, "S", "Search Jobs", "Browse thousands of opportunities with smart filters")
                    // Track Applications
                    + featureCard(iconStyle, "T", "Track Applications",
                            "Keep tabs on every application with real-time status updates")
                    // Auto-fill (last card, no bottom padding)
                    + featureCardLast(iconStyle, "A", "Auto-fill Applications",
                            "Save hours with our browser extension that fills forms for you")

                    // Upload Resume
                    + featureCard(iconStyle, "R", "Upload Your Resume",
                            "Let our AI score your resume and give ATS feedback to make sure your resume gets seen.")

                    + "</table></td></tr>"

                    // CTA Button
                    + "<tr><td style=\"padding: 24px 40px; text-align: center;\">"
                    + "<a href=\"https://easepath.app/dashboard\" style=\"display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 44px; border-radius: 10px; font-size: 16px; font-weight: 600;\">Get Started</a>"
                    + "</td></tr>"

                    // Footer
                    + "<tr><td style=\"padding: 24px 40px 32px; border-top: 1px solid #e2e8f0;\">"
                    + "<p style=\"color: #94a3b8; font-size: 12px; margin: 0; text-align: center; line-height: 1.6;\">"
                    + "You're receiving this because you created an EasePath account.<br>"
                    + "&copy; 2026 EasePath &mdash; Making job search easier.</p>"
                    + "</td></tr>"

                    + "</table></td></tr></table></body></html>";

            helper.setText(htmlBody, true);

            // Attach logo as CID inline image — works in Gmail
            ClassPathResource logo = new ClassPathResource("email/EPlogosmall.png");
            helper.addInline("eplogo", logo, "image/png");

            mailSender.send(message);
            log.info("Welcome email sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    /** Build a feature card row with bottom padding */
    private String featureCard(String iconStyle, String letter, String title, String description) {
        return "<tr><td style=\"padding-bottom: 10px;\">"
                + cardInner(iconStyle, letter, title, description)
                + "</td></tr>";
    }

    /** Build the last feature card row (no bottom padding) */
    private String featureCardLast(String iconStyle, String letter, String title, String description) {
        return "<tr><td>"
                + cardInner(iconStyle, letter, title, description)
                + "</td></tr>";
    }

    /** Inner card table structure */
    private String cardInner(String iconStyle, String letter, String title, String description) {
        return "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px;\">"
                + "<tr>"
                + "<td style=\"width: 56px; padding: 14px 0 14px 14px; vertical-align: middle;\">"
                + "<div style=\"" + iconStyle + "\">" + letter + "</div>"
                + "</td>"
                + "<td style=\"padding: 14px 14px 14px 12px;\">"
                + "<p style=\"color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 2px;\">" + title + "</p>"
                + "<p style=\"color: #64748b; font-size: 13px; margin: 0; line-height: 1.4;\">" + description + "</p>"
                + "</td></tr></table>";
    }
}

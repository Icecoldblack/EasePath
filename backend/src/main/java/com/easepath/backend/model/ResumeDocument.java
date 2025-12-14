package com.easepath.backend.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resumes")
public class ResumeDocument {

    @Id
    private String id;
    private String userEmail; // Links resume to user
    private String title;
    private String summary;
    private String parsedText;
    private List<String> keywords;
    private Instant createdAt;

    // File storage fields
    private String fileName;
    private String contentType;
    private String fileData; // Base64 encoded file content
    private Long fileSize;

    // Cached AI score fields (to avoid calling OpenAI on every page load)
    private Integer scoreOverall;
    private Integer scoreProfile;
    private Integer scoreKeywords;
    private Integer scoreAts;
    private String scoreMessage;

    public ResumeDocument() {
        // Default constructor for Mongo mapping
    }

    public ResumeDocument(String id, String userEmail, String title, String summary, String parsedText,
            List<String> keywords, Instant createdAt) {
        this.id = id;
        this.userEmail = userEmail;
        this.title = title;
        this.summary = summary;
        this.parsedText = parsedText;
        this.keywords = keywords;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getParsedText() {
        return parsedText;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void setParsedText(String parsedText) {
        this.parsedText = parsedText;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    // File storage getters/setters
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getFileData() {
        return fileData;
    }

    public void setFileData(String fileData) {
        this.fileData = fileData;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Integer getScoreOverall() {
        return scoreOverall;
    }

    public void setScoreOverall(Integer scoreOverall) {
        this.scoreOverall = scoreOverall;
    }

    public Integer getScoreProfile() {
        return scoreProfile;
    }

    public void setScoreProfile(Integer scoreProfile) {
        this.scoreProfile = scoreProfile;
    }

    public Integer getScoreKeywords() {
        return scoreKeywords;
    }

    public void setScoreKeywords(Integer scoreKeywords) {
        this.scoreKeywords = scoreKeywords;
    }

    public Integer getScoreAts() {
        return scoreAts;
    }

    public void setScoreAts(Integer scoreAts) {
        this.scoreAts = scoreAts;
    }

    public String getScoreMessage() {
        return scoreMessage;
    }

    public void setScoreMessage(String scoreMessage) {
        this.scoreMessage = scoreMessage;
    }
}

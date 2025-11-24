package com.easepath.backend.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resumes")
public class ResumeDocument {

    @Id
    private String id;
    private String title;
    private String summary;
    private String parsedText;
    private List<String> keywords;
    private Instant createdAt;

    public ResumeDocument() {
        // Default constructor for Mongo mapping
    }

    public ResumeDocument(String id, String title, String summary, String parsedText,
            List<String> keywords, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.parsedText = parsedText;
        this.keywords = keywords;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
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
}

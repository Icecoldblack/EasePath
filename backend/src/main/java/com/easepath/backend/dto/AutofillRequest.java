package com.easepath.backend.dto;

import java.util.List;

/**
 * Request from the extension containing form field data for AI analysis.
 */
public class AutofillRequest {
    
    private String url;
    private String userEmail; // To identify the user
    private List<FormFieldInfo> formFields;

    public static class FormFieldInfo {
        private String id;
        private String name;
        private String type;
        private String label;
        private String placeholder;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getPlaceholder() { return placeholder; }
        public void setPlaceholder(String placeholder) { this.placeholder = placeholder; }
    }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public List<FormFieldInfo> getFormFields() { return formFields; }
    public void setFormFields(List<FormFieldInfo> formFields) { this.formFields = formFields; }
}

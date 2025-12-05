chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetch_ai_mapping") {
        
        // In a real implementation, this would call your Spring Boot Backend
        // fetch('http://localhost:8080/api/extension/autofill', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(request.formData)
        // })
        // .then(res => res.json())
        // .then(data => sendResponse({ mapping: data }))
        // .catch(err => sendResponse({ error: err.message }));

        // MOCK RESPONSE for demonstration
        console.log("Background: Mocking AI response for", request.url);
        
        const mockMapping = {};
        
        // Simple heuristic mock
        request.formData.forEach(field => {
            const label = (field.label || "").toLowerCase();
            const name = (field.name || "").toLowerCase();
            const id = (field.id || "").toLowerCase();
            const combined = label + " " + name + " " + id;

            if (combined.includes("first") && combined.includes("name")) {
                mockMapping[field.id || field.name] = "John";
            } else if (combined.includes("last") && combined.includes("name")) {
                mockMapping[field.id || field.name] = "Doe";
            } else if (combined.includes("email")) {
                mockMapping[field.id || field.name] = "john.doe@example.com";
            } else if (combined.includes("phone")) {
                mockMapping[field.id || field.name] = "555-0123";
            } else if (combined.includes("linkedin")) {
                mockMapping[field.id || field.name] = "linkedin.com/in/johndoe";
            }
        });

        sendResponse({ mapping: mockMapping });
        
        return true; // Keep channel open
    }
});

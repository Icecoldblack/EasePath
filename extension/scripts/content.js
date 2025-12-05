// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autofill") {
        console.log("EasePath: Starting autofill process...");
        
        // 1. Identify all input fields
        const inputs = document.querySelectorAll('input, textarea, select');
        const formData = [];

        inputs.forEach(input => {
            if (input.type === 'hidden' || input.style.display === 'none') return;
            
            formData.push({
                id: input.id,
                name: input.name,
                type: input.type,
                label: findLabelForInput(input),
                placeholder: input.placeholder
            });
        });

        console.log("EasePath: Found fields:", formData);

        // 2. Send this data to the background script to query the AI/Backend
        chrome.runtime.sendMessage({ 
            action: "fetch_ai_mapping", 
            formData: formData,
            url: window.location.href
        }, (response) => {
            if (response && response.mapping) {
                applyMapping(response.mapping);
                sendResponse({ status: 'success' });
            } else {
                console.error("EasePath: No mapping received");
                sendResponse({ status: 'error' });
            }
        });

        return true; // Keep channel open for async response
    }
});

function findLabelForInput(input) {
    // Heuristic to find the label associated with an input
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.innerText;
    }
    // Check parent
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.innerText;
    
    return "";
}

function applyMapping(mapping) {
    console.log("EasePath: Applying AI mapping...", mapping);
    // mapping is an object like { "input-id-1": "John", "input-name-email": "john@doe.com" }
    
    for (const [identifier, value] of Object.entries(mapping)) {
        let element = document.getElementById(identifier) || document.getElementsByName(identifier)[0];
        
        if (element) {
            element.value = value;
            // Trigger change events so React/Angular apps detect the change
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.style.backgroundColor = "#e0f2fe"; // Highlight filled fields
        }
    }
}

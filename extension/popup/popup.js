document.addEventListener('DOMContentLoaded', () => {
    const autofillBtn = document.getElementById('autofill-btn');
    const saveBtn = document.getElementById('save-btn');
    const statusBadge = document.getElementById('status');

    autofillBtn.addEventListener('click', async () => {
        statusBadge.textContent = 'Scanning...';
        
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Send message to content script
        chrome.tabs.sendMessage(tab.id, { action: "autofill" }, (response) => {
            if (chrome.runtime.lastError) {
                statusBadge.textContent = 'Error';
                console.error(chrome.runtime.lastError);
                return;
            }
            
            if (response && response.status === 'success') {
                statusBadge.textContent = 'Filled!';
            } else {
                statusBadge.textContent = 'Failed';
            }
        });
    });

    saveBtn.addEventListener('click', async () => {
        // Logic to save the page structure for learning
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: "analyze" });
    });
});

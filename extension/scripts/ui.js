// EasePath - UI Components
// Overlay, notifications, and visual feedback functions

/**
 * Display a processing overlay with a spinner and message.
 *
 * Removes any existing EasePath overlay, then creates and appends a fixed,
 * styled overlay containing a spinner and the provided message.
 * @param {string} message - The text to display inside the overlay.
 */
function showProcessingOverlay(message) {
    hideOverlay(); // Remove any existing overlay

    const overlay = document.createElement('div');
    overlay.id = 'easepath-overlay';
    overlay.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideIn 0.3s ease-out;
        ">
            <div class="spinner" style="
                width: 24px;
                height: 24px;
                border: 3px solid rgba(255,255,255,0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <span id="easepath-overlay-text">${message}</span>
        </div>
        <style>
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        </style>
    `;
    document.body.appendChild(overlay);
}

/**
 * Update the visible overlay's message text.
 *
 * If an element with id "easepath-overlay-text" exists, its text content is replaced with the provided message; otherwise the function does nothing.
 * @param {string} message - The text to display inside the overlay.
 */
function updateOverlay(message) {
    const text = document.getElementById('easepath-overlay-text');
    if (text) text.textContent = message;
}

/**
 * Remove the EasePath overlay from the document if it exists.
 *
 * Finds the element with id 'easepath-overlay' and removes it from the DOM when present.
 */
function hideOverlay() {
    const overlay = document.getElementById('easepath-overlay');
    if (overlay) overlay.remove();
}

/**
 * Show a transient success notification overlay with the provided message.
 *
 * Removes any existing overlay, displays a green success-styled overlay in the top-right of the page,
 * and automatically hides the overlay after 3 seconds.
 *
 * @param {string} message - Message text to display inside the success overlay.
 */
function showSuccessOverlay(message) {
    hideOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'easepath-overlay';
    overlay.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 10px 40px rgba(17, 153, 142, 0.4);
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideIn 0.3s ease-out;
        ">
            <span style="font-size: 24px;"></span>
            <span>${message}</span>
        </div>
        <style>
            @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        </style>
    `;
    document.body.appendChild(overlay);

    setTimeout(hideOverlay, 3000);
}

/**
 * Visually highlights each essay question element by applying an orange border, a light orange background, and rounded corners.
 * @param {Array<{element: HTMLElement}>} essayQuestions - Array of objects whose `element` property is the DOM element to highlight; items without an `element` are skipped.
 */
function highlightEssayQuestions(essayQuestions) {
    essayQuestions.forEach(question => {
        const el = question.element;
        if (el) {
            el.style.border = '3px solid #ff9800';
            el.style.backgroundColor = 'rgba(255, 152, 0, 0.1)';
            el.style.borderRadius = '8px';
        }
    });
}

/**
 * Log a disabled notification about detected essay questions to the console.
 *
 * Currently this notification is disabled; the function records the number of
 * detected essay questions using a console message for debugging or telemetry.
 *
 * @param {Array} essayQuestions - Array of detected essay question objects (only the count is used).
 */
function showEssayNotification(essayQuestions) {
    // Disabled - no longer showing the pink notification
    console.log("EasePath: Found", essayQuestions.length, "essay questions (notification disabled)");
}

console.log("EasePath: ui.js loaded");
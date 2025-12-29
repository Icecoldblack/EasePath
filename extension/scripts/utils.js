// EasePath - DOM Utilities
// Helper functions for DOM manipulation and analysis

/**
 * Dispatch focus, input, change, and blur native events on a DOM element so UI frameworks detect value changes.
 * @param {Element|null|undefined} element - The target DOM element; if falsy the function does nothing.
 */
function nativeDispatchEvents(element) {
    if (!element) return;

    const events = [
        new Event('focus', { bubbles: true }),
        new Event('input', { bubbles: true, inputType: 'insertText' }),
        new Event('change', { bubbles: true }),
        new Event('blur', { bubbles: true })
    ];

    events.forEach(evt => element.dispatchEvent(evt));

    try {
        const tracker = element._valueTracker;
        if (tracker) {
            tracker.setValue('');
        }
    } catch (e) {
        // Ignore errors for internal React props
    }
}

/**
 * Attempt a click on a DOM element in a way that triggers both native and common framework handlers.
 *
 * @param {Element|HTMLElement|null|undefined} element - The target DOM element.
 * @returns {boolean} `true` if the click sequence was executed successfully, `false` otherwise.
 */
async function performRobustClick(element) {
    if (!element) return false;

    try {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(100);

        // Focus first
        if (element.focus) element.focus();

        // Try native click
        element.click();

        // Also dispatch mouse events for stubborn frameworks
        const mouseEvents = ['mousedown', 'mouseup', 'click'];
        mouseEvents.forEach(eventType => {
            element.dispatchEvent(new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });

        // Dispatch change event
        element.dispatchEvent(new Event('change', { bubbles: true }));

        return true;
    } catch (e) {
        console.error("EasePath: Error in performRobustClick:", e);
        return false;
    }
}

/**
 * Pause execution for a given duration.
 * @param {number} ms - Delay duration in milliseconds.
 * @returns {Promise<void>} Resolves with no value after the specified delay.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Normalize whitespace in a string by collapsing runs of whitespace to a single space and trimming ends.
 * @param {string|undefined|null} text - The input text; falsy values are treated as an empty string.
 * @returns {string} The input with consecutive whitespace replaced by single spaces and leading/trailing space removed.
 */
function cleanText(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
}

/**
 * Determine whether a DOM element is currently visible in the document.
 * @param {Element|HTMLElement|null|undefined} element - The DOM element to check.
 * @returns {boolean} `true` if the element has width and height greater than zero and its computed `display` is not `none` and `visibility` is not `hidden`, `false` otherwise.
 */
function isElementVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
}

/**
 * Check whether the text contains any of the provided patterns (case-insensitive).
 * @param {string} text - The text to search.
 * @param {string[]} patterns - Substrings to look for within `text`.
 * @returns {boolean} `true` if any pattern is found in `text` (case-insensitive), `false` otherwise.
 */
function matchesAny(text, patterns) {
    const lower = text.toLowerCase();
    return patterns.some(p => lower.includes(p.toLowerCase()));
}

/**
 * Extracts readable text from a DOM element.
 *
 * If the element has visible text or a value, that text is normalized (consecutive whitespace collapsed and trimmed) before being returned. Returns an empty string for falsy input or when no text is available.
 * @param {Element|Node|null|undefined} element - DOM element to read text from.
 * @returns {string} The element's cleaned text, or an empty string if none is found.
 */
function getElementText(element) {
    if (!element) return '';
    return cleanText(element.innerText || element.textContent || element.value || '');
}

/**
 * Temporarily highlights a DOM element with a green border and translucent green background, then restores its original border and background color after 2 seconds.
 * @param {HTMLElement} element - The element to highlight; if falsy the function does nothing.
 */
function highlightElement(element) {
    if (!element) return;
    const originalBorder = element.style.border;
    const originalBackground = element.style.backgroundColor;

    element.style.border = '2px solid #4CAF50';
    element.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';

    setTimeout(() => {
        element.style.border = originalBorder;
        element.style.backgroundColor = originalBackground;
    }, 2000);
}

console.log("EasePath: utils.js loaded");
// EasePath Content Script - Smart Form Autofiller
// Analyzes page content and uses AI to intelligently fill forms

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autofill") {
        console.log("EasePath: Starting smart autofill process...");
        performSmartAutofill(request.autoSubmit || false, sendResponse);
        return true; // Keep channel open for async response
    }
    
    if (request.action === "capture_answers") {
        console.log("EasePath: Capturing user answers for learning...");
        captureAndLearnAnswers();
        sendResponse({ status: 'captured' });
        return true;
    }
    
    if (request.action === "auto_submit") {
        console.log("EasePath: Auto-submit requested...");
        const submitted = autoSubmitForm();
        sendResponse({ status: submitted ? 'success' : 'error', submitted: submitted });
        return true;
    }
});

/**
 * Main smart autofill function - analyzes the page thoroughly
 */
async function performSmartAutofill(autoSubmit, sendResponse) {
    try {
        // 1. Deep page analysis
        const pageAnalysis = analyzePageContent();
        console.log("EasePath: Page analysis complete:", pageAnalysis);
        
        // 2. Collect all form fields with rich context
        const formFields = collectFormFieldsWithContext();
        console.log("EasePath: Found", formFields.length, "fields");
        
        // 3. Identify essay/long-answer questions
        const essayQuestions = formFields.filter(f => isEssayQuestion(f));
        const regularFields = formFields.filter(f => !isEssayQuestion(f));
        
        // 4. Send to backend for AI mapping
        chrome.runtime.sendMessage({
            action: "fetch_ai_mapping",
            formData: regularFields,
            pageContext: pageAnalysis,
            url: window.location.href,
            autoSubmit: autoSubmit
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("EasePath: Runtime error:", chrome.runtime.lastError);
                sendResponse({ status: 'error', error: chrome.runtime.lastError.message });
                return;
            }
            
            if (response && response.error) {
                console.error("EasePath: Backend error:", response.error);
                sendResponse({
                    status: 'error',
                    error: response.error,
                    needsLogin: response.needsLogin,
                    needsProfile: response.needsProfile,
                    serverError: response.serverError
                });
                return;
            }
            
            if (response && response.mapping && Object.keys(response.mapping).length > 0) {
                // Apply the mapping
                const filledCount = applySmartMapping(response.mapping, formFields);
                
                // Handle essay questions - notify user
                if (essayQuestions.length > 0) {
                    highlightEssayQuestions(essayQuestions);
                    showEssayNotification(essayQuestions);
                }
                
                sendResponse({
                    status: 'success',
                    filledCount: filledCount,
                    essayQuestions: essayQuestions.length,
                    message: essayQuestions.length > 0 
                        ? `Filled ${filledCount} fields. ${essayQuestions.length} essay question(s) need your attention.`
                        : `Filled ${filledCount} fields successfully!`
                });
            } else {
                sendResponse({ status: 'error', error: 'No field mappings found' });
            }
        });
    } catch (error) {
        console.error("EasePath: Autofill error:", error);
        sendResponse({ status: 'error', error: error.message });
    }
}

/**
 * Analyze the page content to understand context
 */
function analyzePageContent() {
    const analysis = {
        pageTitle: document.title,
        jobTitle: null,
        company: null,
        isJobApplication: false,
        platform: detectPlatform(),
        sections: []
    };
    
    // Check if this is a job application page
    const bodyText = document.body.innerText.toLowerCase();
    analysis.isJobApplication = 
        bodyText.includes('apply') ||
        bodyText.includes('application') ||
        bodyText.includes('resume') ||
        bodyText.includes('cover letter') ||
        bodyText.includes('work experience');
    
    // Try to extract job title
    const jobTitleSelectors = [
        'h1', '.job-title', '[data-testid*="job-title"]', '.posting-headline',
        '[class*="JobTitle"]', '[class*="job-title"]'
    ];
    for (const selector of jobTitleSelectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.length < 100) {
            analysis.jobTitle = el.innerText.trim();
            break;
        }
    }
    
    // Try to extract company name
    const companySelectors = [
        '.company-name', '[data-testid*="company"]', '.employer-name',
        '[class*="CompanyName"]', '[class*="company-name"]'
    ];
    for (const selector of companySelectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.length < 50) {
            analysis.company = el.innerText.trim();
            break;
        }
    }
    
    // Identify form sections
    const sections = document.querySelectorAll('section, fieldset, [role="group"], .form-section');
    sections.forEach(section => {
        const heading = section.querySelector('h2, h3, h4, legend, .section-title');
        if (heading) {
            analysis.sections.push(heading.innerText.trim());
        }
    });
    
    return analysis;
}

/**
 * Detect the job application platform
 */
function detectPlatform() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes('greenhouse.io') || hostname.includes('boards.greenhouse')) return 'greenhouse';
    if (hostname.includes('lever.co')) return 'lever';
    if (hostname.includes('workday')) return 'workday';
    if (hostname.includes('taleo')) return 'taleo';
    if (hostname.includes('icims')) return 'icims';
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('indeed')) return 'indeed';
    if (hostname.includes('glassdoor')) return 'glassdoor';
    if (hostname.includes('smartrecruiters')) return 'smartrecruiters';
    if (hostname.includes('jobvite')) return 'jobvite';
    if (hostname.includes('ashbyhq')) return 'ashby';
    if (hostname.includes('myworkdayjobs')) return 'workday';
    
    return 'unknown';
}

/**
 * Collect all form fields with rich contextual information
 */
function collectFormFieldsWithContext() {
    const fields = [];
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input, index) => {
        // Skip hidden and invisible fields
        if (input.type === 'hidden' || !isElementVisible(input)) return;
        // Skip submit/button types
        if (['submit', 'button', 'reset', 'image'].includes(input.type)) return;
        
        const field = {
            index: index,
            id: input.id || null,
            name: input.name || null,
            type: input.type || (input.tagName === 'TEXTAREA' ? 'textarea' : input.tagName === 'SELECT' ? 'select' : 'text'),
            tagName: input.tagName.toLowerCase(),
            label: findLabelForInput(input),
            placeholder: input.placeholder || null,
            ariaLabel: input.getAttribute('aria-label') || null,
            required: input.required || input.hasAttribute('required'),
            maxLength: input.maxLength > 0 ? input.maxLength : null,
            pattern: input.pattern || null,
            currentValue: input.value || '',
            options: input.tagName === 'SELECT' ? getSelectOptions(input) : null,
            parentSection: findParentSection(input),
            nearbyText: getNearbyText(input),
            isLongAnswer: isLongAnswerField(input),
            dataAttributes: getDataAttributes(input)
        };
        
        fields.push(field);
    });
    
    return fields;
}

/**
 * Find the label associated with an input
 */
function findLabelForInput(input) {
    // Method 1: Check for explicit label with 'for' attribute
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return cleanText(label.innerText);
    }
    
    // Method 2: Check if input is inside a label
    const parentLabel = input.closest('label');
    if (parentLabel) return cleanText(parentLabel.innerText);
    
    // Method 3: Check aria-labelledby
    const labelledBy = input.getAttribute('aria-labelledby');
    if (labelledBy) {
        const labelEl = document.getElementById(labelledBy);
        if (labelEl) return cleanText(labelEl.innerText);
    }
    
    // Method 4: Check previous sibling
    let sibling = input.previousElementSibling;
    while (sibling) {
        if (sibling.tagName === 'LABEL' || sibling.classList.contains('label')) {
            return cleanText(sibling.innerText);
        }
        sibling = sibling.previousElementSibling;
    }
    
    // Method 5: Check parent's previous sibling or parent label
    const parent = input.parentElement;
    if (parent) {
        const prevSibling = parent.previousElementSibling;
        if (prevSibling && (prevSibling.tagName === 'LABEL' || prevSibling.classList.contains('label'))) {
            return cleanText(prevSibling.innerText);
        }
        // Check for label within parent
        const labelInParent = parent.querySelector('label, .label, .field-label');
        if (labelInParent && !labelInParent.contains(input)) {
            return cleanText(labelInParent.innerText);
        }
    }
    
    // Method 6: Check for legend in fieldset
    const fieldset = input.closest('fieldset');
    if (fieldset) {
        const legend = fieldset.querySelector('legend');
        if (legend) return cleanText(legend.innerText);
    }
    
    return '';
}

/**
 * Get options from a select element
 */
function getSelectOptions(select) {
    return Array.from(select.options).map(opt => ({
        value: opt.value,
        text: opt.text,
        selected: opt.selected
    }));
}

/**
 * Find the section/category this input belongs to
 */
function findParentSection(input) {
    const section = input.closest('section, fieldset, [role="group"], .form-section, .section');
    if (section) {
        const heading = section.querySelector('h2, h3, h4, legend, .section-title, .section-header');
        if (heading) return cleanText(heading.innerText);
    }
    return null;
}

/**
 * Get nearby text that might provide context
 */
function getNearbyText(input) {
    const parent = input.closest('.form-group, .field-group, .form-field, .question');
    if (parent) {
        // Get text from description/help text elements
        const helpText = parent.querySelector('.help-text, .description, .hint, small, .field-description');
        if (helpText) return cleanText(helpText.innerText);
    }
    return null;
}

/**
 * Get data-* attributes that might be useful
 */
function getDataAttributes(input) {
    const attrs = {};
    for (const attr of input.attributes) {
        if (attr.name.startsWith('data-')) {
            attrs[attr.name] = attr.value;
        }
    }
    return Object.keys(attrs).length > 0 ? attrs : null;
}

/**
 * Check if an element is visible
 */
function isElementVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetParent !== null;
}

/**
 * Check if this is a long-answer/essay field
 */
function isLongAnswerField(input) {
    // Textareas are typically long answer
    if (input.tagName === 'TEXTAREA') return true;
    
    // Check maxlength - if > 500, likely long answer
    if (input.maxLength && input.maxLength > 500) return true;
    
    // Check for contenteditable divs (rich text editors)
    if (input.getAttribute('contenteditable') === 'true') return true;
    
    return false;
}

/**
 * Determine if a field is an essay question
 */
function isEssayQuestion(field) {
    if (!field.isLongAnswer) return false;
    
    const label = (field.label || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const combined = label + ' ' + placeholder;
    
    // Essay indicators
    const essayKeywords = [
        'why', 'describe', 'explain', 'tell us', 'share', 'what makes',
        'cover letter', 'motivation', 'experience with', 'interest in',
        'passion', 'challenges', 'achievements', 'projects', 'goals',
        'how would you', 'what would you', 'why are you', 'why do you',
        'tell me about', 'write about', 'elaborate', 'additional information'
    ];
    
    return essayKeywords.some(kw => combined.includes(kw));
}

/**
 * Apply the AI mapping to form fields
 */
function applySmartMapping(mapping, fields) {
    console.log("EasePath: Applying smart mapping:", mapping);
    let filledCount = 0;
    
    for (const [identifier, value] of Object.entries(mapping)) {
        if (!value || value === '') continue;
        
        // Find the element
        let element = document.getElementById(identifier);
        if (!element) {
            element = document.querySelector(`[name="${identifier}"]`);
        }
        if (!element) {
            // Try to find by index
            const field = fields.find(f => f.id === identifier || f.name === identifier);
            if (field && field.index !== undefined) {
                const allInputs = document.querySelectorAll('input, textarea, select');
                element = allInputs[field.index];
            }
        }
        
        if (element) {
            if (element.tagName === 'SELECT') {
                // Handle select dropdowns
                fillSelectElement(element, value);
            } else if (element.type === 'checkbox') {
                // Handle checkboxes
                element.checked = value === true || value === 'true' || value === 'yes';
                element.dispatchEvent(new Event('change', { bubbles: true }));
            } else if (element.type === 'radio') {
                // Handle radio buttons
                const radioGroup = document.querySelectorAll(`input[name="${element.name}"]`);
                radioGroup.forEach(radio => {
                    if (radio.value.toLowerCase() === value.toLowerCase()) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            } else {
                // Handle regular inputs
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                // Some React apps need focus/blur
                element.dispatchEvent(new Event('focus', { bubbles: true }));
                element.dispatchEvent(new Event('blur', { bubbles: true }));
            }
            
            // Visual feedback
            element.style.backgroundColor = "#e0f7fa";
            element.style.transition = "background-color 0.3s";
            setTimeout(() => {
                element.style.backgroundColor = "";
            }, 2000);
            
            filledCount++;
        }
    }
    
    return filledCount;
}

/**
 * Fill a select element by matching value or text
 */
function fillSelectElement(select, value) {
    const valueLower = value.toLowerCase().trim();
    
    // Try exact value match
    for (const option of select.options) {
        if (option.value.toLowerCase() === valueLower) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }
    
    // Try text match
    for (const option of select.options) {
        if (option.text.toLowerCase().includes(valueLower) || 
            valueLower.includes(option.text.toLowerCase())) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }
    
    // Try partial match
    for (const option of select.options) {
        const optText = option.text.toLowerCase();
        const optValue = option.value.toLowerCase();
        if (optText.includes(valueLower.split(' ')[0]) || 
            optValue.includes(valueLower.split(' ')[0])) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }
    
    return false;
}

/**
 * Highlight essay questions that need user attention
 */
function highlightEssayQuestions(essayQuestions) {
    essayQuestions.forEach(field => {
        let element = document.getElementById(field.id);
        if (!element && field.name) {
            element = document.querySelector(`[name="${field.name}"]`);
        }
        
        if (element) {
            element.style.border = "2px solid #ff9800";
            element.style.boxShadow = "0 0 10px rgba(255, 152, 0, 0.3)";
            
            // Add a label above the field
            const marker = document.createElement('div');
            marker.className = 'easepath-essay-marker';
            marker.innerHTML = `
                <span style="
                    display: inline-block;
                    background: #ff9800;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    margin-bottom: 4px;
                ">
                    ✍️ Essay Question - Please fill manually
                </span>
            `;
            element.parentElement.insertBefore(marker, element);
        }
    });
}

/**
 * Show notification about essay questions
 */
function showEssayNotification(essayQuestions) {
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'easepath-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 999999;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.3s ease-out;
        ">
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 24px;">✍️</span>
                <div>
                    <strong style="display: block; margin-bottom: 4px;">
                        ${essayQuestions.length} Essay Question${essayQuestions.length > 1 ? 's' : ''} Found
                    </strong>
                    <p style="margin: 0; font-size: 13px; opacity: 0.9;">
                        These questions require your personal response. They've been highlighted in orange.
                    </p>
                </div>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0;
                    margin-left: auto;
                ">×</button>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        const notif = document.getElementById('easepath-notification');
        if (notif) notif.remove();
    }, 10000);
}

/**
 * Clean text by removing extra whitespace
 */
function cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Auto-submit form
 */
function autoSubmitForm() {
    console.log("EasePath: Attempting to auto-submit...");
    
    // Find submit buttons
    const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        '[data-testid*="submit"]',
        '[data-testid*="apply"]',
    ];
    
    for (const selector of submitSelectors) {
        const button = document.querySelector(selector);
        if (button && isElementVisible(button) && !button.disabled) {
            captureAndLearnAnswers();
            button.click();
            return true;
        }
    }
    
    // Find buttons by text
    const submitTexts = ['submit', 'apply', 'send application', 'apply now', 'submit application'];
    const allButtons = document.querySelectorAll('button, input[type="button"], [role="button"]');
    
    for (const button of allButtons) {
        const text = (button.innerText || button.value || '').toLowerCase().trim();
        if (submitTexts.some(t => text.includes(t)) && isElementVisible(button) && !button.disabled) {
            captureAndLearnAnswers();
            button.click();
            return true;
        }
    }
    
    return false;
}

/**
 * Capture answers for learning
 */
function captureAndLearnAnswers() {
    const textareas = document.querySelectorAll('textarea');
    const answersToLearn = [];
    
    textareas.forEach(textarea => {
        const value = textarea.value.trim();
        if (value.length > 50) {
            const label = findLabelForInput(textarea);
            if (label && label.length > 10) {
                answersToLearn.push({
                    question: label,
                    answer: value,
                    fieldId: textarea.id || textarea.name
                });
            }
        }
    });
    
    if (answersToLearn.length > 0) {
        console.log("EasePath: Learning from answers:", answersToLearn);
        chrome.runtime.sendMessage({
            action: "learn_answers",
            answers: answersToLearn,
            url: window.location.href
        });
    }
}

// Capture on form submit
document.addEventListener('submit', () => {
    captureAndLearnAnswers();
}, true);

// Capture on likely submit clicks
document.addEventListener('click', (e) => {
    const button = e.target.closest('button, input[type="submit"], [role="button"]');
    if (button) {
        const text = (button.innerText || button.value || '').toLowerCase();
        if (text.includes('submit') || text.includes('apply') || text.includes('send')) {
            setTimeout(captureAndLearnAnswers, 500);
        }
    }
}, true);

console.log("EasePath: Content script loaded and ready");

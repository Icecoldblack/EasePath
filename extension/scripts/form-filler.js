// EasePath - Form Filler
// Core form filling logic for text inputs, dropdowns, radios, checkboxes

/**
 * Retrieve the stored user profile from chrome.storage.local.
 * @returns {Promise<Object|null>} The stored user profile object, or null if none is stored.
 */
function getStoredUserProfile() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['userProfile'], (result) => {
            resolve(result.userProfile || null);
        });
    });
}

/**
 * Set a text input or textarea's value, trigger native input/change events, focus and highlight the element.
 * @param {HTMLInputElement|HTMLTextAreaElement} element - The input or textarea element to fill.
 * @param {string} value - The value to enter into the element.
 * @returns {boolean} `true` if the element was filled successfully, `false` otherwise.
 */
function fillTextInput(element, value) {
    if (!element || !value) return false;

    try {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.value = '';
        element.focus();
        if (typeof element.click === 'function') element.click();

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

        if (element.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
            nativeTextAreaValueSetter.call(element, value);
        } else if (element.tagName === 'INPUT' && nativeInputValueSetter) {
            nativeInputValueSetter.call(element, value);
        } else {
            element.value = value;
        }

        nativeDispatchEvents(element);
        highlightElement(element);
        console.log("EasePath: ✓ Filled:", element.name || element.id, "=", value.substring(0, 30));
        return true;
    } catch (e) {
        console.error("EasePath: Error in fillTextInput:", e);
        return false;
    }
}

/**
 * Infer an appropriate text value for an input element from a user profile and the input's context.
 *
 * Uses the element's visible label, name, id, placeholder, ARIA label, autocomplete attribute, and class names
 * to match common field patterns (names, contact, links, address, education, work, compensation, start date,
 * location preferences, referral/source). Returns the corresponding profile value when a match is found.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} input - The form control whose value should be inferred.
 * @param {Object} profile - User profile object containing potential field values.
 *   Expected properties (any may be undefined): firstName, lastName, email, phone, linkedInUrl, githubUrl,
 *   portfolioUrl, address, city, state, zipCode, country, university, highestDegree, major, graduationYear,
 *   gpa, yearsOfExperience, currentCompany, currentTitle, desiredJobTitle, desiredSalary, availableStartDate,
 *   preferredLocations.
 * @returns {string|null} A string suitable for filling the field, or `null` if no suitable mapping was determined.
 */
function determineFieldValue(input, profile) {
    const label = findLabelForInput(input);
    const combined = [
        label,
        input.name || '',
        input.id || '',
        input.placeholder || '',
        input.getAttribute('aria-label') || '',
        input.getAttribute('autocomplete') || '',
        input.className || ''
    ].join(' ').toLowerCase();

    // Name fields
    if (matchesAny(combined, ['first name', 'firstname', 'fname', 'given name', 'given-name']) && !combined.includes('last')) {
        return profile.firstName;
    }
    if (matchesAny(combined, ['last name', 'lastname', 'lname', 'surname', 'family name', 'family-name']) && !combined.includes('first')) {
        return profile.lastName;
    }
    if (matchesAny(combined, ['full name', 'your name', 'name']) && !combined.includes('first') && !combined.includes('last') && !combined.includes('company') && !combined.includes('school')) {
        return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    }

    // Contact
    if (matchesAny(combined, ['email', 'e-mail', 'mail address'])) {
        return profile.email;
    }
    if (matchesAny(combined, ['phone', 'mobile', 'cell', 'telephone', 'tel', 'contact number'])) {
        return profile.phone;
    }

    // Links
    if (combined.includes('linkedin')) return profile.linkedInUrl;
    if (combined.includes('github')) return profile.githubUrl;
    if (matchesAny(combined, ['portfolio', 'website', 'personal site', 'personal url'])) {
        return profile.portfolioUrl;
    }

    // Address
    if (matchesAny(combined, ['street', 'address line 1', 'address1', 'address']) && !combined.includes('email') && !combined.includes('2')) {
        return profile.address;
    }
    if (matchesAny(combined, ['city', 'town', 'locality'])) return profile.city;
    if (matchesAny(combined, ['state', 'province', 'region']) && !combined.includes('united')) return profile.state;
    if (matchesAny(combined, ['zip', 'postal', 'postcode'])) return profile.zipCode;
    if (matchesAny(combined, ['country', 'nation'])) return profile.country || 'United States';

    // Education
    if (matchesAny(combined, ['school', 'university', 'college', 'institution'])) return profile.university;
    if (matchesAny(combined, ['degree', 'education level', 'highest degree'])) return profile.highestDegree;
    if (matchesAny(combined, ['major', 'field of study', 'concentration'])) return profile.major;
    if (matchesAny(combined, ['graduation', 'grad year', 'year graduated'])) return profile.graduationYear;
    if (matchesAny(combined, ['gpa', 'grade point'])) return profile.gpa;

    // Work experience
    if (matchesAny(combined, ['years of experience', 'years experience', 'total experience'])) return profile.yearsOfExperience;
    if (matchesAny(combined, ['current company', 'current employer', 'employer'])) return profile.currentCompany;
    if (matchesAny(combined, ['current title', 'job title', 'current position', 'current role'])) {
        return profile.currentTitle || profile.desiredJobTitle;
    }

    // Compensation
    if (matchesAny(combined, ['salary', 'compensation', 'pay', 'expected salary'])) return profile.desiredSalary;

    // Start date
    if (matchesAny(combined, ['start date', 'available', 'earliest start', 'when can you start'])) {
        if (input.type === 'date') {
            const today = new Date();
            today.setDate(today.getDate() + 14);
            return today.toISOString().split('T')[0];
        }
        return profile.availableStartDate || 'Immediately';
    }

    // Location preferences
    if (matchesAny(combined, ['preferred location', 'desired location', 'location preference'])) {
        return profile.preferredLocations || profile.city;
    }

    // How did you hear
    if (matchesAny(combined, ['how did you hear', 'how did you find', 'source', 'referral'])) {
        return 'LinkedIn';
    }

    return null;
}

/**
 * Fill all visible, editable text-like form fields on the page using values inferred from the provided profile.
 *
 * Skips invisible, disabled, read-only, already-filled, hidden inputs and textarea fields classified as essay questions.
 *
 * @param {Object} profile - User profile object whose data is used to infer field values.
 * @returns {number} The number of fields that were filled.
 */
async function fillAllTextFields(profile) {
    let filled = 0;

    const inputs = document.querySelectorAll(`
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="phone"],
        input[type="url"],
        input[type="number"],
        input[type="date"],
        input:not([type]),
        textarea
    `);

    for (const input of inputs) {
        if (!isElementVisible(input)) continue;
        if (input.disabled || input.readOnly) continue;
        if (input.value && input.value.trim() !== '') continue;
        if (input.type === 'hidden') continue;
        if (input.tagName === 'TEXTAREA' && isEssayTextarea(input)) continue;

        const value = determineFieldValue(input, profile);
        if (value) {
            await fillTextInput(input, value);
            filled++;
            await sleep(50);
        }
    }

    return filled;
}

/**
 * Iterates visible, enabled select elements on the page and attempts to fill each eligible dropdown using the provided profile.
 *
 * @param {Object} profile - User profile data used to determine appropriate option values (e.g., name, email, address, work/education details).
 * @returns {number} The number of select elements that were successfully filled.
 */
async function fillAllDropdowns(profile) {
    let filled = 0;

    const selects = document.querySelectorAll('select');

    for (const select of selects) {
        if (!isElementVisible(select)) continue;
        if (select.disabled) continue;
        if (select.selectedIndex > 0) continue;
        if (select.dataset.easepathFilled) continue;

        const wasFilled = await fillSelectDropdown(select, profile);
        if (wasFilled) {
            select.dataset.easepathFilled = 'true';
            filled++;
            await sleep(50);
        }
    }

    return filled;
}

/**
 * Clicks applicable radio buttons, checkboxes, and styled Yes/No controls based on the provided profile.
 * 
 * Iterates radio groups, visible unchecked checkboxes, and custom Yes/No button pairs, using profile-driven
 * decision logic to determine which controls to activate. Marks checkboxes it fills to avoid re-filling.
 * 
 * @param {Object} profile - The user profile used to infer answers for questions.
 * @returns {number} The total number of controls that were clicked.
async function clickAllOptions(profile) {
    let clicked = 0;

    // First handle real radio inputs
    const radioNames = new Set();
    document.querySelectorAll('input[type="radio"]').forEach(r => {
        if (r.name) radioNames.add(r.name);
    });

    for (const name of radioNames) {
        const wasClicked = await handleRadioGroup(name, profile);
        if (wasClicked) clicked++;
    }

    // Handle real checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for (const cb of checkboxes) {
        if (!isElementVisible(cb)) continue;
        if (cb.checked) continue;
        if (cb.dataset.easepathFilled) continue;

        const wasClicked = await handleCheckbox(cb, profile);
        if (wasClicked) {
            cb.dataset.easepathFilled = 'true';
            clicked++;
        }
    }

    // Handle styled Yes/No button pairs (like the screenshot shows)
    const yesNoClicked = await clickYesNoButtonPairs(profile);
    clicked += yesNoClicked;

    return clicked;
}

/**
 * Locate Yes/No style button pairs on the page and click the option that matches the user's profile.
 *
 * Scans button-like elements that present binary (Yes/No) choices, infers the desired answer from the provided profile, and clicks the matching button when it is visible and not already selected. Marks processed controls to avoid reprocessing.
 *
 * @param {Object} profile - User profile data used to determine Yes/No answers.
 * @returns {number} The count of buttons that were clicked.
 */
async function clickYesNoButtonPairs(profile) {
    let clicked = 0;

    // Search for any button pairs that look like Yes/No
    const allButtons = document.querySelectorAll('button, [role="button"], div[class*="button"], span[class*="button"]');
    const yesButtons = [];
    const noButtons = [];

    for (const btn of allButtons) {
        const text = getElementText(btn).toLowerCase().trim();
        if (text === 'yes' || text === 'yes, i am' || text === 'yes, i do') {
            yesButtons.push(btn);
        }
        if (text === 'no' || text === 'no, i am not' || text === 'no, i do not') {
            noButtons.push(btn);
        }
    }

    console.log("EasePath: Found", yesButtons.length, "Yes buttons and", noButtons.length, "No buttons");

    // For each Yes button, find its context and determine which to click
    for (const yesBtn of yesButtons) {
        if (yesBtn.dataset.easepathFilled) continue;

        // Check if this button's group is already answered
        const parentContainer = yesBtn.closest('fieldset, [class*="question"], [class*="field"], div');
        if (parentContainer && parentContainer.dataset.easepathFilled) continue;

        // Get question context
        const question = findQuestionContext(yesBtn);
        console.log("EasePath: Yes/No button question:", question.substring(0, 60));

        const answer = determineYesNoAnswer(question, profile);

        if (answer !== null) {
            // Find the corresponding No button in the same container
            let noBtn = null;
            if (parentContainer) {
                noBtn = Array.from(parentContainer.querySelectorAll('button, [role="button"]'))
                    .find(b => {
                        const t = getElementText(b).toLowerCase().trim();
                        return t === 'no' || t.includes('no,');
                    });
            }

            const btnToClick = answer === true ? yesBtn : noBtn;

            if (btnToClick && isElementVisible(btnToClick)) {
                // Check if already selected
                const isSelected = btnToClick.classList.contains('selected') ||
                    btnToClick.classList.contains('active') ||
                    btnToClick.getAttribute('aria-pressed') === 'true' ||
                    btnToClick.getAttribute('aria-checked') === 'true';

                if (!isSelected) {
                    console.log("EasePath: ✓ Clicking", answer ? "Yes" : "No", "button");
                    await performRobustClick(btnToClick);
                    highlightElement(btnToClick);
                    if (parentContainer) parentContainer.dataset.easepathFilled = 'true';
                    yesBtn.dataset.easepathFilled = 'true';
                    clicked++;
                }
            }
        }
    }

    return clicked;
}

/**
 * Selects an appropriate option for a dropdown based on the field's context and the provided user profile.
 *
 * Uses the select's associated label, name, and id to infer the field type (country, state, work authorization,
 * education, experience, EEO questions, salary, availability, citizenship, etc.) and attempts to match an option
 * using the profile value or a set of fallback patterns.
 *
 * @param {HTMLSelectElement} select - The dropdown element to fill.
 * @param {Object} profile - User profile data used to determine the best matching option.
 * @returns {boolean} `true` if the dropdown was filled (an option was selected and events dispatched), `false` otherwise.
 */
async function fillSelectDropdown(select, profile) {
    const label = findLabelForInput(select);
    const combined = [label, select.name || '', select.id || ''].join(' ').toLowerCase();

    console.log("EasePath: Processing dropdown:", combined.substring(0, 50));

    let valueToSelect = null;
    let matchPatterns = []; // Alternative patterns to try

    // Country
    if (matchesAny(combined, ['country', 'nation', 'location country'])) {
        valueToSelect = profile.country || 'United States';
        matchPatterns = ['united states', 'usa', 'us', 'u.s.'];
    }
    // State / Province
    else if (matchesAny(combined, ['state', 'province', 'region']) && !combined.includes('united')) {
        valueToSelect = profile.state;
    }
    // Work Authorization
    else if (matchesAny(combined, ['work authorization', 'eligible to work', 'authorized to work', 'legally authorized'])) {
        valueToSelect = profile.workAuthorization || 'Yes';
        matchPatterns = ['yes', 'authorized', 'eligible'];
    }
    // Sponsorship
    else if (matchesAny(combined, ['sponsorship', 'sponsor', 'visa'])) {
        valueToSelect = profile.requiresSponsorship ? 'Yes' : 'No';
    }
    // Education / Degree
    else if (matchesAny(combined, ['degree', 'education level', 'highest education', 'education'])) {
        valueToSelect = profile.highestDegree;
        matchPatterns = ["bachelor", "master", "associate", "phd", "doctorate"];
    }
    // Years of Experience
    else if (matchesAny(combined, ['years of experience', 'experience level', 'years experience', 'total experience'])) {
        valueToSelect = profile.yearsOfExperience;
        // Try to match numeric ranges
        matchPatterns = ['0-1', '1-2', '2-3', '3-5', '5+', '5-10', '10+'];
    }
    // Gender (EEO)
    else if (matchesAny(combined, ['gender', 'sex'])) {
        valueToSelect = profile.gender;
        matchPatterns = ['male', 'female', 'non-binary', 'prefer not', 'decline'];
    }
    // Race / Ethnicity (EEO)
    else if (matchesAny(combined, ['race', 'ethnicity', 'ethnic background', 'racial'])) {
        valueToSelect = profile.ethnicity;
        matchPatterns = ['white', 'asian', 'black', 'hispanic', 'latino', 'two or more', 'prefer not', 'decline'];
    }
    // Veteran Status (EEO)
    else if (matchesAny(combined, ['veteran', 'military', 'served'])) {
        valueToSelect = profile.veteranStatus;
        matchPatterns = ['not a veteran', 'no', 'prefer not', 'decline'];
    }
    // Disability (EEO)
    else if (matchesAny(combined, ['disability', 'disabled'])) {
        valueToSelect = profile.disabilityStatus;
        matchPatterns = ['no', 'do not have', 'prefer not', 'decline'];
    }
    // How did you hear about us
    else if (matchesAny(combined, ['how did you hear', 'source', 'referred', 'find this job', 'where did you'])) {
        valueToSelect = 'LinkedIn';
        matchPatterns = ['linkedin', 'job board', 'online', 'website', 'other'];
    }
    // Salary / Compensation
    else if (matchesAny(combined, ['salary', 'compensation', 'pay range', 'expected salary'])) {
        valueToSelect = profile.desiredSalary;
    }
    // Notice Period / Availability
    else if (matchesAny(combined, ['notice period', 'availability', 'when can you start', 'start date'])) {
        valueToSelect = 'Immediately';
        matchPatterns = ['immediately', '2 weeks', 'two weeks', '1 month', 'flexible'];
    }
    // Citizenship
    else if (matchesAny(combined, ['citizen', 'citizenship'])) {
        const isCitizen = profile.usCitizen || profile.isUsCitizen;
        valueToSelect = isCitizen ? 'Yes' : 'No';
    }

    if (valueToSelect || matchPatterns.length > 0) {
        const options = Array.from(select.options);

        // First try exact match with profile value
        if (valueToSelect) {
            for (const opt of options) {
                const optText = opt.text.toLowerCase();
                const optValue = opt.value.toLowerCase();
                if (optText.includes(valueToSelect.toLowerCase()) ||
                    optValue.includes(valueToSelect.toLowerCase())) {
                    select.value = opt.value;
                    nativeDispatchEvents(select);
                    highlightElement(select);
                    console.log("EasePath: ✓ Dropdown filled:", combined.substring(0, 30), "=", opt.text);
                    return true;
                }
            }
        }

        // Then try alternative patterns
        for (const pattern of matchPatterns) {
            for (const opt of options) {
                const optText = opt.text.toLowerCase();
                const optValue = opt.value.toLowerCase();
                if (optText.includes(pattern) || optValue.includes(pattern)) {
                    select.value = opt.value;
                    nativeDispatchEvents(select);
                    highlightElement(select);
                    console.log("EasePath: ✓ Dropdown filled (pattern):", combined.substring(0, 30), "=", opt.text);
                    return true;
                }
            }
        }

        console.log("EasePath: Could not find matching option for:", combined.substring(0, 30));
    }

    return false;
}

/**
 * Selects and clicks the radio option in a named group that matches a derived Yes/No answer from the group's question text.
 *
 * Infers a Yes/No answer from the group's contextual question using the provided profile, then scans each option's label/value for affirmative or negative cues and clicks the first matching option.
 * @param {string} name - The `name` attribute of the radio group to process.
 * @param {object} profile - User profile used to infer the appropriate Yes/No answer.
 * @returns {Promise<boolean>} `true` if a radio option was clicked, `false` otherwise.
 */
async function handleRadioGroup(name, profile) {
    const radios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    if (radios.length === 0) return false;

    const question = findQuestionContext(radios[0]);
    console.log("EasePath: Processing radio group:", name, "Question:", question.substring(0, 60));

    const answer = determineYesNoAnswer(question, profile);

    if (answer !== null) {
        for (const radio of radios) {
            // Get label text from multiple sources
            const parentText = getElementText(radio.parentElement) || '';
            const labelFor = document.querySelector(`label[for="${radio.id}"]`);
            const labelText = labelFor ? getElementText(labelFor) : '';
            const combinedLabel = (parentText + ' ' + labelText + ' ' + radio.value).toLowerCase();

            const isYes = matchesAny(combinedLabel, ['yes', 'true', 'i am', 'i do', 'i have', 'authorized', 'eligible']);
            const isNo = matchesAny(combinedLabel, ['no', 'false', 'i am not', 'i do not', 'not authorized', 'not eligible']);

            console.log("EasePath: Radio option:", combinedLabel.substring(0, 40), "isYes:", isYes, "isNo:", isNo, "answer:", answer);

            if ((answer === true && isYes) || (answer === false && isNo)) {
                console.log("EasePath: ✓ Clicking radio:", combinedLabel.substring(0, 30));
                await performRobustClick(radio);
                highlightElement(radio);
                return true;
            }
        }
    }

    return false;
}

/**
 * Decides whether to check a checkbox based on the related question and user profile.
 *
 * Evaluates the checkbox's surrounding question context against the provided profile and clicks the checkbox when the inferred answer is affirmative.
 * @param {HTMLInputElement} checkbox - The checkbox input element to evaluate and potentially click.
 * @param {Object} profile - The user profile used to infer answers.
 * @returns {boolean} `true` if the checkbox was clicked (checked), `false` otherwise.
 */
async function handleCheckbox(checkbox, profile) {
    const question = findQuestionContext(checkbox);
    const shouldCheck = determineYesNoAnswer(question, profile);

    if (shouldCheck === true) {
        await performRobustClick(checkbox);
        return true;
    }

    return false;
}

/**
 * Infer a Yes/No answer for a question based on its visible text and the provided user profile.
 * @param {string} questionText - The question or label text to evaluate (may be taken from surrounding UI).
 * @param {Object} profile - User profile containing fields used to decide answers (e.g., workAuthorization, requiresSponsorship, usCitizen/isUsCitizen, willingToRelocate, veteranStatus, disabilityStatus).
 * @returns {boolean|null} `true` if the question should be answered Yes, `false` if it should be answered No, or `null` when the function cannot determine an appropriate answer.
 */
function determineYesNoAnswer(questionText, profile) {
    const q = (questionText || '').toLowerCase();

    console.log("EasePath: Evaluating question:", q.substring(0, 80));

    // Work authorization questions - usually want "Yes" if authorized
    if (matchesAny(q, ['authorized to work', 'legally authorized', 'work authorization', 'eligible to work', 'legally eligible', 'right to work', 'permission to work'])) {
        const isAuthorized = profile.workAuthorization && profile.workAuthorization !== 'No';
        console.log("EasePath: Work auth question, answering:", isAuthorized);
        return isAuthorized !== false;
    }

    // Sponsorship questions - check profile setting
    if (matchesAny(q, ['require sponsorship', 'need sponsorship', 'visa sponsorship', 'require visa', 'sponsorship to work', 'immigration sponsorship', 'sponsor now or in the future', 'sponsorship now or'])) {
        const needsSponsorship = profile.requiresSponsorship === true;
        console.log("EasePath: Sponsorship question, answering:", needsSponsorship);
        return needsSponsorship;
    }

    // US Citizen questions
    if (matchesAny(q, ['us citizen', 'u.s. citizen', 'united states citizen', 'american citizen'])) {
        const isCitizen = profile.usCitizen === true || profile.isUsCitizen === true;
        console.log("EasePath: Citizen question, answering:", isCitizen);
        return isCitizen;
    }

    // Age requirements - always true (job applicants should be 18+)
    if (matchesAny(q, ['18 years', 'over 18', 'at least 18', '18 or older', 'legal age'])) {
        console.log("EasePath: Age question, answering: true");
        return true;
    }

    // Terms and conditions - always agree
    if (matchesAny(q, ['agree', 'accept', 'consent', 'acknowledge', 'terms', 'conditions', 'privacy policy', 'i confirm', 'i certify', 'i understand'])) {
        console.log("EasePath: Terms question, answering: true");
        return true;
    }

    // Willing to relocate
    if (matchesAny(q, ['willing to relocate', 'open to relocation', 'relocate for this position', 'willing to move'])) {
        const willingToRelocate = profile.willingToRelocate === true;
        console.log("EasePath: Relocation question, answering:", willingToRelocate);
        return willingToRelocate;
    }

    // Commute / in-person work
    if (matchesAny(q, ['commute', 'work on-site', 'work onsite', 'in-office', 'in office', 'work in person'])) {
        console.log("EasePath: Commute question, answering: true");
        return true;
    }

    // Background check consent
    if (matchesAny(q, ['background check', 'background investigation', 'criminal history', 'drug test', 'drug screen'])) {
        console.log("EasePath: Background check question, answering: true");
        return true;
    }

    // Previous employee question - usually no
    if (matchesAny(q, ['previously employed', 'former employee', 'worked here before', 'previously worked'])) {
        console.log("EasePath: Previous employee question, answering: false");
        return false;
    }

    // Veteran status
    if (matchesAny(q, ['veteran', 'military', 'served in', 'armed forces'])) {
        const isVeteran = profile.veteranStatus && profile.veteranStatus.toLowerCase().includes('yes');
        console.log("EasePath: Veteran question, answering:", isVeteran);
        return isVeteran || false;
    }

    // Disability
    if (matchesAny(q, ['disability', 'disabled', 'disabilities'])) {
        const hasDisability = profile.disabilityStatus && profile.disabilityStatus.toLowerCase().includes('yes');
        console.log("EasePath: Disability question, answering:", hasDisability);
        return hasDisability || false;
    }

    // Referral - usually no unless profile has referral info
    if (matchesAny(q, ['referred by', 'referral', 'know anyone', 'employee referral'])) {
        console.log("EasePath: Referral question, answering: false");
        return false;
    }

    // NDA / confidentiality - always agree
    if (matchesAny(q, ['confidentiality', 'nda', 'non-disclosure', 'proprietary information'])) {
        console.log("EasePath: NDA question, answering: true");
        return true;
    }

    console.log("EasePath: Unknown question pattern, skipping");
    return null;
}

/**
 * Determine whether a textarea should be treated as an essay-style question.
 *
 * Uses the textarea's attributes and nearby label text to classify it as an essay
 * (long-form) response field. Heuristics include large `minlength`/`maxlength`,
 * multiple `rows`, and label phrases like "cover letter", "why do you want",
 * "tell us about", or "describe".
 *
 * @param {HTMLTextAreaElement} textarea - The textarea element to evaluate.
 * @returns {boolean} `true` if the textarea appears to be an essay question, `false` otherwise.
 */
function isEssayTextarea(textarea) {
    const minLength = parseInt(textarea.getAttribute('minlength') || '0');
    const maxLength = parseInt(textarea.getAttribute('maxlength') || '0');
    const rows = parseInt(textarea.getAttribute('rows') || '1');
    const label = findLabelForInput(textarea).toLowerCase();

    if (minLength > 100 || maxLength > 500 || rows > 3) return true;
    if (matchesAny(label, ['cover letter', 'why do you want', 'tell us about', 'describe'])) return true;

    return false;
}

console.log("EasePath: form-filler.js loaded");
// EasePath - ATS Adapters
// Specialized logic for common Applicant Tracking Systems

/**
 * Apply platform-specific automation logic for supported ATS platforms.
 *
 * Dispatches to the appropriate platform handler based on the platform identifier.
 *
 * @param {string} platform - Identifier of the ATS platform (e.g., 'greenhouse', 'lever', 'workday').
 * @param {Object} profile - Profile data used to populate form fields on the target platform.
 * @returns {boolean} `true` if platform-specific logic was applied, `false` if the platform is not recognized.
 */
async function applySpecializedATS(platform, profile) {
    console.log(`EasePath: Applying specialized logic for ${platform}`);

    switch (platform) {
        case 'greenhouse':
            return await applyGreenhouseLogic(profile);
        case 'lever':
            return await applyLeverLogic(profile);
        case 'workday':
            return await applyWorkdayLogic(profile);
        default:
            return false;
    }
}

/**
 * Apply Greenhouse-specific form-filling logic to the current page.
 *
 * Scans the document for education entries and additional/custom question fields, logs discovery of education entries, and fills empty inputs/selects/textareas with values derived from the provided profile. This function modifies the DOM and may write values into form controls.
 *
 * @param {Object} profile - Profile data used to derive values for form fields (e.g., name, contact, education).
 * @returns {boolean} `true` when processing is finished.
 */
async function applyGreenhouseLogic(profile) {
    // Greenhouse often has required custom questions with specific selectors
    const educationEntries = document.querySelectorAll('.education-entry, [data-qa="education"]');
    if (educationEntries.length > 0) {
        console.log("EasePath: Found Greenhouse education entries");
    }

    // Handle Greenhouse's "Additional Information" section
    const additionalFields = document.querySelectorAll('[data-qa*="additional"], .custom-question');
    for (const field of additionalFields) {
        const input = field.querySelector('input, select, textarea');
        if (input && !input.value) {
            const label = findLabelForInput(input);
            const value = determineFieldValue(input, profile);
            if (value) {
                fillTextInput(input, value);
            }
        }
    }

    return true;
}

/**
 * Apply form-filling and discovery logic specific to Lever-hosted application forms.
 *
 * @param {Object} profile - Applicant profile data used to derive or populate answers for Lever form fields.
 * @returns {boolean} `true` if the page was processed (form inputs and opportunity questions were inspected), `false` otherwise.
 */
async function applyLeverLogic(profile) {
    // Lever uses specific class names for their form elements
    const leverInputs = document.querySelectorAll('.lever-application-form input, .lever-application-form select');
    console.log(`EasePath: Found ${leverInputs.length} Lever form inputs`);

    // Lever often has "Opportunity Questions" that need special handling
    const opportunityQuestions = document.querySelectorAll('.opportunity-question');
    for (const question of opportunityQuestions) {
        const textarea = question.querySelector('textarea');
        if (textarea && !textarea.value) {
            // These often require custom responses
            console.log("EasePath: Found Lever opportunity question");
        }
    }

    return true;
}

/**
 * Apply Workday-specific form-filling behaviors using values from the provided profile.
 * @param {Object} profile - Profile data with keys used to populate Workday fields.
 * @param {string} [profile.firstName] - First name to populate into matching Workday inputs.
 * @param {string} [profile.lastName] - Last name to populate into matching Workday inputs.
 * @param {string} [profile.email] - Email address to populate into matching Workday inputs.
 * @param {string} [profile.phone] - Phone number to populate into matching Workday inputs.
 * @returns {boolean} `true` if processing completed.
async function applyWorkdayLogic(profile) {
    // Workday is notoriously difficult with nested structures
    console.log("EasePath: Applying Workday-specific logic");

    // Workday uses data-automation-id for many elements
    const workdayInputs = document.querySelectorAll('[data-automation-id]');
    for (const input of workdayInputs) {
        const automationId = input.getAttribute('data-automation-id');
        if (automationId && automationId.includes('input')) {
            // Map automation IDs to profile fields
            if (automationId.includes('firstName')) {
                fillTextInput(input, profile.firstName);
            } else if (automationId.includes('lastName')) {
                fillTextInput(input, profile.lastName);
            } else if (automationId.includes('email')) {
                fillTextInput(input, profile.email);
            } else if (automationId.includes('phone')) {
                fillTextInput(input, profile.phone);
            }
        }
    }

    // Handle Workday's multi-step navigation
    const nextButtons = document.querySelectorAll('[data-automation-id="bottom-navigation-next-button"]');
    if (nextButtons.length > 0) {
        console.log("EasePath: Found Workday next button");
    }

    return true;
}

console.log("EasePath: ats-adapters.js loaded");
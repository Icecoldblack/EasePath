const API_BASE_URL = 'http://localhost:8080/api/extension';
const FRONTEND_URL = 'http://localhost:5173';

document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const notConnected = document.getElementById('not-connected');
    const connected = document.getElementById('connected');
    const profileNotConnected = document.getElementById('profile-not-connected');
    const profileConnected = document.getElementById('profile-connected');
    const syncBtn = document.getElementById('sync-btn');
    const autofillBtn = document.getElementById('autofill-btn');
    const feedbackBtn = document.getElementById('feedback-btn');
    const reportBtn = document.getElementById('report-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const closeBannerBtn = document.getElementById('close-banner');
    const featureBanner = document.getElementById('feature-banner');
    const messageArea = document.getElementById('message-area');
    const statsText = document.getElementById('stats-text');
    const resumeName = document.getElementById('resume-name');
    const viewResumeBtn = document.getElementById('view-resume-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    // Profile elements
    const avatar = document.getElementById('avatar');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const fieldsCount = document.getElementById('fields-count');
    const applicationsCount = document.getElementById('applications-count');

    let userProfile = null;
    let currentUrl = '';

    // Initialize
    await init();

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Sync button
    syncBtn.addEventListener('click', async () => {
        syncBtn.disabled = true;
        syncBtn.classList.add('loading');
        syncBtn.textContent = 'Syncing...';
        
        await tryAutoConnect();
        
        syncBtn.disabled = false;
        syncBtn.classList.remove('loading');
        syncBtn.textContent = '🔄 Sync with EasePath';
    });

    // Autofill button
    autofillBtn.addEventListener('click', async () => {
        await performAutofill();
    });

    // Feedback button
    feedbackBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: "capture_answers" }, () => {
            chrome.runtime.sendMessage({ action: "record_success", url: tab.url });
            showMessage('Thanks! Your feedback helps improve autofill accuracy.', 'success');
        });
    });

    // Report button
    reportBtn.addEventListener('click', () => {
        window.open(`${FRONTEND_URL}/feedback`, '_blank');
    });

    // Disconnect button
    disconnectBtn.addEventListener('click', () => {
        chrome.storage.local.remove(['userEmail', 'userProfile'], () => {
            chrome.runtime.sendMessage({ action: "set_user_email", email: null });
            userProfile = null;
            showNotConnectedState();
        });
    });

    // Close banner
    closeBannerBtn.addEventListener('click', () => {
        featureBanner.style.display = 'none';
        chrome.storage.local.set({ bannerDismissed: true });
    });

    // Settings button
    settingsBtn.addEventListener('click', () => {
        window.open(`${FRONTEND_URL}/settings`, '_blank');
    });

    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        currentUrl = tabs[0]?.url || '';
    });

    // Functions
    async function init() {
        // Check if banner was dismissed
        const { bannerDismissed } = await chrome.storage.local.get(['bannerDismissed']);
        if (bannerDismissed) {
            featureBanner.style.display = 'none';
        }

        // Try to auto-connect using stored data or fetch from frontend
        const { userEmail, userProfile: storedProfile } = await chrome.storage.local.get(['userEmail', 'userProfile']);
        
        if (userEmail && storedProfile) {
            userProfile = storedProfile;
            showConnectedState();
        } else {
            // Try to auto-connect
            await tryAutoConnect();
        }
    }

    async function tryAutoConnect() {
        try {
            // Method 1: Check if user is logged in on the EasePath frontend
            // We'll try to fetch user data from the backend directly
            
            // First, try to get email from localStorage via content script
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Try fetching from the EasePath frontend to check if logged in
            const response = await fetch(`${FRONTEND_URL}`, { 
                credentials: 'include',
                mode: 'no-cors'
            }).catch(() => null);
            
            // If we have a stored email, try to fetch the profile
            const { userEmail } = await chrome.storage.local.get(['userEmail']);
            if (userEmail) {
                await fetchAndStoreProfile(userEmail);
                return;
            }

            // Otherwise show not connected
            showNotConnectedState();
            
        } catch (error) {
            console.error('Auto-connect failed:', error);
            showNotConnectedState();
        }
    }

    async function fetchAndStoreProfile(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/profile?email=${encodeURIComponent(email)}`);
            
            if (response.ok) {
                userProfile = await response.json();
                
                // Store for future use
                chrome.storage.local.set({ 
                    userEmail: email, 
                    userProfile: userProfile 
                });
                
                // Notify background script
                chrome.runtime.sendMessage({ action: "set_user_email", email: email });
                
                showConnectedState();
            } else {
                // Profile not found - show option to enter email manually
                showNotConnectedState();
                showMessage('Profile not found. Please complete onboarding on EasePath first.', 'warning');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            showNotConnectedState();
            showMessage('Could not connect to server. Is the backend running?', 'error');
        }
    }

    function showConnectedState() {
        notConnected.classList.add('hidden');
        connected.classList.remove('hidden');
        profileNotConnected.classList.add('hidden');
        profileConnected.classList.remove('hidden');
        
        updateProfileUI();
        updateResumeUI();
    }

    function showNotConnectedState() {
        notConnected.classList.remove('hidden');
        connected.classList.add('hidden');
        profileNotConnected.classList.remove('hidden');
        profileConnected.classList.add('hidden');
        
        // Add manual email input option
        addManualConnectOption();
    }

    function addManualConnectOption() {
        // Check if already added
        if (document.getElementById('manual-connect')) return;
        
        const manualDiv = document.createElement('div');
        manualDiv.id = 'manual-connect';
        manualDiv.style.marginTop = '12px';
        manualDiv.innerHTML = `
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Or enter your email:</p>
            <div style="display: flex; gap: 8px;">
                <input type="email" id="manual-email" placeholder="your@email.com" 
                    style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;">
                <button id="manual-connect-btn" class="primary-btn" style="padding: 8px 16px;">
                    Connect
                </button>
            </div>
        `;
        
        notConnected.appendChild(manualDiv);
        
        document.getElementById('manual-connect-btn').addEventListener('click', async () => {
            const email = document.getElementById('manual-email').value.trim();
            if (email && email.includes('@')) {
                await fetchAndStoreProfile(email);
            }
        });
    }

    function updateProfileUI() {
        if (!userProfile) return;
        
        // Avatar
        const initials = `${(userProfile.firstName || '?')[0]}${(userProfile.lastName || '')[0]}`.toUpperCase();
        avatar.textContent = initials;
        
        // Name and email
        profileName.textContent = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User';
        profileEmail.textContent = userProfile.email || '';
        
        // Count filled fields
        let filledFields = 0;
        const fieldKeys = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 
            'zipCode', 'country', 'linkedInUrl', 'githubUrl', 'university', 'major', 'highestDegree'];
        fieldKeys.forEach(key => {
            if (userProfile[key]) filledFields++;
        });
        fieldsCount.textContent = filledFields;
        
        // Applications count (would need backend endpoint)
        applicationsCount.textContent = '0';
    }

    function updateResumeUI() {
        if (userProfile && userProfile.resumeFileName) {
            resumeName.textContent = userProfile.resumeFileName;
            resumeName.classList.add('has-resume');
            viewResumeBtn.classList.remove('hidden');
        } else {
            resumeName.textContent = 'No resume uploaded';
            resumeName.classList.remove('has-resume');
            viewResumeBtn.classList.add('hidden');
        }
    }

    async function performAutofill() {
        hideMessage();
        autofillBtn.disabled = true;
        autofillBtn.classList.add('loading');
        const originalText = autofillBtn.textContent;
        autofillBtn.textContent = 'Scanning...';
        statsText.textContent = 'Scanning page...';
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            currentUrl = tab.url;
            
            // Check if we can inject scripts on this page
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
                autofillBtn.disabled = false;
                autofillBtn.classList.remove('loading');
                autofillBtn.textContent = originalText;
                statsText.textContent = 'Cannot autofill';
                showMessage('Cannot autofill on this type of page.', 'warning');
                return;
            }
            
            // Try to inject content script first (in case it wasn't loaded)
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['scripts/content.js']
                });
            } catch (injectError) {
                // Script might already be injected, continue anyway
                console.log('Script injection note:', injectError.message);
            }
            
            // Small delay to let script initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            
            chrome.tabs.sendMessage(tab.id, { action: "autofill", autoSubmit: false }, (response) => {
                autofillBtn.disabled = false;
                autofillBtn.classList.remove('loading');
                autofillBtn.textContent = originalText;
                
                if (chrome.runtime.lastError) {
                    statsText.textContent = 'Error occurred';
                    showMessage('Could not communicate with the page. Try refreshing.', 'error');
                    console.error(chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.error) {
                    statsText.textContent = 'Failed';
                    
                    if (response.needsLogin) {
                        showMessage('Please connect your EasePath account first.', 'warning');
                    } else if (response.needsProfile) {
                        showMessage('No profile data found. Please complete onboarding on EasePath first.', 'warning');
                    } else if (response.serverError) {
                        showMessage('Could not connect to server. Is the backend running?', 'error');
                    } else {
                        showMessage(response.error, 'error');
                    }
                    return;
                }
                
                if (response && response.status === 'success') {
                    const filledCount = response.filledCount || 'some';
                    const essayCount = response.essayQuestions || 0;
                    
                    if (essayCount > 0) {
                        statsText.textContent = `Filled ${filledCount} fields, ${essayCount} essay(s) need attention`;
                        showMessage(`✅ Filled ${filledCount} fields! ✍️ ${essayCount} essay question(s) highlighted for you to fill manually.`, 'warning');
                    } else {
                        statsText.textContent = `Filled ${filledCount} fields! 🎉`;
                        showMessage('Form was filled! Review and submit when ready.', 'success');
                    }
                } else {
                    statsText.textContent = 'No fields found';
                    showMessage('Could not find fields to fill on this page.', 'warning');
                }
            });
        } catch (error) {
            autofillBtn.disabled = false;
            autofillBtn.classList.remove('loading');
            autofillBtn.textContent = originalText;
            statsText.textContent = 'Error';
            showMessage('An unexpected error occurred.', 'error');
        }
    }

    function showMessage(text, type) {
        messageArea.textContent = text;
        messageArea.className = 'message-area ' + (type || '');
        messageArea.classList.remove('hidden');
    }

    function hideMessage() {
        messageArea.classList.add('hidden');
    }
});

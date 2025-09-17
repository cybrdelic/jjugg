// Convert userscript to proper browser extension content script
(function() {
    'use strict';

    // ===== CONFIGURATION =====
    const CONFIG = {
        API_BASE_URL: 'http://127.0.0.1:7766',
        TRACKING_ENABLED: true,
        DEBUG: true,
        AUTO_SAVE_ENABLED: true,
        SMART_INSIGHTS_ENABLED: true,
        NOTIFICATION_ENABLED: true,
        AUTO_FILL_ENABLED: true,
        SALARY_TRACKING_ENABLED: true,
        COMPANY_RESEARCH_ENABLED: true
    };

    // Browser Extension Storage API instead of GM_getValue/GM_setValue
    const browserStorage = {
        getValue: async (key, defaultValue) => {
            try {
                const result = await chrome.storage.sync.get({ [key]: defaultValue });
                return result[key];
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },
        setValue: async (key, value) => {
            try {
                await chrome.storage.sync.set({ [key]: value });
            } catch (error) {
                console.error('Storage set error:', error);
            }
        }
    };

    // Initialize with async storage
    async function initializeUserProfile() {
        return {
            name: await browserStorage.getValue('user_name', 'Your Name'),
            email: await browserStorage.getValue('user_email', 'your.email@gmail.com'),
            phone: await browserStorage.getValue('user_phone', '+1-555-0123'),
            location: await browserStorage.getValue('user_location', 'San Francisco, CA'),
            experience: await browserStorage.getValue('user_experience', '5'),
            skills: await browserStorage.getValue('user_skills', 'JavaScript, React, Node.js, Python'),
            resume_url: await browserStorage.getValue('resume_url', 'https://your-resume-link.com'),
            portfolio_url: await browserStorage.getValue('portfolio_url', 'https://your-portfolio.com'),
            linkedin_url: await browserStorage.getValue('linkedin_url', 'https://linkedin.com/in/yourprofile'),
            github_url: await browserStorage.getValue('github_url', 'https://github.com/yourusername'),
            cover_letter_template: await browserStorage.getValue('cover_letter_template',
                'Dear Hiring Manager,\\n\\nI am excited to apply for the {POSITION} role at {COMPANY}. With {EXPERIENCE} years of experience in {SKILLS}, I believe I would be a great fit for your team.\\n\\nBest regards,\\n{NAME}')
        };
    }

    // Browser notification API
    const notify = (title, message, type = 'info') => {
        if (!CONFIG.NOTIFICATION_ENABLED) return;

        chrome.runtime.sendMessage({
            type: 'SHOW_NOTIFICATION',
            title: `🎯 JJUGG: ${title}`,
            message: message
        });

        console.log(`[JJUGG Enhanced] ${type.toUpperCase()}: ${title} - ${message}`);
    };

    // Copy clipboard function
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            notify('Copied', 'Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    // Open new tab function
    const openInTab = (url) => {
        chrome.runtime.sendMessage({
            type: 'OPEN_TAB',
            url: url
        });
    };

    let USER_PROFILE = null;

    // Initialize the extension
    async function initializeExtension() {
        USER_PROFILE = await initializeUserProfile();

        // Include all the existing userscript functionality here
        // (job extraction, UI overlay, tracking, etc.)

        console.log('[JJUGG Extension] Initialized with profile:', USER_PROFILE);

        // Start the tracking system
        initializeTracking();
    }

    // Add all the existing functions from the userscript here
    // (extractJobData, calculateJobMatchScore, createUIOverlay, etc.)

    // Start the extension when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        initializeExtension();
    }

})();

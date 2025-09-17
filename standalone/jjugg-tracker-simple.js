// Standalone JJUGG Job Tracker - No extensions needed!
// This script can be injected via bookmarklet or hosted file

(function() {
    'use strict';

    // Prevent multiple instances
    if (window.jjuggTrackerLoaded) {
        console.log('JJUGG Tracker already loaded');
        return;
    }
    window.jjuggTrackerLoaded = true;

    // ===== CONFIGURATION =====
    const CONFIG = {
        API_BASE_URL: 'http://127.0.0.1:7766',
        TRACKING_ENABLED: true,
        DEBUG: true,
        NOTIFICATION_ENABLED: true
    };

    // Simple localStorage-based storage (no GM_ functions needed)
    const storage = {
        get: (key, defaultValue) => {
            try {
                const stored = localStorage.getItem(`jjugg_${key}`);
                return stored ? JSON.parse(stored) : defaultValue;
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(`jjugg_${key}`, JSON.stringify(value));
            } catch (error) {
                console.error('Storage set error:', error);
            }
        }
    };

    // User profile with localStorage
    const USER_PROFILE = {
        name: storage.get('user_name', 'Your Name'),
        email: storage.get('user_email', 'your.email@gmail.com'),
        phone: storage.get('user_phone', '+1-555-0123'),
        location: storage.get('user_location', 'San Francisco, CA'),
        experience: storage.get('user_experience', '5'),
        skills: storage.get('user_skills', 'JavaScript, React, Node.js, Python')
    };

    // Simple notification function (browser native)
    const notify = (title, message) => {
        if (!CONFIG.NOTIFICATION_ENABLED) return;

        // Try browser notification first
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`🎯 JJUGG: ${title}`, {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>'
            });
        } else {
            // Fallback to console
            console.log(`[JJUGG] ${title}: ${message}`);

            // Show visual notification
            showVisualNotification(title, message);
        }
    };

    // Visual notification system
    function showVisualNotification(title, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 400px;
            text-align: center;
            animation: slideIn 0.3s ease;
        `;

        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
            <div style="opacity: 0.9;">${message}</div>
        `;

        // Add animation keyframes
        if (!document.getElementById('jjugg-animations')) {
            const style = document.createElement('style');
            style.id = 'jjugg-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(-50%) translateY(0); opacity: 1; }
                    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    notify('Notifications Enabled', 'You\'ll now receive job tracking updates');
                }
            });
        }
    }

    // Simple job data extraction
    function extractJobData() {
        const url = window.location.href;
        const domain = window.location.hostname;

        let jobData = {
            url: url,
            domain: domain,
            timestamp: new Date().toISOString(),
            title: '',
            company: '',
            location: '',
            description: ''
        };

        try {
            // LinkedIn extraction
            if (domain.includes('linkedin.com')) {
                jobData.title = document.querySelector('h1')?.textContent?.trim() || '';
                jobData.company = document.querySelector('[data-test-id="company-name"], .job-details-jobs-unified-top-card__company-name a')?.textContent?.trim() || '';
                jobData.location = document.querySelector('[data-test-id="job-location"]')?.textContent?.trim() || '';
                jobData.description = document.querySelector('[data-test-id="job-description"], .jobs-description__content')?.textContent?.trim() || '';
            }
            // Indeed extraction
            else if (domain.includes('indeed.com')) {
                jobData.title = document.querySelector('h1[data-testid="jobsearch-JobInfoHeader-title"] span, h1')?.textContent?.trim() || '';
                jobData.company = document.querySelector('[data-testid="inlineHeader-companyName"] a')?.textContent?.trim() || '';
                jobData.location = document.querySelector('[data-testid="job-location"]')?.textContent?.trim() || '';
                jobData.description = document.querySelector('#jobDescriptionText')?.textContent?.trim() || '';
            }
            // Glassdoor extraction
            else if (domain.includes('glassdoor.com')) {
                jobData.title = document.querySelector('[data-test="job-title"], h1')?.textContent?.trim() || '';
                jobData.company = document.querySelector('[data-test="employer-name"]')?.textContent?.trim() || '';
                jobData.location = document.querySelector('[data-test="job-location"]')?.textContent?.trim() || '';
                jobData.description = document.querySelector('[data-test="jobDescriptionContent"]')?.textContent?.trim() || '';
            }
            // Generic fallback
            else {
                jobData.title = document.querySelector('h1')?.textContent?.trim() || '';
                jobData.company = document.querySelector('[class*="company"], [id*="company"]')?.textContent?.trim() || '';
                jobData.location = document.querySelector('[class*="location"], [id*="location"]')?.textContent?.trim() || '';
                jobData.description = document.querySelector('[class*="description"], [id*="description"]')?.textContent?.trim() || '';
            }
        } catch (error) {
            console.error('Error extracting job data:', error);
        }

        return jobData;
    }

    // Send data to API
    function sendToAPI(endpoint, data) {
        if (!CONFIG.TRACKING_ENABLED) return;

        fetch(`${CONFIG.API_BASE_URL}/api/job-tracking/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                console.log(`✅ Data sent to ${endpoint}:`, data);
            }
        }).catch(error => {
            console.warn('⚠️ Failed to send data to API:', error);
        });
    }

    // Create simple UI overlay
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'jjugg-simple-overlay';
        overlay.innerHTML = `
            <div class="header">
                <span>🎯 JJUGG Tracker</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="content">
                <div class="status">✅ Tracking Active</div>
                <div class="job-info">
                    <div class="job-title">Loading...</div>
                    <div class="job-company"></div>
                </div>
                <div class="actions">
                    <button onclick="window.jjuggTracker.copyJobData()">📋 Copy Data</button>
                    <button onclick="window.jjuggTracker.openSettings()">⚙️ Settings</button>
                </div>
            </div>
        `;

        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 280px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: white;
            z-index: 999999;
            font-size: 13px;
        `;

        // Add styles for inner elements
        const style = document.createElement('style');
        style.textContent = `
            #jjugg-simple-overlay .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(0,0,0,0.2);
                border-radius: 12px 12px 0 0;
                font-weight: 600;
            }
            #jjugg-simple-overlay .header button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
            }
            #jjugg-simple-overlay .content {
                padding: 16px;
            }
            #jjugg-simple-overlay .status {
                font-size: 12px;
                margin-bottom: 12px;
                opacity: 0.9;
            }
            #jjugg-simple-overlay .job-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            #jjugg-simple-overlay .job-company {
                font-size: 12px;
                opacity: 0.8;
                margin-bottom: 12px;
            }
            #jjugg-simple-overlay .actions {
                display: flex;
                gap: 8px;
            }
            #jjugg-simple-overlay .actions button {
                flex: 1;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                transition: background 0.2s;
            }
            #jjugg-simple-overlay .actions button:hover {
                background: rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);

        return overlay;
    }

    // Initialize the tracker
    function initialize() {
        console.log('🎯 JJUGG Job Tracker starting...');

        // Request notification permission
        requestNotificationPermission();

        // Extract job data
        const jobData = extractJobData();
        console.log('Job data extracted:', jobData);

        // Create UI
        const overlay = createOverlay();

        // Update UI with job info
        if (jobData.title) {
            overlay.querySelector('.job-title').textContent = jobData.title;
            overlay.querySelector('.job-company').textContent = jobData.company;

            notify('Job Detected', `Now tracking "${jobData.title}"`);

            // Send to API
            sendToAPI('job-posting', jobData);
        } else {
            overlay.querySelector('.job-title').textContent = 'No job detected';
            overlay.querySelector('.job-company').textContent = 'Try refreshing or check the URL';
        }

        // Expose global functions
        window.jjuggTracker = {
            copyJobData: () => {
                navigator.clipboard.writeText(JSON.stringify(jobData, null, 2)).then(() => {
                    notify('Copied', 'Job data copied to clipboard');
                });
            },
            openSettings: () => {
                const name = prompt('Your name:', USER_PROFILE.name);
                const email = prompt('Your email:', USER_PROFILE.email);
                if (name) storage.set('user_name', name);
                if (email) storage.set('user_email', email);
                notify('Settings Saved', 'Profile updated');
            }
        };
    }

    // Start the tracker
    initialize();

})();

// ==UserScript==
// @name         JJUGG Enhanced Job Tracker & Assistant
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Advanced job tracking with AI insights, auto-filling, and productivity features for JJUGG
// @author       JJUGG Team
// @match        https://www.linkedin.com/jobs/*
// @match        https://jobs.lever.co/*
// @match        https://boards.greenhouse.io/*
// @match        https://jobs.smartrecruiters.com/*
// @match        https://careers.google.com/*
// @match        https://jobs.apple.com/*
// @match        https://www.glassdoor.com/Job/*
// @match        https://angel.co/jobs/*
// @match        https://wellfound.com/jobs/*
// @match        https://www.indeed.com/viewjob*
// @match        https://stackoverflow.com/jobs/*
// @match        https://remote.co/job/*
// @match        https://remoteok.io/remote-jobs/*
// @match        https://weworkremotely.com/remote-jobs/*
// @match        https://flexjobs.com/jobs/*
// @match        https://www.ziprecruiter.com/jobs/*
// @match        https://www.monster.com/job-openings/*
// @match        https://*.workable.com/j/*
// @match        https://jobs.github.com/positions/*
// @match        https://www.dice.com/jobs/detail/*
// @match        https://hired.com/jobs/*
// @match        https://www.themuse.com/jobs/*
// @match        https://builtin.com/jobs/*
// @match        https://www.crunchboard.com/jobs/*
// @match        https://jobs.techstars.com/*
// @match        https://jobs.ycombinator.com/*
// @match        https://www.upwork.com/jobs/*
// @match        https://www.freelancer.com/projects/*
// @match        https://www.toptal.com/developers/job-board/*
// @match        https://www.workhoppers.com/jobs/*
// @match        https://cryptocurrency.jobs/*
// @match        https://web3.career/*
// @match        https://crypto.jobs/*
// @match        https://jobs.ashbyhq.com/*
// @match        https://apply.workable.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_notification
// @grant        GM_openInTab
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

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

    // ===== USER PROFILE DATA =====
    const USER_PROFILE = {
        name: GM_getValue('user_name', 'Your Name'),
        email: GM_getValue('user_email', 'your.email@gmail.com'),
        phone: GM_getValue('user_phone', '+1-555-0123'),
        location: GM_getValue('user_location', 'San Francisco, CA'),
        experience: GM_getValue('user_experience', '5'),
        skills: GM_getValue('user_skills', 'JavaScript, React, Node.js, Python'),
        resume_url: GM_getValue('resume_url', 'https://your-resume-link.com'),
        portfolio_url: GM_getValue('portfolio_url', 'https://your-portfolio.com'),
        linkedin_url: GM_getValue('linkedin_url', 'https://linkedin.com/in/yourprofile'),
        github_url: GM_getValue('github_url', 'https://github.com/yourusername'),
        cover_letter_template: GM_getValue('cover_letter_template',
            'Dear Hiring Manager,\n\nI am excited to apply for the {POSITION} role at {COMPANY}. With {EXPERIENCE} years of experience in {SKILLS}, I believe I would be a great fit for your team.\n\nBest regards,\n{NAME}')
    };

    // ===== UTILITY FUNCTIONS =====
    const log = (...args) => CONFIG.DEBUG && console.log('[JJUGG Enhanced]', ...args);

    const notify = (title, message, type = 'info') => {
        if (!CONFIG.NOTIFICATION_ENABLED) return;

        GM_notification({
            title: `🎯 JJUGG: ${title}`,
            text: message,
            timeout: 5000,
            onclick: () => window.focus()
        });

        log(`${type.toUpperCase()}: ${title} - ${message}`);
    };

    const saveData = (key, value) => {
        try {
            GM_setValue(key, JSON.stringify(value));
        } catch (error) {
            log('Error saving data:', error);
        }
    };

    const loadData = (key, defaultValue = null) => {
        try {
            const stored = GM_getValue(key, null);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            log('Error loading data:', error);
            return defaultValue;
        }
    };

    // ===== JOB DATA EXTRACTION =====
    let currentJobPosting = null;
    let actionHistory = [];
    let startTime = Date.now();
    let salaryInsights = loadData('salary_insights', {});
    let companyNotes = loadData('company_notes', {});
    let applicationHistory = loadData('application_history', []);

    function generateJobId(url, title, company) {
        const cleanUrl = url.split('?')[0].split('#')[0];
        const hash = btoa(cleanUrl + title + company).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        return `job_${hash}_${Date.now()}`;
    }

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
            description: '',
            salary: '',
            jobType: '',
            requirements: [],
            benefits: [],
            applicationUrl: '',
            contactEmail: '',
            techStack: [],
            experienceLevel: '',
            companySize: '',
            funding: '',
            workMode: '' // remote, hybrid, onsite
        };

        try {
            // Enhanced LinkedIn extraction
            if (domain.includes('linkedin.com')) {
                jobData.title = document.querySelector('h1.top-card-layout__title, .job-details-jobs-unified-top-card__job-title h1, [data-automation-id="job-title"]')?.textContent?.trim() || '';
                jobData.company = document.querySelector('.job-details-jobs-unified-top-card__company-name a, .top-card-layout__card .top-card-layout__entity-info a, [data-automation-id="company-name"]')?.textContent?.trim() || '';
                jobData.location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .top-card-layout__second-subline, [data-automation-id="job-location"]')?.textContent?.trim() || '';
                jobData.description = document.querySelector('.job-details-jobs-unified-top-card__job-description, .jobs-description__content, [data-automation-id="job-description"]')?.textContent?.trim() || '';
                jobData.jobType = document.querySelector('.job-details-jobs-unified-top-card__job-insight span')?.textContent?.trim() || '';

                // Extract salary from LinkedIn
                const salaryElement = document.querySelector('.salary, .compensation-text, [data-automation-id="salary"]');
                if (salaryElement) {
                    jobData.salary = salaryElement.textContent.trim();
                }

                // Extract company size
                const companySizeElement = document.querySelector('.org-top-card-summary-info-list__info-item');
                if (companySizeElement) {
                    jobData.companySize = companySizeElement.textContent.trim();
                }
            }

            // Enhanced Indeed extraction
            else if (domain.includes('indeed.com')) {
                jobData.title = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"] span, h1.jobsearch-JobInfoHeader-title, [data-testid="job-title"]')?.textContent?.trim() || '';
                jobData.company = document.querySelector('[data-testid="inlineHeader-companyName"] a, .jobsearch-CompanyInfoContainer a, [data-testid="company-name"]')?.textContent?.trim() || '';
                jobData.location = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle div')?.textContent?.trim() || '';
                jobData.description = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText, [data-testid="job-description"]')?.textContent?.trim() || '';
                jobData.salary = document.querySelector('.jobsearch-JobMetadataHeader-item[data-testid="job-salary"], [data-testid="salary-snippet"]')?.textContent?.trim() || '';
            }

            // Enhanced Glassdoor extraction
            else if (domain.includes('glassdoor.com')) {
                jobData.title = document.querySelector('[data-test="job-title"], .e1tk4kwz5, [data-test="jobTitle"]')?.textContent?.trim() || '';
                jobData.company = document.querySelector('[data-test="employer-name"], .e1tk4kwz4, [data-test="employerName"]')?.textContent?.trim() || '';
                jobData.location = document.querySelector('[data-test="job-location"], .e1tk4kwz3, [data-test="jobLocation"]')?.textContent?.trim() || '';
                jobData.description = document.querySelector('[data-test="jobDescriptionContent"], .desc, [data-test="description"]')?.textContent?.trim() || '';
                jobData.salary = document.querySelector('[data-test="detailSalary"], [data-test="salary"]')?.textContent?.trim() || '';
            }

            // Enhanced AngelList/Wellfound extraction
            else if (domain.includes('angel.co') || domain.includes('wellfound.com')) {
                jobData.title = document.querySelector('h1[data-test="JobDetail_JobTitle"], .job-title h1, [data-test="title"]')?.textContent?.trim() || '';
                jobData.company = document.querySelector('[data-test="StartupLink_Name"], .company-name a, [data-test="company"]')?.textContent?.trim() || '';
                jobData.location = document.querySelector('[data-test="JobDetail_JobLocation"], .location, [data-test="location"]')?.textContent?.trim() || '';
                jobData.description = document.querySelector('[data-test="JobDetail_JobDescription"], .job-description, [data-test="description"]')?.textContent?.trim() || '';

                // Extract funding information
                const fundingElement = document.querySelector('[data-test="StartupLink_Funding"], .funding-info');
                if (fundingElement) {
                    jobData.funding = fundingElement.textContent.trim();
                }
            }

            // Generic fallback with enhanced selectors
            else {
                const titleSelectors = ['h1', '[data-testid*="title"]', '[class*="title"]', '[class*="job-title"]', '.job-header h1', '.position-title'];
                const companySelectors = ['[data-testid*="company"]', '[class*="company"]', '[class*="employer"]', '.company-name', '.employer-name'];
                const locationSelectors = ['[data-testid*="location"]', '[class*="location"]', '.job-location', '.location'];
                const descriptionSelectors = ['[data-testid*="description"]', '[class*="description"]', '[class*="job-description"]', '.job-desc', '.description'];

                for (const selector of titleSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        jobData.title = element.textContent.trim();
                        break;
                    }
                }

                for (const selector of companySelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        jobData.company = element.textContent.trim();
                        break;
                    }
                }

                for (const selector of locationSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        jobData.location = element.textContent.trim();
                        break;
                    }
                }

                for (const selector of descriptionSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        jobData.description = element.textContent.trim();
                        break;
                    }
                }
            }

            // Enhanced data extraction from description
            const descriptionLower = jobData.description.toLowerCase();

            // Extract tech stack
            const techKeywords = ['react', 'angular', 'vue', 'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'kotlin', 'swift', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'mongodb', 'postgresql', 'mysql', 'redis', 'graphql', 'rest api', 'microservices'];
            jobData.techStack = techKeywords.filter(tech => descriptionLower.includes(tech.toLowerCase()));

            // Extract experience level
            if (descriptionLower.includes('senior') || descriptionLower.includes('lead') || descriptionLower.includes('principal')) {
                jobData.experienceLevel = 'Senior';
            } else if (descriptionLower.includes('junior') || descriptionLower.includes('entry level') || descriptionLower.includes('new grad')) {
                jobData.experienceLevel = 'Junior';
            } else if (descriptionLower.includes('mid level') || descriptionLower.includes('intermediate')) {
                jobData.experienceLevel = 'Mid-level';
            }

            // Extract work mode
            if (descriptionLower.includes('remote') || descriptionLower.includes('work from home')) {
                jobData.workMode = 'Remote';
            } else if (descriptionLower.includes('hybrid')) {
                jobData.workMode = 'Hybrid';
            } else if (descriptionLower.includes('onsite') || descriptionLower.includes('on-site') || descriptionLower.includes('office')) {
                jobData.workMode = 'Onsite';
            }

            // Extract requirements with better parsing
            const requirementKeywords = ['requirements', 'qualifications', 'skills', 'must have', 'required', 'you should have', 'we\'re looking for'];
            requirementKeywords.forEach(keyword => {
                const index = descriptionLower.indexOf(keyword);
                if (index !== -1) {
                    const section = jobData.description.substring(index, index + 800);
                    const lines = section.split(/[\n•·\-\*]/).slice(1, 8);
                    const cleanLines = lines
                        .map(line => line.trim())
                        .filter(line => line.length > 15 && line.length < 200)
                        .filter(line => !line.toLowerCase().includes('benefits') && !line.toLowerCase().includes('we offer'));
                    jobData.requirements.push(...cleanLines);
                }
            });

            // Extract benefits with better parsing
            const benefitKeywords = ['benefits', 'perks', 'we offer', 'compensation', 'package', 'what we provide'];
            benefitKeywords.forEach(keyword => {
                const index = descriptionLower.indexOf(keyword);
                if (index !== -1) {
                    const section = jobData.description.substring(index, index + 500);
                    const lines = section.split(/[\n•·\-\*]/).slice(1, 6);
                    const cleanLines = lines
                        .map(line => line.trim())
                        .filter(line => line.length > 10 && line.length < 150);
                    jobData.benefits.push(...cleanLines);
                }
            });

            // Extract application URL
            const applyButtons = document.querySelectorAll('a[href*="apply"], a[class*="apply"], button[class*="apply"], [data-test*="apply"], [data-testid*="apply"]');
            if (applyButtons.length > 0) {
                const applyButton = Array.from(applyButtons).find(btn => btn.href);
                jobData.applicationUrl = applyButton?.href || url;
            }

            // Extract contact email with better regex
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
            const emails = jobData.description.match(emailRegex);
            if (emails && emails.length > 0) {
                jobData.contactEmail = emails.find(email =>
                    !email.includes('noreply') &&
                    !email.includes('no-reply') &&
                    !email.includes('donotreply')
                ) || emails[0];
            }

        } catch (error) {
            log('Error extracting job data:', error);
        }

        // Generate unique job ID
        jobData.id = generateJobId(url, jobData.title, jobData.company);

        // Remove duplicates from arrays
        jobData.requirements = [...new Set(jobData.requirements)];
        jobData.benefits = [...new Set(jobData.benefits)];
        jobData.techStack = [...new Set(jobData.techStack)];

        return jobData;
    }

    // ===== AI JOB MATCHING & INSIGHTS =====
    function calculateJobMatchScore(jobData) {
        if (!CONFIG.SMART_INSIGHTS_ENABLED) return null;

        let score = 0;
        let reasons = [];

        // Tech stack matching
        const userSkills = USER_PROFILE.skills.toLowerCase().split(',').map(s => s.trim());
        const matchingTech = jobData.techStack.filter(tech =>
            userSkills.some(skill => skill.includes(tech.toLowerCase()) || tech.toLowerCase().includes(skill))
        );

        if (matchingTech.length > 0) {
            const techScore = Math.min((matchingTech.length / jobData.techStack.length) * 40, 40);
            score += techScore;
            reasons.push(`${matchingTech.length} matching technologies: ${matchingTech.join(', ')}`);
        }

        // Experience level matching
        const userExp = parseInt(USER_PROFILE.experience);
        if (jobData.experienceLevel) {
            if (jobData.experienceLevel === 'Senior' && userExp >= 5) {
                score += 20;
                reasons.push('Experience level matches (Senior)');
            } else if (jobData.experienceLevel === 'Mid-level' && userExp >= 2 && userExp < 7) {
                score += 25;
                reasons.push('Experience level matches (Mid-level)');
            } else if (jobData.experienceLevel === 'Junior' && userExp < 3) {
                score += 30;
                reasons.push('Experience level matches (Junior)');
            }
        }

        // Location/Remote work preference
        if (jobData.workMode === 'Remote') {
            score += 15;
            reasons.push('Remote work available');
        }

        // Company size preference (if available)
        if (jobData.companySize && jobData.companySize.includes('startup')) {
            score += 10;
            reasons.push('Startup environment');
        }

        return {
            score: Math.round(score),
            level: score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : score >= 30 ? 'Fair' : 'Poor',
            reasons: reasons
        };
    }

    function trackAction(actionType, details = {}) {
        const action = {
            type: actionType,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            details: details
        };

        actionHistory.push(action);
        log('Action tracked:', action);

        // Send action to API
        sendToAPI('action', action);
    }

    function sendToAPI(endpoint, data) {
        if (!CONFIG.TRACKING_ENABLED) return;
        const queueKey = 'jjugg_pending_api_queue';

        // Attempt immediate send via GM_xmlhttpRequest (bypasses CSP)
        try {
            GM_xmlhttpRequest({
                method: 'POST',
                url: `${CONFIG.API_BASE_URL}/api/job-tracking/${endpoint}`,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(data),
                timeout: 5000,
                onload: (res) => {
                    if (res.status >= 200 && res.status < 300) {
                        log('Sent event:', endpoint, data.type || data);
                        flushQueued();
                    } else {
                        log('API non-2xx, queueing event');
                        queueEvent();
                    }
                },
                onerror: () => { queueEvent(); },
                ontimeout: () => { queueEvent(); }
            });
        } catch (err) {
            log('GM_xmlhttpRequest failed, queueing event', err);
            queueEvent();
        }

        function queueEvent() {
            const q = JSON.parse(localStorage.getItem(queueKey) || '[]');
            q.push({ endpoint, data, ts: Date.now() });
            // Cap queue size
            if (q.length > 200) q.splice(0, q.length - 200);
            localStorage.setItem(queueKey, JSON.stringify(q));
            log('Queued event (will retry later):', endpoint, data.type || data);
        }

        function flushQueued() {
            const q = JSON.parse(localStorage.getItem(queueKey) || '[]');
            if (!q.length) return;
            const remaining = [];
            q.forEach(item => {
                try {
                    GM_xmlhttpRequest({
                        method: 'POST',
                        url: `${CONFIG.API_BASE_URL}/api/job-tracking/${item.endpoint}`,
                        headers: { 'Content-Type': 'application/json' },
                        data: JSON.stringify(item.data),
                        onload: (r) => {
                            if (!(r.status >= 200 && r.status < 300)) {
                                remaining.push(item);
                            }
                        },
                        onerror: () => remaining.push(item)
                    });
                } catch {
                    remaining.push(item);
                }
            });
            // Give async requests a short window then persist leftovers
            setTimeout(() => {
                if (remaining.length) {
                    localStorage.setItem(queueKey, JSON.stringify(remaining));
                } else {
                    localStorage.removeItem(queueKey);
                }
            }, 750);
        }
    }

    // Attempt periodic flush of any queued events (in case earlier sends failed)
    setInterval(() => {
        try {
            const queueKey = 'jjugg_pending_api_queue';
            const q = JSON.parse(localStorage.getItem(queueKey) || '[]');
            if (!q.length) return;
            log(`Retrying ${q.length} queued events...`);
            // Re-dispatch each through sendToAPI; pop first to avoid infinite loop
            localStorage.removeItem(queueKey);
            q.forEach(evt => sendToAPI(evt.endpoint, evt.data));
        } catch (e) {
            // ignore
        }
    }, 10000);

    function setupEventListeners() {
        // Track clicks on apply buttons
        document.addEventListener('click', (event) => {
            const target = event.target;
            const clickedText = target.textContent?.toLowerCase() || '';

            if (clickedText.includes('apply') || target.className.includes('apply')) {
                trackAction('APPLY_CLICKED', {
                    buttonText: target.textContent?.trim(),
                    buttonHref: target.href || null,
                    elementClass: target.className
                });
            }

            if (clickedText.includes('save') || target.className.includes('save')) {
                trackAction('JOB_SAVED', {
                    buttonText: target.textContent?.trim()
                });
            }

            if (clickedText.includes('share') || target.className.includes('share')) {
                trackAction('JOB_SHARED', {
                    buttonText: target.textContent?.trim()
                });
            }
        });

        // Track form submissions (applications)
        document.addEventListener('submit', (event) => {
            trackAction('FORM_SUBMITTED', {
                formAction: event.target.action,
                formMethod: event.target.method,
                formFields: Array.from(event.target.elements)
                    .filter(el => el.name)
                    .map(el => ({ name: el.name, type: el.type }))
            });
        });

        // Track scroll depth
        let maxScrollPercentage = 0;
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const percentage = Math.round((scrolled / scrollHeight) * 100);

            if (percentage > maxScrollPercentage && percentage % 25 === 0) {
                maxScrollPercentage = percentage;
                trackAction('SCROLL_DEPTH', { percentage });
            }
        });

        // Track time spent on page
        let timeSpent = 0;
        const timeTracker = setInterval(() => {
            timeSpent += 5; // Track every 5 seconds
            if (timeSpent % 30 === 0) { // Report every 30 seconds
                trackAction('TIME_SPENT', { seconds: timeSpent });
            }
        }, 5000);

        // Track page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(timeTracker);
            trackAction('PAGE_LEFT', {
                totalTimeSpent: timeSpent,
                maxScrollPercentage: maxScrollPercentage
            });
        });

        // Track copy actions (when user copies job details)
        document.addEventListener('copy', () => {
            const selection = window.getSelection().toString();
            if (selection.length > 10) {
                trackAction('TEXT_COPIED', {
                    copiedText: selection.substring(0, 100) + (selection.length > 100 ? '...' : '')
                });
            }
        });
    }

    // ===== UI OVERLAY SYSTEM =====
    let jjuggOverlay = null;
    let isOverlayVisible = true;

    function createUIOverlay() {
        // Remove existing overlay if it exists
        if (jjuggOverlay) {
            jjuggOverlay.remove();
        }

        // Create main overlay container
        jjuggOverlay = document.createElement('div');
        jjuggOverlay.id = 'jjugg-overlay';
        jjuggOverlay.innerHTML = `
            <div class="jjugg-header">
                <div class="jjugg-logo">🎯 JJUGG Tracker</div>
                <div class="jjugg-controls">
                    <button id="jjugg-minimize" title="Minimize">−</button>
                    <button id="jjugg-close" title="Close">×</button>
                </div>
            </div>
            <div class="jjugg-content">
                <div class="jjugg-status">
                    <div class="status-indicator">
                        <span class="status-dot"></span>
                        <span class="status-text">Initializing...</span>
                    </div>
                </div>
                <div class="jjugg-job-info">
                    <div class="job-title">Loading job data...</div>
                    <div class="job-company"></div>
                    <div class="job-match-score"></div>
                </div>
                <div class="jjugg-actions">
                    <button id="jjugg-save-job" title="Save Job">💾 Save</button>
                    <button id="jjugg-auto-fill" title="Auto-fill Application">✍️ Fill</button>
                    <button id="jjugg-research" title="Company Research">🔍 Research</button>
                </div>
                <div class="jjugg-stats">
                    <div class="stat-item">
                        <span class="stat-label">Actions:</span>
                        <span class="stat-value" id="action-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Time:</span>
                        <span class="stat-value" id="time-spent">0s</span>
                    </div>
                </div>
            </div>
        `;

        // Add comprehensive CSS styles
        const style = document.createElement('style');
        style.textContent = `
            #jjugg-overlay {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                max-width: 90vw;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                color: white;
                z-index: 999999;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                transition: all 0.3s ease;
                user-select: none;
            }

            #jjugg-overlay.minimized {
                height: 50px;
                overflow: hidden;
            }

            #jjugg-overlay.hidden {
                opacity: 0;
                transform: translateX(100%);
                pointer-events: none;
            }

            .jjugg-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(0,0,0,0.2);
                border-radius: 12px 12px 0 0;
                cursor: move;
            }

            .jjugg-logo {
                font-weight: 600;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .jjugg-controls {
                display: flex;
                gap: 4px;
            }

            .jjugg-controls button {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .jjugg-controls button:hover {
                background: rgba(255,255,255,0.3);
            }

            .jjugg-content {
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .jjugg-status {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4CAF50;
                animation: pulse 2s infinite;
            }

            .status-dot.warning {
                background: #FF9800;
            }

            .status-dot.error {
                background: #F44336;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .status-text {
                font-weight: 500;
            }

            .jjugg-job-info {
                background: rgba(0,0,0,0.2);
                padding: 12px;
                border-radius: 8px;
                border-left: 3px solid #4CAF50;
            }

            .job-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 4px;
                line-height: 1.3;
            }

            .job-company {
                opacity: 0.8;
                font-size: 12px;
                margin-bottom: 8px;
            }

            .job-match-score {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
            }

            .match-score-bar {
                flex: 1;
                height: 4px;
                background: rgba(255,255,255,0.2);
                border-radius: 2px;
                overflow: hidden;
            }

            .match-score-fill {
                height: 100%;
                background: linear-gradient(90deg, #FF5722, #FF9800, #4CAF50);
                border-radius: 2px;
                transition: width 0.8s ease;
            }

            .jjugg-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .jjugg-actions button {
                flex: 1;
                min-width: 0;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 500;
                transition: all 0.2s;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .jjugg-actions button:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-1px);
            }

            .jjugg-actions button:active {
                transform: translateY(0);
            }

            .jjugg-stats {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                opacity: 0.8;
            }

            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
            }

            .stat-label {
                opacity: 0.7;
            }

            .stat-value {
                font-weight: 600;
                color: #4CAF50;
            }

            /* Draggable functionality */
            #jjugg-overlay.dragging {
                cursor: move;
                user-select: none;
            }

            /* Mobile responsiveness */
            @media (max-width: 480px) {
                #jjugg-overlay {
                    width: 280px;
                    right: 10px;
                    top: 10px;
                }

                .jjugg-actions {
                    flex-direction: column;
                }

                .jjugg-actions button {
                    flex: none;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(jjuggOverlay);

        // Make overlay draggable
        makeDraggable(jjuggOverlay, jjuggOverlay.querySelector('.jjugg-header'));

        // Add event listeners
        setupOverlayEventListeners();

        return jjuggOverlay;
    }

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            element.classList.add('dragging');
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;

            // Keep overlay within viewport
            const maxTop = window.innerHeight - element.offsetHeight;
            const maxLeft = window.innerWidth - element.offsetWidth;

            element.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px";
            element.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + "px";
            element.style.right = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            element.classList.remove('dragging');
        }
    }

    function setupOverlayEventListeners() {
        // Minimize/Maximize
        document.getElementById('jjugg-minimize').onclick = () => {
            jjuggOverlay.classList.toggle('minimized');
            const button = document.getElementById('jjugg-minimize');
            button.textContent = jjuggOverlay.classList.contains('minimized') ? '+' : '−';
        };

        // Close overlay
        document.getElementById('jjugg-close').onclick = () => {
            jjuggOverlay.classList.add('hidden');
            isOverlayVisible = false;
        };

        // Action buttons
        document.getElementById('jjugg-save-job').onclick = () => {
            if (currentJobPosting) {
                saveJobToHistory(currentJobPosting);
                notify('Job Saved', `Saved "${currentJobPosting.title}" to your job history`);
                trackAction('JOB_SAVED_VIA_OVERLAY', { jobId: currentJobPosting.id });
            }
        };

        document.getElementById('jjugg-auto-fill').onclick = () => {
            if (CONFIG.AUTO_FILL_ENABLED) {
                autoFillApplication();
                trackAction('AUTO_FILL_TRIGGERED', { source: 'overlay' });
            } else {
                notify('Auto-fill Disabled', 'Enable auto-fill in settings to use this feature');
            }
        };

        document.getElementById('jjugg-research').onclick = () => {
            if (currentJobPosting && currentJobPosting.company) {
                const searchUrl = `https://www.google.com/search?q="${currentJobPosting.company}" company research funding employees`;
                GM_openInTab(searchUrl, false);
                trackAction('COMPANY_RESEARCH', { company: currentJobPosting.company });
            }
        };
    }

    function updateOverlayStatus(status, type = 'success') {
        if (!jjuggOverlay) return;

        const statusText = jjuggOverlay.querySelector('.status-text');
        const statusDot = jjuggOverlay.querySelector('.status-dot');

        if (statusText) statusText.textContent = status;
        if (statusDot) {
            statusDot.className = `status-dot ${type}`;
        }
    }

    function updateJobInfo(jobData) {
        if (!jjuggOverlay || !jobData) return;

        const titleEl = jjuggOverlay.querySelector('.job-title');
        const companyEl = jjuggOverlay.querySelector('.job-company');
        const matchScoreEl = jjuggOverlay.querySelector('.job-match-score');

        if (titleEl) titleEl.textContent = jobData.title || 'No title found';
        if (companyEl) companyEl.textContent = jobData.company || 'No company found';

        // Calculate and display match score
        const matchData = calculateJobMatchScore(jobData);
        if (matchScoreEl && matchData) {
            matchScoreEl.innerHTML = `
                <span>Match: ${matchData.score}% (${matchData.level})</span>
                <div class="match-score-bar">
                    <div class="match-score-fill" style="width: ${matchData.score}%"></div>
                </div>
            `;
        }
    }

    function updateStats() {
        if (!jjuggOverlay) return;

        const actionCountEl = document.getElementById('action-count');
        const timeSpentEl = document.getElementById('time-spent');

        if (actionCountEl) actionCountEl.textContent = actionHistory.length;
        if (timeSpentEl) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timeSpentEl.textContent = elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed/60)}m`;
        }
    }

    function saveJobToHistory(jobData) {
        applicationHistory.push({
            ...jobData,
            savedAt: new Date().toISOString(),
            status: 'saved'
        });
        saveData('application_history', applicationHistory);
    }

    function autoFillApplication() {
        // Find common form fields and auto-fill them
        const fields = [
            { selectors: ['input[name*="name"]', 'input[id*="name"]', 'input[placeholder*="name"]'], value: USER_PROFILE.name },
            { selectors: ['input[name*="email"]', 'input[id*="email"]', 'input[type="email"]'], value: USER_PROFILE.email },
            { selectors: ['input[name*="phone"]', 'input[id*="phone"]', 'input[type="tel"]'], value: USER_PROFILE.phone },
            { selectors: ['input[name*="location"]', 'input[id*="location"]'], value: USER_PROFILE.location },
            { selectors: ['textarea[name*="cover"]', 'textarea[id*="cover"]'], value: generateCoverLetter() }
        ];

        let filledCount = 0;
        fields.forEach(field => {
            for (const selector of field.selectors) {
                const element = document.querySelector(selector);
                if (element && !element.value) {
                    element.value = field.value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    filledCount++;
                    break;
                }
            }
        });

        if (filledCount > 0) {
            notify('Auto-fill Complete', `Filled ${filledCount} fields automatically`);
        } else {
            notify('No Fields Found', 'No compatible form fields found to auto-fill');
        }
    }

    function generateCoverLetter() {
        if (!currentJobPosting) return USER_PROFILE.cover_letter_template;

        return USER_PROFILE.cover_letter_template
            .replace('{POSITION}', currentJobPosting.title)
            .replace('{COMPANY}', currentJobPosting.company)
            .replace('{EXPERIENCE}', USER_PROFILE.experience)
            .replace('{SKILLS}', USER_PROFILE.skills)
            .replace('{NAME}', USER_PROFILE.name);
    }

    function initializeTracking() {
        log('Initializing job tracking on:', window.location.href);

        // Create UI overlay
        createUIOverlay();
        updateOverlayStatus('Extracting job data...', 'warning');

        // Extract job data
        setTimeout(() => {
            currentJobPosting = extractJobData();
            log('Job data extracted:', currentJobPosting);

            // Update UI with job info
            updateJobInfo(currentJobPosting);
            updateOverlayStatus('Tracking active', 'success');

            // Send job posting data to API
            sendToAPI('job-posting', currentJobPosting);

            // Track page view
            trackAction('PAGE_VIEWED', {
                jobId: currentJobPosting.id,
                referrer: document.referrer
            });

            // Show initial notification
            if (currentJobPosting.title) {
                const matchData = calculateJobMatchScore(currentJobPosting);
                const matchText = matchData ? ` (${matchData.score}% match)` : '';
                notify('Job Detected', `Tracking "${currentJobPosting.title}"${matchText}`);
            }
        }, 2000); // Wait 2 seconds for page to load

        // Setup event listeners
        setupEventListeners();

        // Update stats every 5 seconds
        setInterval(updateStats, 5000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTracking);
    } else {
        initializeTracking();
    }

    // Re-initialize on navigation (for SPAs)
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            log('Navigation detected, reinitializing...');

            // Update overlay status
            if (jjuggOverlay && isOverlayVisible) {
                updateOverlayStatus('Page changed, reloading...', 'warning');
            }

            setTimeout(initializeTracking, 1000);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + Shift + J to toggle overlay
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'J') {
            event.preventDefault();
            if (jjuggOverlay) {
                if (isOverlayVisible) {
                    jjuggOverlay.classList.add('hidden');
                    isOverlayVisible = false;
                } else {
                    jjuggOverlay.classList.remove('hidden');
                    isOverlayVisible = true;
                }
                trackAction('OVERLAY_TOGGLED', { visible: isOverlayVisible });
            }
        }
    });

})();

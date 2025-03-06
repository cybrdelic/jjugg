// ==UserScript==
// @name         jjugg - Job Application Auto-Tracker
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Automatically track job applications for jjugg on popular and remote job boards
// @author       You
// @match        *://*.linkedin.com/*apply*
// @match        *://*.indeed.com/*apply*
// @match        *://*.glassdoor.com/*apply*
// @match        *://*.glassdoor.com/job-listing/*submitted*
// @match        *://*.monster.com/*apply*
// @match        *://*.monster.com/jobs/*confirmation*
// @match        *://*.ziprecruiter.com/*apply*
// @match        *://*.ziprecruiter.com/candidate/*/confirmation*
// @match        *://*.careerbuilder.com/*apply*
// @match        *://*.careerbuilder.com/job/*confirmation*
// @match        *://weworkremotely.com/remote-jobs/*/apply*
// @match        *://weworkremotely.com/*/application*
// @match        *://remoteok.com/remote-jobs/*/apply*
// @match        *://remoteok.com/*/submission*
// @match        *://*.flexjobs.com/jobs/*apply*
// @match        *://*.flexjobs.com/*/confirmation*
// @match        *://www.workingnomads.com/jobs/*/apply*
// @match        *://www.workingnomads.com/*/confirmation*
// @match        *://*/*application-submitted*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Enhanced selectors for better job details extraction
    const selectors = {
        title: [
            'h1', '.job-title', '[class*="title"]', '[class*="job"]', 
            'h2', 'h3', '.posting-title', '.jobTitle', '.job-header',
            '[data-testid="jobsearch-JobInfoHeader-title"]', // Indeed
            '.topcard__title', // LinkedIn
            '[data-test="job-title"]' // Glassdoor
        ],
        company: [
            '.company-name', '[class*="company"]', '.org-name', 
            '[class*="employer"]', '.company', '.job-company', 
            '.employer-name', '.company-info',
            '[data-testid="jobsearch-JobInfoHeader-companyName"]', // Indeed
            '.topcard__org-name-link', // LinkedIn
            '[data-test="employer-name"]' // Glassdoor
        ],
        description: [
            '.job-description', '[class*="description"]', '.job-info', 
            '.posting-description', '[class*="details"]', '.job-details',
            '#jobDescriptionText', // Indeed
            '.description__text', // LinkedIn
            '.jobDescriptionContent' // Glassdoor
        ],
        salary: [
            '.salary-snippet', '.salaryEstimate', '[class*="salary"]',
            '[data-test="detailSalary"]', '.compensation', '.pay-estimate'
        ]
    };
    
    // Helper function to try multiple selectors until one works
    function queryMultipleSelectors(selectorArray) {
        for (const selector of selectorArray) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        return null;
    }
    
    // Extract job details with fallbacks
    let title = queryMultipleSelectors(selectors.title) || 'Unknown Title';
    let company = queryMultipleSelectors(selectors.company) || 'Unknown Company';
    let date = new Date().toISOString().split('T')[0];
    let url = window.location.href;
    let description = queryMultipleSelectors(selectors.description) || '';
    description = description.slice(0, 200) + (description.length > 200 ? '...' : '');
    
    // Try to extract salary information
    let salaryText = queryMultipleSelectors(selectors.salary);
    let expectedSalary = 0;
    
    if (salaryText) {
        // Extract salary numbers using regex
        const salaryPattern = /[\$£€]?\s*\d{1,3}(?:[,.\s]\d{3})*(?:\s*[kK]\b)?/g;
        const matches = salaryText.match(salaryPattern);
        
        if (matches && matches.length > 0) {
            // Extract first number
            let salaryValue = matches[0].replace(/[^\d.]/g, '');
            
            // Handle if it's expressed in thousands (k)
            if (matches[0].toLowerCase().includes('k')) {
                salaryValue = parseFloat(salaryValue) * 1000;
            } else {
                salaryValue = parseFloat(salaryValue);
            }
            
            if (!isNaN(salaryValue)) {
                expectedSalary = salaryValue;
            }
        }
    }
    
    // Create application object with more data
    let app = {
        id: Date.now(),
        title: title,
        company: company,
        date: date,
        status: 'Applied',
        notes: description,
        url: url,
        history: [{ date: date, status: 'Applied', notes: 'Auto-tracked application' }],
        salary: {
            expected: expectedSalary,
            offered: null,
            benefits: ""
        },
        favorite: false
    };
    
    // Create and show notification
    function showNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background: rgba(0, 240, 255, 0.2);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            border-left: 3px solid #00f0ff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            animation: slide-in 0.3s ease forwards;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div style="margin-right: 10px; font-size: 22px;">✓</div>
                <div>
                    <div style="font-size: 14px; font-weight: bold;">Application Tracked</div>
                    <div style="font-size: 12px; opacity: 0.8;">${company} - ${title}</div>
                </div>
            </div>
        `;
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slide-in {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fade-out {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove the notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fade-out 0.5s ease forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Store application data
    let apps = JSON.parse(localStorage.getItem('jobApplications')) || [];
    
    // Check if we already tracked this URL to avoid duplicates
    const isAlreadyTracked = apps.some(application => application.url === url);
    
    if (!isAlreadyTracked) {
        apps.push(app);
        localStorage.setItem('jobApplications', JSON.stringify(apps));
        console.log('jjugg: Application logged:', app);
        showNotification();
    } else {
        console.log('jjugg: Application already tracked for this URL');
    }
})();
// ==UserScript==
// @name         jjugg - Job Application Auto-Tracker
// @namespace    http://tampermonkey.net/
// @version      0.4
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
    // Broader selectors for job title, company, and description, tailored for remote job boards
    let title = document.querySelector('h1, .job-title, [class*="title"], [class*="job"], h2, h3, .posting-title, .jobTitle, .job-header')?.textContent.trim() || 'Unknown Title';
    let company = document.querySelector('.company-name, [class*="company"], .org-name, [class*="employer"], .company, .job-company, .employer-name, .company-info')?.textContent.trim() || 'Unknown Company';
    let date = new Date().toISOString().split('T')[0];
    let url = window.location.href;
    let description = document.querySelector('.job-description, [class*="description"], .job-info, .posting-description, [class*="details"], .job-details')?.textContent.slice(0, 100) + '...' || '';

    let app = {
        id: Date.now(),
        title: title,
        company: company,
        date: date,
        status: 'Applied',
        notes: description,
        url: url
    };

    let apps = JSON.parse(localStorage.getItem('jobApplications')) || [];
    apps.push(app);
    localStorage.setItem('jobApplications', JSON.stringify(apps));
    console.log('jjugg: Application logged:', app);
})();

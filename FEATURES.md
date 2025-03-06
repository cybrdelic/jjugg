# jjugg - Feature Tracking

This document tracks the features of **jjugg**, a Smart Job Application Tracker designed to automate and simplify job application management for job seekers, with a focus on remote developers.

## Status Key

- ✅ **Implemented**: Fully functional in the current version.
- 🚧 **In Progress**: Partially implemented or actively being worked on.
- ☐ **Planned**: Proposed but not yet started.
- ❓ **Under Consideration**: Ideas needing further exploration.

## Current Features

| Feature                          | Status | Description                                                                                   |
|----------------------------------|--------|-----------------------------------------------------------------------------------------------|
| Userscript Automation            | ✅     | A Tampermonkey/Greasemonkey userscript (`jjugg-userscript.js`) captures job title, company, date, URL, and a description snippet from supported sites (LinkedIn, Indeed, Glassdoor, Monster, ZipRecruiter, CareerBuilder, We Work Remotely, Remote OK, FlexJobs, Working Nomads, generic "application-submitted" URLs). Logs data to `localStorage`. |
| Manual Application Entry         | ✅     | Form in `jjugg.html` allows adding applications with pre-filled date for unsupported sources. |
| Unified Dashboard                | ✅     | Table displays all applications with sorting (by column) and filtering (by status).         |
| Proactive Reminders              | ✅     | Lists applications in "Applied" status >10 days old, with a "Followed Up" button to log action. |
| Basic Analytics                  | ✅     | Shows total applications and status counts.                                                 |
| Data Export                      | ✅     | Exports applications as a JSON file with one click.                                         |
| Local Storage Persistence        | ✅     | Saves data in browser's localStorage for persistence across sessions.                       |
| Fake Data for Testing            | ✅     | Pre-loads 5 sample applications for immediate testing.                                      |
| Local Server Option              | ✅     | Setup script starts a Python HTTP server to serve `jjugg.html` at `http://localhost:8000`.  |
| Improved UI                      | ✅     | Modern styling with shadows, hover effects, and a clean layout.                             |

## Potential Features

| Feature                          | Status | Description                                                                                   | Priority |
|----------------------------------|--------|-----------------------------------------------------------------------------------------------|----------|
| Email Integration                | ☐     | Parse inbox for confirmation emails or status updates to auto-update applications (e.g., via IMAP or manual paste). | High     |
| Advanced Userscript Automation   | ☐     | Expand userscript to detect submissions on additional job boards (e.g., SimplyHired, Jobvite) or handle dynamic content (e.g., via MutationObserver). | High     |
| Userscript Debugging UI          | ☐     | Add a popup or console in `jjugg.html` to show userscript logs and tweak detection settings. | Medium   |
| Job Description Storage          | ☐     | Save full job descriptions in localStorage or a downloadable file via userscript capture.   | Medium   |
| Calendar Integration             | ☐     | Sync interview dates with Google Calendar or similar when detected (e.g., via email parsing). | Medium   |
| Status Suggestions               | ☐     | Suggest next steps (e.g., "Prepare for interview") based on status changes in the dashboard. | Medium   |
| Import Data                      | ☐     | Allow importing applications from a JSON/CSV file to complement export.                    | Medium   |
| Custom Reminders                 | ☐     | Let users set custom follow-up intervals (e.g., 7 or 14 days) instead of fixed 10 days.     | Low      |
| Visual Analytics                 | ☐     | Add charts (e.g., Pie chart of statuses) using a lightweight JS library like Chart.js.      | Low      |
| Dark Mode                        | ☐     | Toggle between light and dark themes for better usability.                                  | Low      |
| Browser Extension Conversion     | ❓     | Convert userscript to a full Chrome/Firefox extension for deeper integration (e.g., tab monitoring, permissions). | High     |
| Cloud Sync                       | ❓     | Optional cloud storage (e.g., Google Drive) for backup across devices, with encryption.     | Medium   |
| Application Templates            | ❓     | Save reusable application data (e.g., resume links) for quick manual entry in the form.    | Low      |

## Notes

- **Priority**: High (critical for core functionality), Medium (valuable enhancement), Low (nice-to-have).
- **Userscript Details**: The userscript (`jjugg-userscript.js`) runs in the browser via Tampermonkey/Greasemonkey, triggered by URL patterns for LinkedIn, Indeed, Glassdoor, Monster, ZipRecruiter, CareerBuilder, We Work Remotely, Remote OK, FlexJobs, Working Nomads, and generic "application-submitted" pages. It uses broad DOM queries to extract data and logs to `localStorage`, which `jjugg.html` reads.
- **Remote Dev Focus**: Added support for remote job boards to cater to developers seeking remote work.
- **Constraints**: Limited to a single HTML file and userscript, so features like email integration or extension-level browser access require architectural changes.
- **Next Steps**: Prioritize high-priority features like email integration and further userscript automation to reduce manual input.

## How to Contribute

- Suggest new features by adding them to the "Potential Features" table with a "☐ Planned" or "❓ Under Consideration" status.
- Mark features as "🚧 In Progress" when working on them, and update to "✅ Implemented" with details once complete.
- Test and refine existing features (especially the userscript) based on real-world usage feedback.

Last Updated: March 5, 2025

# JJUGG Job Tracker Userscript

This userscript automatically tracks job postings you browse and the actions you perform on them, sending the data to your JJUGG development API where it gets displayed in the npm logs.

## Installation

### 1. Install Tampermonkey (Browser Extension)

- **Chrome**: [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Safari**: [Tampermonkey for Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)
- **Edge**: [Tampermonkey for Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. Install the Userscript

1. Open the `job-tracker.user.js` file from this directory
2. Copy the entire contents
3. Open Tampermonkey dashboard (click the extension icon → Dashboard)
4. Click "Create a new script"
5. Replace the default content with the copied userscript code
6. Save the script (Ctrl+S or Cmd+S)

### 3. Start Your Development Server

Make sure your JJUGG development server is running:

```bash
pnpm dev
```

The userscript will send data to `http://127.0.0.1:7766` (your dev API).

## Supported Job Sites

The userscript automatically works on these job sites:

- **LinkedIn Jobs** (`linkedin.com/jobs/*`)
- **Indeed** (`indeed.com/viewjob*`)
- **Glassdoor** (`glassdoor.com/Job/*`)
- **AngelList/Wellfound** (`angel.co/jobs/*`, `wellfound.com/jobs/*`)
- **Lever** (`jobs.lever.co/*`)
- **Greenhouse** (`boards.greenhouse.io/*`)
- **SmartRecruiters** (`jobs.smartrecruiters.com/*`)
- **Google Careers** (`careers.google.com/*`)
- **Apple Jobs** (`jobs.apple.com/*`)
- **Stack Overflow Jobs** (`stackoverflow.com/jobs/*`)
- **Remote.co** (`remote.co/job/*`)
- **RemoteOK** (`remoteok.io/remote-jobs/*`)
- **We Work Remotely** (`weworkremotely.com/remote-jobs/*`)
- **FlexJobs** (`flexjobs.com/jobs/*`)
- **ZipRecruiter** (`ziprecruiter.com/jobs/*`)
- **Monster** (`monster.com/job-openings/*`)
- **Workable** (`*.workable.com/j/*`)
- **GitHub Jobs** (`jobs.github.com/positions/*`)
- **Dice** (`dice.com/jobs/detail/*`)
- **Hired** (`hired.com/jobs/*`)
- **The Muse** (`themuse.com/jobs/*`)
- **Built In** (`builtin.com/jobs/*`)
- **Crunchboard** (`crunchboard.com/jobs/*`)
- **Techstars Jobs** (`jobs.techstars.com/*`)
- **Y Combinator Jobs** (`jobs.ycombinator.com/*`)

## What Gets Tracked

### Job Posting Data
- Job title, company, location
- Job description and requirements
- Salary information (when available)
- Benefits and perks
- Application URL
- Contact information

### User Actions
- **Page Views**: When you visit a job posting
- **Apply Clicks**: When you click "Apply" buttons
- **Job Saves**: When you save/bookmark jobs
- **Job Shares**: When you share job postings
- **Form Submissions**: When you submit application forms
- **Scroll Depth**: How much of the job posting you read
- **Time Spent**: How long you spend reading each posting
- **Text Copying**: When you copy job details
- **Page Navigation**: When you leave a job posting

## Example Output in npm logs

When you browse jobs, you'll see output like this in your terminal:

```
🎯 NEW JOB POSTING TRACKED:
📍 URL: https://www.linkedin.com/jobs/view/3234567890
💼 Title: Senior Frontend Developer
🏢 Company: TechCorp Inc.
📍 Location: San Francisco, CA
💰 Salary: $120,000 - $160,000
⏰ Timestamp: 2025-09-16T23:45:30.123Z
📝 Description Preview: We are looking for an experienced Frontend Developer to join our growing team...
✅ Requirements Found: 5
🎁 Benefits Found: 3
────────────────────────────────────────────────────────────────────────────────

👀 [11:45:32 PM] Viewed job posting (linkedin.com)
📜 [11:45:45 PM] Scrolled 25% through job posting (linkedin.com)
📋 [11:45:52 PM] Copied text: "React, TypeScript, Node.js experience required" (linkedin.com)
📜 [11:46:05 PM] Scrolled 50% through job posting (linkedin.com)
⏱️ [11:46:15 PM] Spent 30s reading job posting (linkedin.com)
📤 [11:46:22 PM] Clicked APPLY button: "Easy Apply" (linkedin.com)
   🔗 Application URL: https://www.linkedin.com/jobs/application/3234567890
👋 [11:46:30 PM] Left page after 45s (75% scrolled) (linkedin.com)
```

## Configuration

You can modify the userscript behavior by editing these variables at the top of the script:

```javascript
const API_BASE_URL = 'http://127.0.0.1:7766';  // Your dev API URL
const TRACKING_ENABLED = true;                  // Enable/disable tracking
const DEBUG = true;                             // Enable/disable debug logs
```

## Privacy & Data

- All data is sent to your local development server only
- No data is sent to external services
- The userscript only activates on job sites you visit
- You can disable tracking by setting `TRACKING_ENABLED = false`

## Troubleshooting

### Userscript not working
1. Check that Tampermonkey is enabled
2. Verify the script is active in Tampermonkey dashboard
3. Check browser console for errors (F12 → Console)

### Data not appearing in logs
1. Ensure your dev server is running (`pnpm dev`)
2. Check that the API URL in the script matches your server
3. Look for network errors in browser dev tools (F12 → Network)

### Adding new job sites
To add support for a new job site, add a new `@match` line to the userscript header:

```javascript
// @match        https://newjobsite.com/jobs/*
```

Then add site-specific data extraction logic in the `extractJobData()` function.

## API Endpoints

The userscript sends data to these endpoints:

- `POST /api/job-tracking/job-posting` - Job posting data
- `POST /api/job-tracking/action` - User action data
- `GET /api/job-tracking/stats` - Tracking statistics

## Visual Indicator

When the userscript is active, you'll see a green "🎯 JJUGG Tracking Active" indicator in the top-right corner of job pages for 3 seconds.

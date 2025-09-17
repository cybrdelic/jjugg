import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, dbPath, runMigrations } from './db.js';
import { IngestEnvelope, RerunPipeline } from './schemas.js';
import { ensureId, normalizeCompany, normalizeLocation, stableHash } from './util.js';
import { EventBus } from './ws.js';
const PORT = 7766;
// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
runMigrations();
const app = express();
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/] }));
app.use(express.json({ limit: '2mb' }));
// Serve static files for the job tracker
app.use('/static', express.static(path.join(__dirname, '../../../standalone')));
app.use('/setup', express.static(path.join(__dirname, '../../../standalone')));
const server = http.createServer(app);
const bus = new EventBus(server);
// MVP audit removed with *_mvp tables cleanup
function insertAudit() { }
// Health
app.get('/health', (_req, res) => res.json({ ok: true }));
// Diagnostics
app.get('/daemon/info', (_req, res) => {
    const counts = db.prepare(`
            SELECT
                (SELECT COUNT(*) FROM job_postings) as postings
        `).get();
    res.json({ ok: true, dbPath, wsClients: bus.clientCount(), counts, now: Date.now() });
});
app.get('/daemon/events', (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    res.json({ ok: true, events: bus.getRecent(limit) });
});
// localStorage event bus endpoint
app.get('/api/job-tracking/poll-events', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>JJUGG Event Poller</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }
        .event { margin: 10px 0; padding: 10px; border-left: 3px solid #00ff00; background: rgba(0,255,0,0.1); }
        .timestamp { color: #888; font-size: 0.9em; }
        .no-events { color: #888; font-style: italic; }
    </style>
</head>
<body>
    <h2>🎯 JJUGG localStorage Event Poller</h2>
    <div id="status">Checking for events...</div>
    <div id="events"></div>

    <script>
        async function pollEvents() {
            try {
                const events = JSON.parse(localStorage.getItem('jjugg_events') || '[]');
                const unprocessedEvents = events.filter(e => !e.processed);

                if (unprocessedEvents.length > 0) {
                    // Send events to daemon
                    for (const event of unprocessedEvents) {
                        try {
                            await fetch('/api/job-tracking/' + event.endpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(event.data)
                            });

                            // Mark as processed
                            event.processed = true;

                            // Display in UI
                            displayEvent(event);
                        } catch (err) {
                            console.error('Failed to send event:', err);
                        }
                    }

                    // Update localStorage with processed events
                    localStorage.setItem('jjugg_events', JSON.stringify(events));

                    document.getElementById('status').textContent =
                        \`Processed \${unprocessedEvents.length} events. Next check in 2 seconds...\`;
                } else {
                    document.getElementById('status').textContent =
                        'No new events. Next check in 2 seconds...';
                }
            } catch (err) {
                document.getElementById('status').textContent = 'Error: ' + err.message;
            }

            setTimeout(pollEvents, 2000); // Poll every 2 seconds
        }

        function displayEvent(event) {
            const eventsDiv = document.getElementById('events');
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event';
            eventDiv.innerHTML = \`
                <div><strong>\${event.endpoint.toUpperCase()}</strong></div>
                <div class="timestamp">\${event.timestamp}</div>
                <div>\${JSON.stringify(event.data, null, 2)}</div>
            \`;
            eventsDiv.insertBefore(eventDiv, eventsDiv.firstChild);

            // Keep only last 20 events in display
            const eventDivs = eventsDiv.querySelectorAll('.event');
            if (eventDivs.length > 20) {
                eventDivs[eventDivs.length - 1].remove();
            }
        }

        // Start polling
        pollEvents();
    </script>
</body>
</html>
    `);
});
// Ingest endpoints
app.post('/ingest/form', (req, res) => {
    const parse = IngestEnvelope.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const env = parse.data;
    const sourceHash = stableHash(JSON.stringify(env));
    // MVP: stash into job_postings if posting provided
    if (env.posting) {
        const id = ensureId();
        const company = normalizeCompany(env.posting.company);
        const location = normalizeLocation(env.posting.location);
        db.prepare(`INSERT OR IGNORE INTO job_postings (id, source_url, title, company_name_raw, location_raw, description_raw, raw_payload_json, hash, collected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
            .run(id, env.url, env.posting.title ?? '', company, location, env.posting.desc_html ?? '', JSON.stringify(env.raw ?? {}), sourceHash);
    }
    // Queue task (MVP: inline process). Normalize to application row if looks like submission
    // For MVP, just ack
    res.status(202).json({ ingest_id: sourceHash });
});
// Draft ingest disabled (removed *_mvp tables)
app.post('/ingest/posting', (req, res) => {
    const parse = IngestEnvelope.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const env = parse.data;
    const id = ensureId();
    const company = normalizeCompany(env.posting?.company);
    const location = normalizeLocation(env.posting?.location);
    const hash = stableHash([env.url, env.posting?.title, company, location].join('|'));
    db.prepare(`INSERT OR IGNORE INTO job_postings (id, source_url, title, company_name_raw, location_raw, description_raw, raw_payload_json, hash, collected_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
        .run(id, env.url, env.posting?.title ?? '', company, location, env.posting?.desc_html ?? '', JSON.stringify(env.raw ?? {}), hash);
    bus.emit('events/posting.captured', { id, url: env.url });
    res.status(202).json({ id, hash });
});
// Applications API minimal
// Applications endpoints removed with *_mvp tables
// app.get('/apps/:id', ...) removed
// Status update endpoint removed
// Email link endpoint removed
// Job Tracking Endpoints
app.post('/api/job-tracking/job-posting', (req, res) => {
    const jobData = req.body;
    console.log('\n🎯 NEW JOB POSTING TRACKED:');
    console.log('📍 URL:', jobData.url);
    console.log('💼 Title:', jobData.title);
    console.log('🏢 Company:', jobData.company);
    console.log('📍 Location:', jobData.location);
    console.log('💰 Salary:', jobData.salary || 'Not specified');
    console.log('⏰ Timestamp:', jobData.timestamp);
    if (jobData.description && jobData.description.length > 100) {
        console.log('📝 Description Preview:', jobData.description.substring(0, 200) + '...');
    }
    if (jobData.requirements && jobData.requirements.length > 0) {
        console.log('✅ Requirements Found:', jobData.requirements.length);
    }
    if (jobData.benefits && jobData.benefits.length > 0) {
        console.log('🎁 Benefits Found:', jobData.benefits.length);
    }
    console.log('─'.repeat(80));
    // Emit event for real-time updates
    bus.emit('job-tracking/posting', jobData);
    res.json({ success: true, jobId: jobData.id });
});
app.post('/api/job-tracking/action', (req, res) => {
    const actionData = req.body;
    // Create a more readable action message
    let actionMessage = '';
    let emoji = '🔍';
    switch (actionData.type) {
        case 'PAGE_VIEWED':
            emoji = '👀';
            actionMessage = `Viewed job posting`;
            break;
        case 'APPLY_CLICKED':
            emoji = '📤';
            actionMessage = `Clicked APPLY button: "${actionData.details.buttonText}"`;
            break;
        case 'JOB_SAVED':
            emoji = '⭐';
            actionMessage = `Saved job posting`;
            break;
        case 'JOB_SHARED':
            emoji = '📤';
            actionMessage = `Shared job posting`;
            break;
        case 'FORM_SUBMITTED':
            emoji = '📋';
            actionMessage = `Submitted application form`;
            break;
        case 'SCROLL_DEPTH':
            emoji = '📜';
            actionMessage = `Scrolled ${actionData.details.percentage}% through job posting`;
            break;
        case 'TIME_SPENT':
            emoji = '⏱️';
            actionMessage = `Spent ${actionData.details.seconds}s reading job posting`;
            break;
        case 'TEXT_COPIED':
            emoji = '📋';
            actionMessage = `Copied text: "${actionData.details.copiedText}"`;
            break;
        case 'PAGE_LEFT':
            emoji = '👋';
            actionMessage = `Left page after ${actionData.details.totalTimeSpent}s (${actionData.details.maxScrollPercentage}% scrolled)`;
            break;
        default:
            actionMessage = `${actionData.type}: ${JSON.stringify(actionData.details)}`;
    }
    const timestamp = new Date(actionData.timestamp).toLocaleTimeString();
    const domain = new URL(actionData.url).hostname;
    console.log(`${emoji} [${timestamp}] ${actionMessage} (${domain})`);
    // Show additional details for important actions
    if (actionData.type === 'APPLY_CLICKED' && actionData.details.buttonHref) {
        console.log(`   🔗 Application URL: ${actionData.details.buttonHref}`);
    }
    if (actionData.type === 'FORM_SUBMITTED' && actionData.details.formFields) {
        console.log(`   📝 Form fields: ${actionData.details.formFields.map((f) => f.name).join(', ')}`);
    }
    // Emit event for real-time updates
    bus.emit('job-tracking/action', actionData);
    res.json({ success: true });
});
// Get job tracking statistics
app.get('/api/job-tracking/stats', (_req, res) => {
    // This would normally query a database, but for now we'll return mock stats
    const stats = {
        totalJobsViewed: 0,
        totalApplications: 0,
        totalTimeSpent: 0,
        topCompanies: [],
        topJobTitles: [],
        applicationSources: []
    };
    console.log('📊 Job tracking statistics requested');
    res.json(stats);
});
app.post('/pipeline/rerun', (req, res) => {
    const parsed = RerunPipeline.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    // MVP: no-op, emit event
    bus.emit('events/pipeline.rerun', parsed.data);
    res.status(202).json({ ok: true });
});
// Setup page route
app.get('/', (_req, res) => {
    res.redirect('/setup');
});
server.listen(PORT, () => {
    console.log(`✅ JJUGG Daemon listening on http://127.0.0.1:${PORT}`);
    console.log(`📖 Job Tracker Setup: http://127.0.0.1:${PORT}/setup`);
    console.log(`🔖 Bookmarklet Script: http://127.0.0.1:${PORT}/static/jjugg-tracker-simple.js`);
});

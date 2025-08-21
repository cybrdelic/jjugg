import React, { useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { ExternalLink, Clipboard } from 'lucide-react';

export default function ImapGuidePage() {
    const copy = useCallback(async (text: string) => {
        try { await navigator.clipboard.writeText(text); } catch { }
    }, []);

    // --- IMAP Test UI ---
    const [isLoading, setIsLoading] = React.useState(false);
    const [status, setStatus] = React.useState<string | null>(null);
    const [debugSteps, setDebugSteps] = React.useState<any[]>([]);
    const [latestEmail, setLatestEmail] = React.useState<any | null>(null);
    const [form, setForm] = React.useState({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        user: '',
        password: '',
        mailbox: 'INBOX'
    });
    React.useEffect(() => {
        // Load config from DB on mount
        fetch('/api/email-config')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.config) setForm(data.config);
            });
    }, []);
    const testConnection = async () => {
        setIsLoading(true);
        setStatus(null);
        setDebugSteps([]);
        try {
            const response = await fetch('/api/test-imap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const result = await response.json();
            if (result.success) {
                setStatus('Connection test successful ✅');
                setLatestEmail(result.latestEmail || null);
            } else {
                setStatus('Test failed: ' + (result.message || 'Check credentials') + ' ❌');
                setLatestEmail(null);
            }
            setDebugSteps(result.debugSteps || []);
        } catch (error: any) {
            setStatus('Test failed: ' + (error.message || 'Unknown error') + ' ❌');
            setLatestEmail(null);
        }
        setIsLoading(false);
    };
    return (
        <AppLayout currentSection="profile-artifacts-section">
            <div className="imap-guide">
                <header className="hero">
                    <h1 className="text-h1">IMAP Setup Guide</h1>
                    <p className="lead">Zero‑BS, click‑by‑click instructions to get JJUGG reading your email via IMAP. Start with Gmail + App Password (fastest). Outlook 365 (OAuth) and Generic IMAP included.</p>
                    <div className="hero-actions">
                        <a className="btn primary" href="/profile">Open Settings</a>
                        <a className="btn" href="/profile">Go to Configure</a>
                    </div>
                </header>

                <div className="imap-test-section card" style={{ margin: '2rem 0', padding: '2rem' }}>
                    <h2>IMAP Connection Test</h2>
                    <p>Test your IMAP connection and see debug details below. This uses your saved config.</p>
                    <button className="btn btn-primary" onClick={testConnection} disabled={isLoading} style={{ marginBottom: '1rem' }}>
                        {isLoading ? 'Testing...' : 'Test IMAP Connection'}
                    </button>
                    {status && (
                        <div className={`test-result ${status.includes('✅') ? 'success' : 'error'}`}>{status}</div>
                    )}
                    {debugSteps.length > 0 && (
                        <div className="debug-steps">
                            <h3>Debug Steps</h3>
                            <ul>
                                {debugSteps.map((step, idx) => (
                                    <li key={idx}>
                                        <strong>{step.step}:</strong> {step.error ? <span style={{ color: 'red' }}>{step.error}</span> : null}
                                        {step.status ? ` ${step.status}` : ''}
                                        {step.messageCount !== undefined ? ` Messages: ${step.messageCount}` : ''}
                                        {step.mailbox ? ` Mailbox: ${step.mailbox}` : ''}
                                        {step.latestEmail ? <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: '8px' }}>{JSON.stringify(step.latestEmail, null, 2)}</pre> : null}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {latestEmail && (
                        <div className="latest-email-preview">
                            <h3>Latest Email</h3>
                            <div><strong>Subject:</strong> {latestEmail.subject}</div>
                            <div><strong>From:</strong> {latestEmail.from}</div>
                            <div><strong>To:</strong> {latestEmail.to}</div>
                            <div><strong>Date:</strong> {latestEmail.date}</div>
                            <div><strong>Body:</strong><pre style={{ whiteSpace: 'pre-wrap' }}>{latestEmail.body}</pre></div>
                        </div>
                    )}
                </div>

                <div className="content-grid">
                    <aside className="toc" aria-label="On this page">
                        <div className="toc-title">On this page</div>
                        <nav>
                            <a href="#path-a">Path A — Gmail (App Password)</a>
                            <a href="#path-b">Path B — Outlook / Microsoft 365 (OAuth)</a>
                            <a href="#path-c">Path C — Generic IMAP</a>
                            <a href="#jjugg-knobs">JJUGG knobs to flip</a>
                            <a href="#smoke-test">End‑to‑end smoke test</a>
                            <a href="#walls">If you hit walls</a>
                        </nav>
                    </aside>

                    <main className="article">
                        <section id="path-a" className="card" aria-labelledby="path-a-title">
                            <h2 id="path-a-title" className="text-h2">Path A — Gmail (App Password) in ~10 min</h2>

                            <h3>1) Turn on IMAP in Gmail</h3>
                            <ol className="steps">
                                <li>Open Gmail (web) → <strong>Settings</strong> → <strong>See all settings</strong>.</li>
                                <li>Tab <strong>Forwarding and POP/IMAP</strong> → in <em>IMAP access</em> choose <strong>Enable IMAP</strong> → <strong>Save Changes</strong>.<br /><span className="note-inline">If you don’t see it, your Workspace admin disabled IMAP. Ask them to allow IMAP.</span></li>
                            </ol>

                            <h3>2) Create an App Password (required with 2‑Step)</h3>
                            <ol className="steps">
                                <li>Go to <strong>Google Account</strong> → <strong>Security</strong>.</li>
                                <li>Make sure <strong>2‑Step Verification</strong> is <strong>ON</strong>.</li>
                                <li>Under <strong>2‑Step Verification</strong>, open <strong>App passwords</strong>.</li>
                                <li><em>Select app</em>: <strong>Mail</strong>. <em>Select device</em>: <strong>Other</strong> → type <strong>JJUGG</strong> → <strong>Generate</strong>.</li>
                                <li>Copy the <strong>16‑char app password</strong> (no spaces). <em>This is your IMAP password.</em></li>
                            </ol>

                            <div className="credentials">
                                <div className="cred-row"><span>IMAP host</span><code>imap.gmail.com</code><button className="chip" onClick={() => copy('imap.gmail.com')}><Clipboard size={14} /> Copy</button></div>
                                <div className="cred-row"><span>Port</span><code>993</code><button className="chip" onClick={() => copy('993')}><Clipboard size={14} /> Copy</button></div>
                                <div className="cred-row"><span>SSL/TLS</span><strong>On</strong></div>
                                <div className="cred-row"><span>User</span><strong>Your full Gmail address</strong></div>
                                <div className="cred-row"><span>Pass</span><strong>App Password (16‑char)</strong></div>
                            </div>

                            <h3>3) Drop in the JJUGG ingest daemon</h3>
                            <p>Assuming your JJUGG repo has a server side. From the repo root (or <code>packages/email-daemon</code>):</p>
                            <pre className="code-block" data-lang="bash"><code>{`# init (if subpackage)
npm init -y
npm i imapflow mailparser html-to-text ical better-sqlite3 p-limit zod dotenv
npm i -D typescript ts-node @types/node
npx tsc --init`}</code></pre>

                            <p>Create <code>.env</code> (next to your script):</p>
                            <pre className="code-block" data-lang="ini"><code>{`# Gmail IMAP
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true

IMAP_USER=you@gmail.com
IMAP_PASS=xxxx xxxx xxxx xxxx   # your 16-char App Password (spaces optional)

# Mailbox + tuning
IMAP_MAILBOX=INBOX
IMAP_WINDOW_DAYS=90
IMAP_CONCURRENCY=4

# DB
JJUGG_DB_PATH=./jjugg-email.db`}</code></pre>

                            <p>Create <code>src/email/ingest.ts</code> and paste the ingest (IMAP+IDLE + SQLite + classification). If you need it, ask and we’ll paste the full file.</p>

                            <p>Add npm scripts:</p>
                            <pre className="code-block" data-lang="json"><code>{`{
  "scripts": {
    "email:dev": "ts-node -r dotenv/config src/email/ingest.ts",
    "email:build": "tsc",
    "email:start": "node -r dotenv/config dist/email/ingest.js"
  }
}`}</code></pre>

                            <p>Run it:</p>
                            <pre className="code-block" data-lang="bash"><code>{`npm run email:dev`}</code></pre>
                            <p>You should see logs like <em>mailbox opened</em>, then it will backfill recent mail and sit <strong>IDLE</strong> for new.</p>

                            <h3>4) Verify it’s actually ingesting</h3>
                            <pre className="code-block" data-lang="bash"><code>{`npx sqlite3 ./jjugg-email.db ".tables"
# expect: emails, email_state
npx sqlite3 ./jjugg-email.db "SELECT date, subject, class, vendor FROM emails ORDER BY date DESC LIMIT 25;"`}</code></pre>
                            <p>Expect recent subjects + a rough <code>class</code> (applied/schedule/rejection/etc) and a <code>vendor</code> guess (greenhouse/lever/workday…).</p>

                            <h3>5) Wire to JJUGG UI (minimal)</h3>
                            <ul>
                                <li>Expose <code>GET /api/email/recent</code>, <code>GET /api/email/by-application/:id</code>.</li>
                                <li>Show an Inbox tab and/or Application timeline sourced from this table.</li>
                                <li>If an email isn’t auto‑linked, add “Link to Application”.</li>
                            </ul>

                            <h3>6) Run it 24/7</h3>
                            <h4>pm2</h4>
                            <pre className="code-block" data-lang="bash"><code>{`npm i -g pm2
pm2 start "npm run email:dev" --name jjugg-email
pm2 save`}</code></pre>
                            <h4>systemd (Linux)</h4>
                            <p>Create <code>/etc/systemd/system/jjugg-email.service</code> pointing to <code>npm run email:start</code> with <code>EnvironmentFile=/path/.env</code>, <code>WorkingDirectory=…</code>, <code>Restart=always</code> then:</p>
                            <pre className="code-block" data-lang="bash"><code>{`sudo systemctl daemon-reload && sudo systemctl enable --now jjugg-email`}</code></pre>

                            <h4>Common Gmail gotchas</h4>
                            <ul>
                                <li><em>App passwords missing?</em> Turn on 2‑Step or admin blocked it.</li>
                                <li><em>IMAP disabled by admin?</em> Ask to enable IMAP access org‑wide.</li>
                                <li><em>Too many simultaneous connections</em> → set <code>IMAP_CONCURRENCY=1</code> or 2.</li>
                                <li><em>Seeing zero mail?</em> Try <code>IMAP_MAILBOX="[Gmail]/All Mail"</code>.</li>
                            </ul>
                        </section>

                        <section id="path-b" className="card" aria-labelledby="path-b-title">
                            <h2 id="path-b-title" className="text-h2">Path B — Outlook / Microsoft 365 (OAuth)</h2>
                            <p><em>MS killed basic auth; you need OAuth tokens (XOAUTH2) for IMAP.</em></p>

                            <h3>1) Register an app in Azure</h3>
                            <ol className="steps">
                                <li>Azure Portal → <strong>Microsoft Entra ID</strong> → <strong>App registrations</strong> → <strong>New registration</strong>.</li>
                                <li>Name: <strong>JJUGG Email</strong>. Supported account types: your tenant.</li>
                                <li><strong>Redirect URI</strong>: add a <em>Public client / native</em> like <code>http://localhost:53682/callback</code>.</li>
                                <li>Save <strong>Application (client) ID</strong> and <strong>Directory (tenant) ID</strong>.</li>
                            </ol>

                            <h3>2) API permissions</h3>
                            <ol className="steps">
                                <li><strong>API permissions</strong> → Add a permission → APIs my organization uses → Office 365 Exchange Online.</li>
                                <li>Add <strong>Delegated</strong> permission: <code>IMAP.AccessAsUser.All</code>.</li>
                                <li>Also add <code>offline_access</code> + <code>openid</code> (Microsoft Graph delegated).</li>
                                <li><strong>Grant admin consent</strong>.</li>
                            </ol>

                            <h3>3) Get user tokens (device code flow)</h3>
                            <p>Use <code>msal-node</code> to sign in and stash refresh token.</p>
                            <pre className="code-block" data-lang="bash"><code>{`npm i msal @azure/msal-node`}</code></pre>
                            <p>Create <code>scripts/ms-oauth.ts</code> requesting scopes:</p>
                            <pre className="code-block" data-lang="text"><code>{`scopes = [
  "https://outlook.office365.com/IMAP.AccessAsUser.All",
  "offline_access",
  "openid",
  "profile"
]`}</code></pre>
                            <p>On success, capture <strong>access_token</strong> and <strong>refresh_token</strong>. Ask if you want the exact MSAL script.</p>

                            <h3>4) Configure JJUGG to use XOAUTH2</h3>
                            <pre className="code-block" data-lang="ini"><code>{`IMAP_HOST=outlook.office365.com
IMAP_PORT=993
IMAP_SECURE=true

IMAP_USER=you@yourdomain.com
IMAP_ACCESS_TOKEN=eyJhbGciOiJ...   # from MSAL step`}</code></pre>
                            <p>Refresh the access token every ~45 min using the stored <code>refresh_token</code>. We can wire this into the ingest.</p>
                        </section>

                        <section id="path-c" className="card" aria-labelledby="path-c-title">
                            <h2 id="path-c-title" className="text-h2">Path C — Generic IMAP (Fastmail/Proton/etc.)</h2>
                            <p>Ask your provider for IMAP server, Port 993 with SSL, username, and an app password. Then:</p>
                            <pre className="code-block" data-lang="ini"><code>{`IMAP_HOST=imap.fastmail.com
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=you@domain.com
IMAP_PASS=xxxxxxxx`}</code></pre>
                            <p>Run the daemon.</p>
                        </section>

                        <section id="jjugg-knobs" className="card info" aria-labelledby="knobs-title">
                            <h2 id="knobs-title" className="text-h2">JJUGG‑side knobs to flip now</h2>
                            <ul>
                                <li><strong>Backfill window</strong>: <code>IMAP_WINDOW_DAYS=90</code> (or 180).</li>
                                <li><strong>Classification</strong>: extend regexes for your ATS phrases (Workday, Greenhouse, Lever).</li>
                                <li><strong>Linking</strong>: keep <code>{`{uidValidity,lastSeenUid}`}</code> per mailbox; if <code>uidValidity</code> changes → rescan by date window.</li>
                                <li><strong>Dedup</strong>: key by <code>Message-ID</code> and keep a raw MIME hash.</li>
                                <li><strong>ICS</strong>: if <code>hasIcs==true</code>, parse with <code>ical</code> and emit interview events.</li>
                            </ul>
                        </section>

                        <section id="smoke-test" className="card" aria-labelledby="smoke-title">
                            <h2 id="smoke-title" className="text-h2">Quick end‑to‑end smoke test</h2>
                            <ol className="steps">
                                <li>Send yourself: subject <strong>“Thanks for applying — Greenhouse”</strong>.</li>
                                <li>Wait ~1–5s → daemon logs <code>exists</code>.</li>
                                <li><code>sqlite3 jjugg-email.db "SELECT subject,class,vendor FROM emails ORDER BY rowid DESC LIMIT 5;"</code><br />Expect <code>class=applied</code> and <code>vendor=greenhouse</code>.</li>
                                <li>Drop an .ics (fake interview) → expect an attachment with <code>text/calendar</code>.</li>
                            </ol>
                        </section>

                        <section id="walls" className="card muted" aria-labelledby="walls-title">
                            <h2 id="walls-title" className="text-h2">If you hit walls</h2>
                            <ul>
                                <li><strong>Gmail app password not available</strong> → admin blocked it; need Gmail OAuth or use a personal Gmail.</li>
                                <li><strong>MS 365 keeps 401’ing</strong> → consent not granted tenant‑wide, or wrong scopes.</li>
                                <li><strong>Nothing ingests</strong> → mailbox path differs (e.g., localized All Mail). Try <code>IMAP_MAILBOX="[Gmail]/All Mail"</code>.</li>
                                <li><strong>Rate/conn issues</strong> → set <code>IMAP_CONCURRENCY=1</code>.</li>
                            </ul>
                            <p>Need help? Ask for (a) Gmail OAuth desktop flow script, (b) MS token auto‑refresh, or (c) a tiny REST API for the UI.</p>
                        </section>

                        <section className="cta">
                            <a className="btn primary" href="/profile">Open Configure</a>
                            <a className="btn ghost" href="/profile">Back to Settings</a>
                        </section>
                    </main>
                </div>
            </div>

            <style jsx>{`
        .imap-guide { display: flex; flex-direction: column; gap: 18px; }
        .hero { display: flex; flex-direction: column; gap: 10px; }
        .hero h1 { margin: 0; font-size: 24px; }
        .hero p { margin: 0; color: var(--text-secondary); }
        .hero-actions { display: flex; gap: 8px; margin-top: 6px; }

        .content-grid { display: grid; grid-template-columns: 280px 1fr; gap: 18px; }
        @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }

        .toc { position: sticky; top: calc(var(--navbar-height) + 12px); align-self: start; border: 1px solid var(--border-thin); border-radius: var(--border-radius); background: var(--glass-card-bg); padding: 12px; }
        .toc-title { font-weight: 700; font-size: 12px; color: var(--text-tertiary); margin-bottom: 6px; }
        .toc nav { display: flex; flex-direction: column; gap: 6px; }
        .toc a { color: var(--text-secondary); text-decoration: none; font-size: 13px; }
        .toc a:hover { color: var(--text-primary); }

        .article { display: flex; flex-direction: column; gap: 14px; }
        .card { border: 1px solid var(--border-thin); border-radius: var(--border-radius); background: var(--glass-card-bg); padding: 16px; }
        .card.info { background: rgba(var(--accent-blue-rgb), 0.08); border-color: rgba(var(--accent-blue-rgb), 0.35); }
        .card.muted { opacity: 0.95; }

        .steps { padding-left: 18px; margin: 6px 0; }
        .steps li { margin: 4px 0; }
        .note-inline { color: var(--text-tertiary); }

        .credentials { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; margin: 8px 0; }
        .cred-row { display: flex; align-items: center; gap: 8px; border: 1px solid var(--border-thin); border-radius: 10px; background: var(--glass-card-bg); padding: 8px 10px; }
        .cred-row span { width: 82px; color: var(--text-tertiary); font-size: 12px; }
        .cred-row code { background: var(--hover-bg); border: 1px solid var(--border-thin); border-radius: 6px; padding: 0 6px; }
        .chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border-thin); background: var(--hover-bg); color: var(--text-secondary); cursor: pointer; font-size: 12px; }
        .chip:hover { background: var(--glass-card-bg); color: var(--text-primary); }

        .code-block { background: #0b1020; color: #f7fafc; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px; overflow: auto; }
        .code-block[data-lang="bash"] { background: #0b1020; }
        .code-block[data-lang="ini"] { background: #101826; }
        .code-block[data-lang="json"] { background: #101826; }
        .code-block code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12.5px; }

        .cta { display: flex; gap: 8px; margin-top: 8px; }
        .btn { padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-thin); background: var(--glass-card-bg); color: var(--text-primary); font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
        .btn.primary { background: rgba(var(--accent-primary-rgb), 0.12); color: var(--accent-primary); border-color: rgba(var(--accent-primary-rgb), 0.35); }
        .btn.ghost { background: transparent; }
      `}</style>
        </AppLayout>
    );
}

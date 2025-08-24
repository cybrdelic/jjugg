import type { FeatureFlags } from '@/contexts/FeatureFlagContext';
import { useFeatureFlagControls, useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { Activity, Bug, CheckCircle, Eye, EyeOff, Mail, Server, Settings as SettingsIcon, Shield, Terminal, Wifi, WifiOff, XCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

// Add lightweight connection meta persistence
type ImapMeta = { lastTestOk?: boolean; lastCheckedAt?: number; lastError?: string };
type EmailPreview = { subject: string; from: string; date: string; snippet: string } | null;
const IMAP_META_KEY = 'imapStatusMeta';

type ImapSettings = {
  host: string;
  port: number | '';
  secure: boolean; // SSL/TLS
  username: string;
  password: string;
  mailbox: string; // INBOX, etc.
};

const DEFAULT_IMAP: ImapSettings = {
  host: '',
  port: 993,
  secure: true,
  username: '',
  password: '',
  mailbox: 'INBOX',
};

// Removed unused STORAGE_KEY constant

const ProfileSettings: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'imap' | 'security' | 'daemon' | 'features'>('imap');
  const flags = useFeatureFlags();
  const { setFlag, resetOverrides } = useFeatureFlagControls();
  const [imap, setImap] = useState<ImapSettings>(DEFAULT_IMAP);
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [latestPreview, setLatestPreview] = useState<EmailPreview>(null);
  const [imapView, setImapView] = useState<'status' | 'configure'>('status');
  const [meta, setMeta] = useState<ImapMeta>({});
  const [bootChecking, setBootChecking] = useState(true);
  const [hasStoredConfig, setHasStoredConfig] = useState<boolean | null>(null);

  // Daemon monitor state
  const [daemonHealth, setDaemonHealth] = useState<{ ok: boolean; lastCheckedAt?: number; error?: string } | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [events, setEvents] = useState<Array<{ type: string; data: any; ts: number }>>([]);
  const [pinging, setPinging] = useState(false);
  const [pipelineBusy, setPipelineBusy] = useState(false);
  const DAEMON_ORIGIN = 'http://127.0.0.1:7766';

  const isValid = useMemo(() => {
    return (
      imap.host.trim().length > 0 &&
      !!imap.port &&
      imap.username.trim().length > 0 &&
      imap.password.trim().length > 0 &&
      imap.mailbox.trim().length > 0
    );
  }, [imap]);

  // Derive status from settings + meta
  const connectionState = useMemo<'not_configured' | 'configured' | 'connected'>(() => {
    const hasBasics = imap.host && imap.username && imap.password && imap.mailbox && imap.port;
    if (!hasBasics) return 'not_configured';
    if (meta.lastTestOk) return 'connected';
    return 'configured';
  }, [imap, meta.lastTestOk]);

  // Boot: load saved config from app DB and auto-test quietly
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/email-config');
        const res = await resp.json();
        if (res.success && res.config) {
          setHasStoredConfig(true);
          const cfg = res.config as { host: string; port: number; secure: boolean; user: string; password: string; mailbox: string };
          setImap({
            host: cfg.host,
            port: cfg.port || 993,
            secure: Boolean(cfg.secure),
            username: cfg.user,
            password: cfg.password || '',
            mailbox: cfg.mailbox || 'INBOX',
          });
          setImapView('status');
          await testConnection(true);
        } else {
          setHasStoredConfig(false);
        }
        const metaRaw = localStorage.getItem(IMAP_META_KEY);
        if (metaRaw) setMeta(JSON.parse(metaRaw));
      } catch {
        setHasStoredConfig(false);
      } finally {
        setBootChecking(false);
      }
    })();
  }, []);

  const saveMeta = (next: ImapMeta) => {
    setMeta(next);
    try { localStorage.setItem(IMAP_META_KEY, JSON.stringify(next)); } catch { }
  };

  const save = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const payload = {
        host: imap.host,
        port: Number(imap.port || 993),
        secure: Boolean(imap.secure),
        user: imap.username,
        password: imap.password,
        mailbox: imap.mailbox || 'INBOX'
      };
      const resp = await fetch('/api/email-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await resp.json();
      if (json.success) {
        setTestResult({ ok: true, message: 'Saved settings.' });
        setHasStoredConfig(true);
      } else {
        setTestResult({ ok: false, message: 'Save failed.' });
      }
    } catch (e: any) {
      setTestResult({ ok: false, message: String(e?.message || e) });
    } finally { setTesting(false); }
  };

  const clearImap = async () => {
    setTesting(true);
    try {
      const resp = await fetch('/api/email-config', { method: 'DELETE' });
      const json = await resp.json();
      if (json.success) {
        setImap(DEFAULT_IMAP);
        setLatestPreview(null);
        setTestResult({ ok: true, message: 'Cleared settings.' });
        saveMeta({});
        setHasStoredConfig(false);
      } else {
        setTestResult({ ok: false, message: 'Failed to clear settings.' });
      }
    } catch (e: any) {
      setTestResult({ ok: false, message: String(e?.message || e) });
    } finally { setTesting(false); }
  };

  const testConnection = async (silent?: boolean) => {
    setTesting(!silent);
    if (!silent) setTestResult(null);
    setLatestPreview(null);
    try {
      const cfg = {
        type: 'generic-imap',
        imap: {
          host: imap.host,
          port: Number(imap.port || 993),
          user: imap.username,
          mailbox: imap.mailbox || 'INBOX',
          windowDays: 90,
          secure: Boolean(imap.secure)
        },
        auth: { method: 'app-password', user: imap.username, pass: imap.password }
      };
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch('/api/test-imap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg), signal: controller.signal });
      clearTimeout(timer);
      const json = await resp.json();
      if (json.success) {
        setLatestPreview(json.preview || null);
        if (!silent) setTestResult({ ok: true, message: 'Connected.' });
        saveMeta({ lastTestOk: true, lastCheckedAt: Date.now(), lastError: undefined });
      } else {
        if (!silent) setTestResult({ ok: false, message: json.message || 'IMAP test failed.' });
        saveMeta({ lastTestOk: false, lastCheckedAt: Date.now(), lastError: json.message || 'IMAP test failed.' });
      }
    } catch (e: any) {
      if (!silent) setTestResult({ ok: false, message: e?.name === 'AbortError' ? 'IMAP test timed out.' : String(e?.message || e) });
      saveMeta({ lastTestOk: false, lastCheckedAt: Date.now(), lastError: e?.message || String(e) });
    } finally { setTesting(false); }
  };

  const update = (patch: Partial<ImapSettings>) => setImap(prev => ({ ...prev, ...patch }));

  // WebSocket connection for daemon events
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://127.0.0.1:7766/ws');
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          setEvents(prev => {
            const next = [{ type: msg.type, data: msg.data, ts: Date.now() }, ...prev];
            return next.slice(0, 100);
          });
        } catch { }
      };
      return () => ws.close();
    } catch {
      setWsConnected(false);
      return () => { };
    }
  };

  const pingDaemon = async () => {
    setPinging(true);
    try {
      const res = await fetch(`${DAEMON_ORIGIN}/health`);
      const json = await res.json();
      setDaemonHealth({ ok: Boolean(json?.ok), lastCheckedAt: Date.now() });
    } catch (e: any) {
      setDaemonHealth({ ok: false, lastCheckedAt: Date.now(), error: String(e?.message || e) });
    } finally {
      setPinging(false);
    }
  };

  const quickRerun = async () => {
    setPipelineBusy(true);
    try {
      await fetch(`${DAEMON_ORIGIN}/pipeline/rerun`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entity: 'application', id: 'debug-ui', steps: ['normalize'] }) });
    } catch { }
    setPipelineBusy(false);
  };

  const loadAppsSummary = async () => {
    try {
      const res = await fetch(`${DAEMON_ORIGIN}/apps?limit=1`);
      const json = await res.json();
      setEvents(prev => [{ type: 'debug.apps.summary', data: { total: json?.total, sample: json?.rows?.[0] }, ts: Date.now() }, ...prev].slice(0, 100));
    } catch (e: any) {
      setEvents(prev => [{ type: 'debug.error', data: { message: String(e?.message || e) }, ts: Date.now() }, ...prev].slice(0, 100));
    }
  };

  useEffect(() => {
    if (activeTab !== 'daemon') return;
    const cleanup = connectWebSocket();
    // auto-ping when opening the tab
    pingDaemon();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="settings-shell">
      {/* Colorful hero header */}
      <div className="settings-hero">
        <div className="hero-bar" />
        <div className="hero-content">
          <h1 className="hero-title text-h2">Settings</h1>
          <p className="hero-subtitle lead">Configure email, security, features, and developer daemon. Changes apply instantly.</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar navigation */}
        <aside className="settings-nav" aria-label="Settings navigation">
          <button className={`nav-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <Shield size={16} /> <span>General</span>
          </button>
          <button className={`nav-item ${activeTab === 'imap' ? 'active' : ''}`} onClick={() => setActiveTab('imap')}>
            <Mail size={16} /> <span>Email (IMAP)</span>
          </button>
          <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <Server size={16} /> <span>Security</span>
          </button>
          <button className={`nav-item ${activeTab === 'daemon' ? 'active' : ''}`} onClick={() => setActiveTab('daemon')}>
            <Activity size={16} /> <span>Daemon</span>
          </button>
          <button className={`nav-item ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>
            <SettingsIcon size={16} /> <span>Features</span>
          </button>
        </aside>

        {/* Main content */}
        <main className="settings-panel">
          {activeTab === 'imap' && (
            <section className="card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <h2 className="card-title">IMAP Configuration</h2>
                  <p className="card-subtitle">Add your email settings to enable parsing of interview dates, contacts, and threads.</p>
                </div>
                <div className="card-actions">
                  <button className="btn ghost" onClick={save} title="Save settings" disabled={!isValid}>Save</button>
                  <button className="btn primary" onClick={() => testConnection()} disabled={!isValid || testing}>
                    {testing ? 'Testing…' : 'Test Connection'}
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Status / Configure */}
              <div className="subtabs">
                <button className={`subtab ${imapView === 'status' ? 'active' : ''}`} onClick={() => setImapView('status')}>Status</button>
                <button className={`subtab ${imapView === 'configure' ? 'active' : ''}`} onClick={() => setImapView('configure')}>Configure</button>
              </div>

              {/* STATUS VIEW */}
              {imapView === 'status' && (
                <div className="status-view">
                  {bootChecking && (
                    <div className="test-banner" role="status">
                      <Server size={16} />
                      <span>{hasStoredConfig ? 'Found saved email settings — testing connection…' : 'Checking for saved email settings…'}</span>
                    </div>
                  )}
                  <div className={`status-card ${connectionState}`}>
                    {connectionState === 'connected' && <CheckCircle size={18} />}
                    {connectionState === 'configured' && <Server size={18} />}
                    {connectionState === 'not_configured' && <XCircle size={18} />}
                    <div className="status-text">
                      {connectionState === 'connected' && (
                        <>
                          <h3>Connected</h3>
                          <p>IMAP connection tested successfully{meta.lastCheckedAt ? ` · ${new Date(meta.lastCheckedAt).toLocaleString()}` : ''}.</p>
                        </>
                      )}
                      {connectionState === 'configured' && (
                        <>
                          <h3>Configured (not tested)</h3>
                          <p>Settings are saved. Run a test to verify connectivity.</p>
                        </>
                      )}
                      {connectionState === 'not_configured' && (
                        <>
                          <h3>Not configured</h3>
                          <p>IMAP isn’t set up yet. Configure it to enable email parsing.</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="summary-grid">
                    <div className="summary-item"><span>Host</span><strong>{imap.host || '—'}</strong></div>
                    <div className="summary-item"><span>Port</span><strong>{imap.port || '—'}</strong></div>
                    <div className="summary-item"><span>Security</span><strong>{imap.secure ? 'SSL/TLS' : 'STARTTLS/None'}</strong></div>
                    <div className="summary-item"><span>Username</span><strong>{imap.username ? imap.username : '—'}</strong></div>
                    <div className="summary-item"><span>Mailbox</span><strong>{imap.mailbox || '—'}</strong></div>
                  </div>

                  {latestPreview && (
                    <div className="card mt-12">
                      <div className="card-header compact">
                        <div className="card-title-wrap">
                          <h3 className="card-title">Latest email</h3>
                          <p className="card-subtitle">Preview fetched during the last test.</p>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="email-preview">
                          <div className="preview-subject">{latestPreview.subject || '(no subject)'}</div>
                          <div className="preview-meta">{latestPreview.from || ''}{latestPreview.date ? ` · ${latestPreview.date}` : ''}</div>
                          <div className="preview-body">{latestPreview.snippet || '(no text preview)'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="status-actions">
                    <button className="btn primary" onClick={() => setImapView('configure')}>Edit settings</button>
                    <button className="btn" onClick={() => testConnection()} disabled={!isValid || testing}>{testing ? 'Testing…' : 'Re-test'}</button>
                    <button className="btn danger" onClick={clearImap}>Clear settings</button>
                  </div>
                </div>
              )}

              {/* CONFIGURE VIEW */}
              {imapView === 'configure' && (
                <>
                  <div className="grid">
                    {/* IMAP Host */}
                    <div className="field">
                      <label>IMAP Host</label>
                      <input type="text" placeholder="imap.yourmail.com" value={imap.host} onChange={(e) => update({ host: e.target.value })} />
                      <div className="hint">Usually imap.gmail.com, imap.outlook.com, etc.</div>
                    </div>
                    {/* Port */}
                    <div className="field">
                      <label>Port</label>
                      <input type="number" placeholder="993" value={imap.port} onChange={(e) => update({ port: e.target.value ? Number(e.target.value) : '' })} />
                      <div className="hint">993 (SSL/TLS) or 143 (STARTTLS/plain).</div>
                    </div>
                    {/* Security */}
                    <div className="field">
                      <label>Security</label>
                      <div className="segmented">
                        <button className={`seg ${imap.secure ? 'active' : ''}`} onClick={() => update({ secure: true })}>SSL/TLS</button>
                        <button className={`seg ${!imap.secure ? 'active' : ''}`} onClick={() => update({ secure: false })}>STARTTLS/None</button>
                      </div>
                    </div>
                    {/* Username */}
                    <div className="field full">
                      <label>Username</label>
                      <input type="text" placeholder="you@domain.com" value={imap.username} onChange={(e) => update({ username: e.target.value })} />
                    </div>
                    {/* Password */}
                    <div className="field full">
                      <label>Password / App Password</label>
                      <div className="password-wrap">
                        <input type={showPassword ? 'text' : 'password'} placeholder="App password recommended (e.g., Gmail App Password)" value={imap.password} onChange={(e) => update({ password: e.target.value })} />
                        <button className="icon-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                      <div className="hint">For Gmail, create an App Password if 2FA is enabled.</div>
                    </div>
                    {/* Mailbox */}
                    <div className="field full">
                      <label>Mailbox</label>
                      <input type="text" placeholder="INBOX" value={imap.mailbox} onChange={(e) => update({ mailbox: e.target.value })} />
                    </div>
                  </div>

                  {testResult && (
                    <div className={`test-banner ${testResult.ok ? 'ok' : 'err'}`} role="status">
                      {testResult.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {activeTab === 'general' && (
            <section className="card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <h2 className="card-title">General</h2>
                  <p className="card-subtitle">Account preferences coming soon.</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <h2 className="card-title">Security</h2>
                  <p className="card-subtitle">Security options coming soon.</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'daemon' && (
            <section className="card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <h2 className="card-title">Daemon Monitor</h2>
                  <p className="card-subtitle">Monitor health, subscribe to live events, and trigger debug actions.</p>
                </div>
                <div className="card-actions">
                  <button className="btn" onClick={pingDaemon} disabled={pinging}>{pinging ? 'Pinging…' : 'Ping /health'}</button>
                  <button className="btn" onClick={loadAppsSummary}>Load apps summary</button>
                  <button className="btn primary" onClick={quickRerun} disabled={pipelineBusy}>{pipelineBusy ? 'Re-running…' : 'Re-run pipeline'}</button>
                  <button className="btn ghost" onClick={() => setEvents([])}>Clear events</button>
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-item">
                  <span>HTTP Health</span>
                  <strong className={daemonHealth?.ok ? 'ok' : 'err'}>
                    {daemonHealth == null ? '—' : daemonHealth.ok ? 'OK' : 'Down'}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>WebSocket</span>
                  <strong>{wsConnected ? <span className="ok inline"><Wifi size={14} /> Connected</span> : <span className="err inline"><WifiOff size={14} /> Disconnected</span>}</strong>
                </div>
                <div className="summary-item">
                  <span>Last check</span>
                  <strong>{daemonHealth?.lastCheckedAt ? new Date(daemonHealth.lastCheckedAt).toLocaleString() : '—'}</strong>
                </div>
                <div className="summary-item">
                  <span>Event buffer</span>
                  <strong>{events.length} events</strong>
                </div>
              </div>

              {daemonHealth?.error && (
                <div className="test-banner err" role="status">
                  <Bug size={16} />
                  <span>{daemonHealth.error}</span>
                </div>
              )}

              <div className="daemon-grid">
                <div className="pane">
                  <div className="pane-header"><Terminal size={14} /> Live Events</div>
                  <div className="events-list" role="log" aria-live="polite">
                    {events.length === 0 && <div className="empty">No events yet. Actions will appear here.</div>}
                    {events.map((e, idx) => (
                      <div key={idx} className="event-row">
                        <div className="event-type">{e.type}</div>
                        <div className="event-time">{new Date(e.ts).toLocaleTimeString()}</div>
                        <pre className="event-json">{JSON.stringify(e.data ?? null, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pane">
                  <div className="pane-header"><Server size={14} /> Quick Info</div>
                  <ul className="quick-info">
                    <li><strong>Daemon URL:</strong> {DAEMON_ORIGIN}</li>
                    <li><strong>WS Path:</strong> /ws</li>
                    <li><strong>DB Path (repo):</strong> database/jjugg.db</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'features' && (
            <section className="feature-list-section">
              <div className="feature-list-header">
                <h2 className="feature-list-title">Feature Flags</h2>
                <p className="feature-list-subtitle">Toggle sections on or off. Changes are saved locally and apply immediately.</p>
                <button className="btn ghost" onClick={resetOverrides}>Reset to defaults</button>
              </div>
              <ul className="feature-list">
                {[
                  { flag: 'ENABLE_DASHBOARD', label: 'Dashboard' },
                  { flag: 'ENABLE_REMINDERS_SECTION', label: 'Reminders' },
                  { flag: 'ENABLE_INTERVIEWS_SECTION', label: 'Interviews' },
                  { flag: 'ENABLE_ANALYTICS', label: 'Analytics' },
                  { flag: 'ENABLE_GOALS_SECTION', label: 'Goals' },
                  { flag: 'ENABLE_TIMELINE_SECTION', label: 'Timeline' },
                  { flag: 'ENABLE_CALENDAR_VIEW', label: 'Calendar' },
                  { flag: 'ENABLE_PROFILE_IN_NAV', label: 'Show Profile' },
                  { flag: 'ENABLE_EMAILS_PAGE', label: 'Emails Page' },
                  { flag: 'ENABLE_DEV_DB_ADMIN', label: 'Dev DB Admin (internal)' },
                ].map(({ flag, label }) => {
                  const isOn = flags[flag as keyof FeatureFlags];
                  return (
                    <li key={flag} className="feature-list-item">
                      <span className="feature-label">{label}</span>
                      <button
                        className={`toggle-switch ${isOn ? 'on' : 'off'}`}
                        onClick={() => setFlag(flag as keyof FeatureFlags, !isOn)}
                        aria-label={`${isOn ? 'Disable' : 'Enable'} ${label}`}
                      >
                        <span className="toggle-track">
                          <span className="toggle-thumb" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {flags.ENABLE_DEV_DB_ADMIN && (
                <div className="note note-row">
                  <button className="btn" onClick={() => window.location.href = '/db-admin'}>Open Dev DB Admin</button>
                  <span className="text-caption">Explores your local SQLite database. Dev-only.</span>
                </div>
              )}
              <div className="note">
                <p className="text-caption">Flags persist in this browser only. Use for local experimentation.</p>
              </div>
            </section>
          )}
        </main>
      </div>

      <style jsx>{`
        /* Feature Flags List Styles */
        .feature-list-section { background: var(--surface); border-radius: 12px; padding: 2rem; margin-bottom: 2rem; }
        .feature-list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .feature-list-title { font-size: 1.5rem; font-weight: 600; margin: 0; }
        .feature-list-subtitle { font-size: 1rem; color: var(--muted); margin: 0 1rem 0 0; }
        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
        .feature-label { font-size: 1rem; font-weight: 500; }
        .toggle-switch { background: none; border: none; cursor: pointer; outline: none; padding: 0; margin-left: 1rem; }
        .toggle-track { display: inline-block; width: 40px; height: 22px; background: var(--border); border-radius: 11px; position: relative; transition: background 0.2s; }
        .toggle-switch.on .toggle-track { background: #10b981; }
        .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: #fff; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.08); transition: left 0.2s; }
        .toggle-switch.on .toggle-thumb { left: 21px; }
        /* Shell */
        .settings-shell { display: flex; flex-direction: column; gap: 16px; }
        .settings-hero { position: relative; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--surface); }
        .hero-bar { height: 6px; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%); }
        .hero-content { padding: 16px; }
        .hero-title { margin: 0; letter-spacing: var(--letter-spacing-tight); }
        .hero-subtitle { margin: 6px 0 0 0; color: var(--text-secondary); }

        /* Layout */
        .settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; }
        .settings-nav { position: sticky; top: 64px; align-self: start; display: flex; flex-direction: column; gap: 8px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: background var(--duration-150) var(--ease-out), border-color var(--duration-150) var(--ease-out), color var(--duration-150) var(--ease-out); }
        .nav-item:hover { background: var(--hover-bg); color: var(--text-primary); }
        .nav-item.active { background: color-mix(in srgb, var(--color-primary) 12%, transparent); border-color: color-mix(in srgb, var(--color-primary) 35%, transparent); color: var(--text-primary); }

        .settings-panel { display: flex; flex-direction: column; gap: 16px; }

        /* Cards & content */
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .card-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .card-subtitle { margin: 4px 0 0 0; color: var(--text-secondary); font-size: 13px; }
        .card-actions { display: flex; gap: 8px; }

        /* Feature cards - expressive and fun */
        .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .feature-card { position: relative; display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 16px; border: 2px solid var(--border); background: var(--surface); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--feature-color, #6b7280); opacity: 0.3; transition: opacity 0.3s ease; }
        .feature-card.enabled { border-color: var(--feature-color, #6b7280); background: color-mix(in srgb, var(--feature-color, #6b7280) 8%, var(--surface)); }
        .feature-card.enabled::before { opacity: 1; }
        .feature-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }

        .feature-icon { font-size: 32px; line-height: 1; filter: grayscale(1); transition: filter 0.3s ease; }
        .feature-card.enabled .feature-icon { filter: grayscale(0); }

        .feature-content { flex: 1; min-width: 0; }
        .feature-title { margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
        .feature-status { margin: 4px 0 0; font-size: 13px; font-weight: 500; color: var(--text-secondary); }
        .feature-card.enabled .feature-status { color: var(--feature-color, var(--color-primary)); }

        .power-toggle { position: relative; width: 40px; height: 40px; border: none; background: none; cursor: pointer; padding: 0; }
        .power-ring { position: relative; width: 100%; height: 100%; border: 3px solid var(--border); border-radius: 50%; background: var(--surface); transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); display: flex; align-items: center; justify-content: center; }
        .power-toggle:hover .power-ring { transform: scale(1.1); }
        .power-toggle.on .power-ring { border-color: var(--feature-color, var(--color-primary)); background: var(--feature-color, var(--color-primary)); }

        .power-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-tertiary); transition: all 0.3s ease; }
        .power-toggle.on .power-dot { background: white; transform: scale(1.5); box-shadow: 0 0 12px rgba(255,255,255,0.6); }

        .note { margin-top: 16px; color: var(--text-tertiary); }
  .note-row { display: flex; gap: 8px; align-items: center; }
  .mt-12 { margin-top: 12px; }

  /* Email preview styles */
  .email-preview { display: flex; flex-direction: column; gap: 6px; }
  .email-preview .preview-subject { font-weight: 700; color: var(--text-primary); }
  .email-preview .preview-meta { font-size: 12px; color: var(--text-tertiary); }
  .email-preview .preview-body { font-size: 13px; color: var(--text-secondary); white-space: pre-wrap; }

        /* Forms */
        .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px; }
        .field { display: flex; flex-direction: column; gap: 6px; grid-column: span 6; }
        .field.full { grid-column: span 12; }
        label { color: var(--text-secondary); font-size: 12px; font-weight: 600; }
        input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); color: var(--text-primary); }
        input::placeholder { color: var(--text-tertiary); }
        .hint { font-size: 11px; color: var(--text-tertiary); }

        .segmented { display: inline-flex; background: var(--hover-bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .seg { padding: 6px 10px; font-size: 12px; color: var(--text-secondary); border: none; background: transparent; cursor: pointer; }
        .seg.active { color: var(--text-primary); background: color-mix(in srgb, var(--surface) 92%, transparent); }

        .password-wrap { display: flex; align-items: center; gap: 8px; }
        .password-wrap input { flex: 1; }
        .icon-btn { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--border); background: var(--glass-card-bg, var(--surface)); color: var(--text-secondary); cursor: pointer; }
        .icon-btn:hover { background: var(--hover-bg); }

        /* Buttons */
        .btn { padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--glass-card-bg, var(--surface)); color: var(--text-primary); font-weight: 600; cursor: pointer; }
        .btn.primary { background: color-mix(in srgb, rgba(var(--color-primary-rgb), 1) 12%, transparent); color: var(--color-primary); border-color: color-mix(in srgb, rgba(var(--color-primary-rgb), 1) 35%, transparent); }
        .btn.ghost { background: transparent; }
        .btn.danger { color: var(--error); border-color: color-mix(in srgb, var(--error) 35%, transparent); background: color-mix(in srgb, var(--error) 12%, transparent); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Status */
        .test-banner { margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--hover-bg); }
        .test-banner.ok { background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); border-color: color-mix(in srgb, var(--success) 35%, transparent); }
        .test-banner.err { background: color-mix(in srgb, var(--error) 12%, transparent); color: var(--error); border-color: color-mix(in srgb, var(--error) 35%, transparent); }

        .subtabs { display: flex; gap: 8px; margin: 4px 0 12px; }
        .subtab { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--glass-card-bg, var(--surface)); color: var(--text-secondary); font-weight: 600; cursor: pointer; }
        .subtab.active { color: var(--text-primary); border-color: color-mix(in srgb, var(--color-primary) 45%, var(--border)); background: var(--hover-bg); }

        .status-view { display: flex; flex-direction: column; gap: 12px; }
        .status-card { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 10px; }
        .status-card.connected { background: color-mix(in srgb, var(--success) 10%, transparent); border-color: color-mix(in srgb, var(--success) 35%, transparent); color: var(--success); }
        .status-card.configured { background: var(--hover-bg); }
        .status-card.not_configured { background: var(--hover-bg); }
        .status-text h3 { margin: 0; font-size: 15px; }
        .status-text p { margin: 2px 0 0 0; color: var(--text-secondary); }

        .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
        .summary-item { display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--glass-card-bg, var(--surface)); }
        .summary-item span { font-size: 11px; color: var(--text-tertiary); }
        .summary-item strong { font-size: 13px; color: var(--text-primary); }
        .summary-item strong.ok { color: var(--success); }
        .summary-item strong.err { color: var(--error); }
        .inline { display: inline-flex; align-items: center; gap: 6px; }

        .status-actions { display: flex; flex-wrap: wrap; gap: 8px; }

        /* Daemon */
        .daemon-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-top: 12px; }
        .pane { display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--glass-card-bg, var(--surface)); padding: 10px; }
        .pane-header { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-primary); }
        .events-list { max-height: 360px; overflow: auto; display: flex; flex-direction: column; gap: 8px; }
        .event-row { border: 1px solid var(--border); border-radius: 8px; padding: 8px; background: var(--surface); }
        .event-type { font-weight: 700; font-size: 12px; color: var(--text-secondary); }
        .event-time { font-size: 11px; color: var(--text-tertiary); margin-bottom: 6px; }
        .event-json { margin: 0; font-size: 12px; color: var(--text-primary); white-space: pre-wrap; }
        .quick-info { margin: 0; padding-left: 16px; color: var(--text-secondary); }

        /* Responsive */
        @media (max-width: 900px) {
          .settings-layout { grid-template-columns: 1fr; }
          .settings-nav { position: static; flex-direction: row; flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}

export default ProfileSettings;

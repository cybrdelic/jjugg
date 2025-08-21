import React, { useState } from 'react';
import {
    Mail, Eye, EyeOff, ExternalLink, Copy, Save, Trash2, ArrowLeft, ArrowRight,
    Settings, Server
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import '@/styles/theme.css';

// --- Types ---
interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    mailbox: string;
}

// --- UI Components ---
const FormField = ({ label, value, onChange, placeholder, type = 'text', hint, isPassword = false }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'password';
    hint?: string;
    isPassword?: boolean;
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="form-input-wrapper">
                <input
                    type={actualType}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="form-input"
                />
                {isPassword && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                )}
            </div>
            {hint && <div className="form-hint">{hint}</div>}
        </div>
    );
};

// --- Main Component ---
const ImapConfigPage: React.FC = () => {
    const [form, setForm] = useState<EmailConfig>({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        user: '',
        password: '',
        mailbox: 'INBOX'
    });
    const [status, setStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [latestEmail, setLatestEmail] = useState<any | null>(null);
    const [debugSteps, setDebugSteps] = useState<any[]>([]);
    React.useEffect(() => {
        fetch('/api/email-config')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.config) setForm(data.config);
            });
    }, []);
    const updateField = (field: keyof EmailConfig, value: string | number | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };
    const saveConfig = async () => {
        setIsLoading(true);
        setStatus(null);
        try {
            const response = await fetch('/api/email-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const result = await response.json();
            if (result.success) {
                setStatus('Saved to database ✅');
            } else {
                setStatus('Save failed ❌');
            }
        } catch {
            setStatus('Save failed ❌');
        }
        setIsLoading(false);
    };
    const clearConfig = async () => {
        setIsLoading(true);
        setStatus(null);
        try {
            const response = await fetch('/api/email-config', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.success) {
                setStatus('Cleared settings ✅');
                setForm({ host: '', port: 993, secure: true, user: '', password: '', mailbox: 'INBOX' });
            } else {
                setStatus('Clear failed ❌');
            }
        } catch {
            setStatus('Clear failed ❌');
        }
        setIsLoading(false);
    };
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
                setStatus('IMAP connection tested successfully · ' + new Date().toLocaleString());
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
        <AppLayout currentSection="dashboard-home">
            <div className="email-setup-page">
                <div className="email-setup-container">
                    <div className="email-setup-header">
                        <div className="header-left">
                            <div className="page-icon">📧</div>
                            <div>
                                <h1 className="page-title">IMAP Configuration</h1>
                                <p className="page-subtitle">Add your email settings to enable parsing of interview dates, contacts, and threads.</p>
                            </div>
                        </div>
                    </div>
                    <div className="email-setup-card">
                        <form className="form-section" onSubmit={e => { e.preventDefault(); testConnection(); }}>
                            <FormField
                                label="Host"
                                value={form.host}
                                onChange={v => updateField('host', v)}
                                placeholder="imap.gmail.com"
                            />
                            <FormField
                                label="Port"
                                value={form.port.toString()}
                                onChange={v => updateField('port', Number(v))}
                                placeholder="993"
                            />
                            <FormField
                                label="Security"
                                value={form.secure ? 'SSL/TLS' : 'STARTTLS/None'}
                                onChange={v => updateField('secure', v === 'SSL/TLS')}
                                placeholder="SSL/TLS"
                            />
                            <FormField
                                label="Username"
                                value={form.user}
                                onChange={v => updateField('user', v)}
                                placeholder="alexfigueroa.cybr@gmail.com"
                            />
                            <FormField
                                label="Password / App Password"
                                value={form.password}
                                onChange={v => updateField('password', v)}
                                placeholder="•••••••••••••••••••"
                                isPassword={true}
                                hint="For Gmail, create an App Password if 2FA is enabled."
                            />
                            <FormField
                                label="Mailbox"
                                value={form.mailbox}
                                onChange={v => updateField('mailbox', v)}
                                placeholder="INBOX"
                            />
                            <div className="step-actions">
                                <button className="btn btn-primary" type="button" onClick={saveConfig} disabled={isLoading}>
                                    Save
                                </button>
                                <button className="btn btn-outline" type="button" onClick={testConnection} disabled={isLoading}>
                                    Test Connection
                                </button>
                                <button className="btn btn-outline" type="button" onClick={clearConfig} disabled={isLoading}>
                                    Clear settings
                                </button>
                            </div>
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
                            <div style={{ marginTop: '1rem' }}>
                                <button className="btn btn-link" type="button" onClick={() => window.open('https://support.google.com/mail/answer/185833?hl=en', '_blank')}>
                                    Learn more
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ImapConfigPage;

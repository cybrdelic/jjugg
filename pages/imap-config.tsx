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
    const updateField = (field: keyof EmailConfig, value: string | number | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };
    const testConnection = async () => {
        setIsLoading(true);
        setStatus(null);
        try {
            const response = await fetch('/api/test-imap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const result = await response.json();
            if (result.success) {
                setStatus('Connection test successful ✅');
            } else {
                setStatus('Test failed: ' + (result.message || 'Check credentials') + ' ❌');
            }
        } catch (error: any) {
            setStatus('Test failed: ' + (error.message || 'Unknown error') + ' ❌');
        }
        setIsLoading(false);
    };
    const saveConfig = () => {
        try {
            localStorage.setItem('jjugg:email', JSON.stringify(form));
            setStatus('Saved to localStorage ✅');
        } catch {
            setStatus('Save failed ❌');
        }
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
                                label="IMAP Host"
                                value={form.host}
                                onChange={v => updateField('host', v)}
                                placeholder="imap.gmail.com"
                                hint="Usually imap.gmail.com, imap.outlook.com, etc."
                            />
                            <FormField
                                label="Port"
                                value={form.port.toString()}
                                onChange={v => updateField('port', Number(v))}
                                placeholder="993"
                                hint="993 (SSL/TLS) or 143 (STARTTLS/plain)."
                            />
                            <FormField
                                label="Security"
                                value={form.secure ? 'SSL/TLS' : 'STARTTLS/None'}
                                onChange={v => updateField('secure', v === 'SSL/TLS')}
                                placeholder="SSL/TLS"
                                hint="SSL/TLS or STARTTLS/None"
                            />
                            <FormField
                                label="Username"
                                value={form.user}
                                onChange={v => updateField('user', v)}
                                placeholder="alexfigueroa.cybr@gmail.com"
                            />
                            <div className="form-group">
                                <div className="form-label-with-help">
                                    <label className="form-label">Password / App Password</label>
                                    <button
                                        type="button"
                                        className="help-link"
                                        onClick={e => {
                                            e.preventDefault();
                                            alert('Gmail App Password: Enable IMAP in Gmail settings, turn on 2-Step Verification, then create an App Password for Mail. Paste the 16-character password here.');
                                        }}
                                    >
                                        Learn more
                                    </button>
                                </div>
                                <FormField
                                    label=""
                                    value={form.password}
                                    onChange={v => updateField('password', v)}
                                    placeholder="•••••••••••••••••••"
                                    isPassword={true}
                                    hint="For Gmail, create an App Password if 2FA is enabled."
                                />
                            </div>
                            <FormField
                                label="Mailbox"
                                value={form.mailbox}
                                onChange={v => updateField('mailbox', v)}
                                placeholder="INBOX"
                            />
                            <div className="form-hint">
                                Remove spaces in the app password. If you keep them, quote the value in <code>.env</code>.
                            </div>
                            <div className="step-actions">
                                <button className="btn btn-primary" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Testing...' : 'Test Connection'}
                                </button>
                                <button className="btn btn-outline" type="button" onClick={saveConfig}>
                                    Save
                                </button>
                            </div>
                            {status && (
                                <div className={`test-result ${status.includes('✅') ? 'success' : 'error'}`}>{status}</div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ImapConfigPage;

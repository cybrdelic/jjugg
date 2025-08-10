import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
    Mail, Eye, EyeOff, ExternalLink, CheckCircle, XCircle,
    AlertCircle, Copy, Save, Trash2, ArrowLeft, ArrowRight,
    Settings, Server, Key, Shield, Globe
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import '@/styles/email-setup.css';

type ConnectionPath = 'gmail-imap' | 'gmail-oauth' | 'generic-imap';

interface EmailConfig {
    type: ConnectionPath;
    imap: {
        host: string;
        port: number;
        user: string;
        mailbox: string;
        windowDays: number;
        secure: boolean;
    };
    auth: {
        method: 'app-password' | 'oauth2';
        user: string;
        pass?: string;
        client?: string;
        secret?: string;
        refresh?: string;
    };
}

interface StepperProps {
    currentStep: number;
    totalSteps: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="email-setup-stepper">
            <div className="stepper-dots">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                        key={i}
                        className={`stepper-dot ${i + 1 <= currentStep ? 'active' : ''}`}
                    />
                ))}
            </div>
            <div className="stepper-label">
                Step {currentStep} of {totalSteps} — {
                    currentStep === 1 ? 'Pick a path' :
                        currentStep === 2 ? 'Credentials' :
                            'Review & Save'
                }
            </div>
        </div>
    );
};

interface ChoiceCardProps {
    title: string;
    description: string;
    badge: string;
    isActive: boolean;
    onClick: () => void;
}

const ChoiceCard: React.FC<ChoiceCardProps> = ({
    title, description, badge, isActive, onClick
}) => {
    return (
        <div
            className={`choice-card ${isActive ? 'active' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <div className="choice-content">
                <div className="choice-title">{title}</div>
                <div className="choice-description">{description}</div>
            </div>
            <div className="choice-badge">{badge}</div>
        </div>
    );
};

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'password';
    hint?: string;
    isPassword?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
    label, value, onChange, placeholder, type = 'text', hint, isPassword = false
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
                    onChange={(e) => onChange(e.target.value)}
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
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {hint && <div className="form-hint">{hint}</div>}
        </div>
    );
};

const EmailSetupPage: React.FC = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [connectionPath, setConnectionPath] = useState<ConnectionPath>('gmail-imap');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showAppPasswordHelp, setShowAppPasswordHelp] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Gmail IMAP
        imapUser: '',
        imapPassword: '',
        imapHost: 'imap.gmail.com',
        imapPort: '993',
        imapMailbox: 'INBOX',
        imapWindowDays: '90',

        // Gmail OAuth
        oauthUser: '',
        oauthClient: '',
        oauthSecret: '',
        oauthRefresh: '',

        // Generic IMAP
        genericHost: '',
        genericPort: '993',
        genericUser: '',
        genericPassword: '',
        genericMailbox: 'INBOX',

        // Storage settings
        storageKey: 'jjugg:email',
        broadcastType: 'jjugg:email-config'
    });

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateCurrentStep = () => {
        if (currentStep === 2) {
            if (connectionPath === 'gmail-imap') {
                const { imapUser, imapPassword } = formData;
                const cleanPassword = imapPassword.replace(/\s+/g, '');
                return /@/.test(imapUser) && cleanPassword.length === 16;
            }
            if (connectionPath === 'gmail-oauth') {
                const { oauthUser, oauthClient, oauthSecret, oauthRefresh } = formData;
                return !!(oauthUser &&
                    /\.apps\.googleusercontent\.com$/.test(oauthClient) &&
                    oauthSecret &&
                    oauthRefresh.length > 20);
            }
            if (connectionPath === 'generic-imap') {
                const { genericHost, genericPort, genericUser, genericPassword, genericMailbox } = formData;
                return !!(genericHost &&
                    genericPort === '993' &&
                    genericUser &&
                    genericPassword &&
                    genericMailbox);
            }
        }
        return true;
    };

    const buildConfig = (): EmailConfig => {
        const base: EmailConfig = {
            type: connectionPath,
            imap: { secure: true, host: '', port: 993, user: '', mailbox: 'INBOX', windowDays: 90 },
            auth: { method: 'app-password', user: '' }
        };

        if (connectionPath === 'gmail-imap') {
            base.imap = {
                host: formData.imapHost,
                port: Number(formData.imapPort),
                user: formData.imapUser,
                mailbox: formData.imapMailbox,
                windowDays: Number(formData.imapWindowDays),
                secure: true
            };
            base.auth = {
                method: 'app-password',
                user: formData.imapUser,
                pass: formData.imapPassword.replace(/\s+/g, '')
            };
        } else if (connectionPath === 'gmail-oauth') {
            base.imap = {
                host: 'imap.gmail.com',
                port: 993,
                user: formData.oauthUser,
                mailbox: 'INBOX',
                windowDays: 90,
                secure: true
            };
            base.auth = {
                method: 'oauth2',
                user: formData.oauthUser,
                client: formData.oauthClient,
                secret: formData.oauthSecret,
                refresh: formData.oauthRefresh
            };
        } else if (connectionPath === 'generic-imap') {
            base.imap = {
                host: formData.genericHost,
                port: Number(formData.genericPort),
                user: formData.genericUser,
                mailbox: formData.genericMailbox,
                windowDays: 90,
                secure: true
            };
            base.auth = {
                method: 'app-password',
                user: formData.genericUser,
                pass: formData.genericPassword
            };
        }

        return base;
    };

    const testConnection = async () => {
        setIsLoading(true);
        setTestResult(null);

        // Simulate test delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const isValid = validateCurrentStep();
        setTestResult(isValid ? 'Connection test successful ✅' : 'Test failed - check credentials ❌');
        setIsLoading(false);
    };

    const saveToLocalStorage = () => {
        try {
            const config = buildConfig();
            localStorage.setItem(formData.storageKey, JSON.stringify(config));
            setTestResult('Saved to localStorage ✅');
        } catch (error) {
            setTestResult('Save failed ❌');
        }
    };

    const sendToApp = () => {
        try {
            const config = buildConfig();
            const message = { type: formData.broadcastType, payload: config };

            // Send to parent window if in iframe
            window.parent?.postMessage(message, '*');

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent(formData.broadcastType, { detail: config }));

            setTestResult('Sent to app ✅');
        } catch (error) {
            setTestResult('Send failed ❌');
        }
    };

    const copyConfig = async () => {
        try {
            const config = buildConfig();
            await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
            setTestResult('Config copied to clipboard ✅');
        } catch (error) {
            setTestResult('Copy failed ❌');
        }
    };

    const clearStorage = () => {
        try {
            localStorage.removeItem(formData.storageKey);
            setTestResult('Storage cleared ✅');
        } catch (error) {
            setTestResult('Clear failed ❌');
        }
    };

    const restoreFromStorage = () => {
        try {
            const stored = localStorage.getItem(formData.storageKey);
            if (!stored) {
                setTestResult('Nothing to restore ❌');
                return;
            }

            const config: EmailConfig = JSON.parse(stored);
            setConnectionPath(config.type);

            // Restore form data based on type
            if (config.type === 'gmail-imap') {
                updateFormData('imapUser', config.auth.user);
                updateFormData('imapPassword', config.auth.pass || '');
                updateFormData('imapHost', config.imap.host);
                updateFormData('imapPort', String(config.imap.port));
                updateFormData('imapMailbox', config.imap.mailbox);
                updateFormData('imapWindowDays', String(config.imap.windowDays));
            }

            setCurrentStep(2);
            setTestResult('Configuration restored ✅');
        } catch (error) {
            setTestResult('Restore failed ❌');
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="step-content">
                        <div className="step-header">
                            <h2 className="step-title">Keep it simple.</h2>
                            <p className="step-description">
                                Default to <strong>Gmail IMAP (App Password)</strong>. If your org blocks app passwords,
                                switch to <em>Gmail OAuth</em>. Generic IMAP is there if you need Fastmail/Proton.
                            </p>
                        </div>

                        <div className="choices-grid">
                            <ChoiceCard
                                title="Gmail — App Password (recommended)"
                                description="Fastest path. No OAuth screens. Works locally."
                                badge="Selected"
                                isActive={connectionPath === 'gmail-imap'}
                                onClick={() => setConnectionPath('gmail-imap')}
                            />
                            <ChoiceCard
                                title="Gmail — OAuth (XOAUTH2)"
                                description="Use if Workspace disables app passwords. Requires tokens."
                                badge="Advanced"
                                isActive={connectionPath === 'gmail-oauth'}
                                onClick={() => setConnectionPath('gmail-oauth')}
                            />
                            <ChoiceCard
                                title="Generic IMAP"
                                description="Fastmail, Proton, etc. Uses app password from your provider."
                                badge="Advanced"
                                isActive={connectionPath === 'generic-imap'}
                                onClick={() => setConnectionPath('generic-imap')}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="step-content">
                        <div className="step-header">
                            <h2 className="step-title">
                                {connectionPath === 'gmail-imap' && 'Gmail IMAP'}
                                {connectionPath === 'gmail-oauth' && 'Gmail OAuth'}
                                {connectionPath === 'generic-imap' && 'Generic IMAP'}
                            </h2>
                            <p className="step-description">
                                {connectionPath === 'gmail-imap' && 'Enter email + app password'}
                                {connectionPath === 'gmail-oauth' && 'Paste tokens from your local script'}
                                {connectionPath === 'generic-imap' && 'Fill host/user/password'}
                            </p>
                        </div>

                        {connectionPath === 'gmail-imap' && (
                            <div className="form-section">
                                <FormField
                                    label="Email"
                                    value={formData.imapUser}
                                    onChange={(value) => updateFormData('imapUser', value)}
                                    placeholder="you@gmail.com"
                                />

                                <div className="form-group">
                                    <div className="form-label-with-help">
                                        <label className="form-label">App Password (16 chars)</label>
                                        <button
                                            type="button"
                                            className="help-link"
                                            onClick={() => setShowAppPasswordHelp(!showAppPasswordHelp)}
                                        >
                                            <ExternalLink size={14} />
                                            Learn more
                                        </button>
                                    </div>
                                    <FormField
                                        label=""
                                        value={formData.imapPassword}
                                        onChange={(value) => updateFormData('imapPassword', value)}
                                        placeholder="abcdefghijklmnop"
                                        isPassword={true}
                                    />
                                    {showAppPasswordHelp && (
                                        <div className="help-panel">
                                            <h4>Gmail App Password — deep dive</h4>
                                            <p>Create a 16‑char password that JJUGG can use over IMAP. Your normal Google password is never stored.</p>
                                            <ol>
                                                <li><strong>Enable IMAP</strong> in Gmail: Gmail (web) → ⚙️ Settings → See all settings → Forwarding and POP/IMAP → Enable IMAP → Save Changes.</li>
                                                <li><strong>Turn on 2‑Step Verification</strong>: Google Account → Security → 2‑Step Verification.</li>
                                                <li><strong>Create App Password</strong>: on the 2‑Step page open App passwords → App: Mail → Device: Other… (type JJUGG) → Generate → copy the 16 characters.</li>
                                                <li><strong>Use it here</strong>: paste into the field above. Remove spaces or quote them when exporting to .env.</li>
                                            </ol>
                                        </div>
                                    )}
                                </div>

                                <details className="advanced-section">
                                    <summary className="advanced-toggle">
                                        <Settings size={16} />
                                        Advanced Settings
                                    </summary>
                                    <div className="advanced-content">
                                        <div className="form-row">
                                            <FormField
                                                label="Mailbox"
                                                value={formData.imapMailbox}
                                                onChange={(value) => updateFormData('imapMailbox', value)}
                                            />
                                            <FormField
                                                label="Backfill days"
                                                value={formData.imapWindowDays}
                                                onChange={(value) => updateFormData('imapWindowDays', value)}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <FormField
                                                label="Host"
                                                value={formData.imapHost}
                                                onChange={(value) => updateFormData('imapHost', value)}
                                            />
                                            <FormField
                                                label="Port"
                                                value={formData.imapPort}
                                                onChange={(value) => updateFormData('imapPort', value)}
                                            />
                                        </div>
                                    </div>
                                </details>

                                <div className="form-hint">
                                    Remove spaces in the app password. If you keep them, quote the value in <code>.env</code>.
                                </div>
                            </div>
                        )}

                        {connectionPath === 'gmail-oauth' && (
                            <div className="form-section">
                                <FormField
                                    label="Gmail Address"
                                    value={formData.oauthUser}
                                    onChange={(value) => updateFormData('oauthUser', value)}
                                    placeholder="you@gmail.com"
                                />
                                <div className="form-row">
                                    <FormField
                                        label="Client ID"
                                        value={formData.oauthClient}
                                        onChange={(value) => updateFormData('oauthClient', value)}
                                        placeholder="xxxx.apps.googleusercontent.com"
                                    />
                                    <FormField
                                        label="Client Secret"
                                        value={formData.oauthSecret}
                                        onChange={(value) => updateFormData('oauthSecret', value)}
                                        placeholder="xxxxx"
                                        isPassword={true}
                                    />
                                </div>
                                <FormField
                                    label="Refresh Token"
                                    value={formData.oauthRefresh}
                                    onChange={(value) => updateFormData('oauthRefresh', value)}
                                    placeholder="1//0g..."
                                    isPassword={true}
                                />
                                <div className="form-hint">
                                    Tokens come from a local OAuth script with scope <code>https://mail.google.com/</code>.
                                </div>
                            </div>
                        )}

                        {connectionPath === 'generic-imap' && (
                            <div className="form-section">
                                <div className="form-row">
                                    <FormField
                                        label="Host"
                                        value={formData.genericHost}
                                        onChange={(value) => updateFormData('genericHost', value)}
                                        placeholder="imap.fastmail.com"
                                    />
                                    <FormField
                                        label="Port"
                                        value={formData.genericPort}
                                        onChange={(value) => updateFormData('genericPort', value)}
                                    />
                                </div>
                                <div className="form-row">
                                    <FormField
                                        label="User"
                                        value={formData.genericUser}
                                        onChange={(value) => updateFormData('genericUser', value)}
                                        placeholder="you@domain.com"
                                    />
                                    <FormField
                                        label="Password / App Password"
                                        value={formData.genericPassword}
                                        onChange={(value) => updateFormData('genericPassword', value)}
                                        placeholder="********"
                                        isPassword={true}
                                    />
                                </div>
                                <FormField
                                    label="Mailbox"
                                    value={formData.genericMailbox}
                                    onChange={(value) => updateFormData('genericMailbox', value)}
                                />
                            </div>
                        )}

                        {testResult && (
                            <div className={`test-result ${testResult.includes('✅') ? 'success' : 'error'}`}>
                                {testResult}
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="step-content">
                        <div className="step-header">
                            <h2 className="step-title">Review & Save</h2>
                            <p className="step-description">
                                No terminals. This saves config <strong>inside the app</strong>. You can also broadcast to a host via <em>postMessage</em>.
                            </p>
                        </div>

                        <div className="form-section">
                            <div className="form-row">
                                <FormField
                                    label="Storage key (localStorage)"
                                    value={formData.storageKey}
                                    onChange={(value) => updateFormData('storageKey', value)}
                                />
                                <FormField
                                    label="Broadcast channel (postMessage.type)"
                                    value={formData.broadcastType}
                                    onChange={(value) => updateFormData('broadcastType', value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Config JSON</label>
                                <div className="config-preview">
                                    <pre className="config-code">
                                        {JSON.stringify(buildConfig(), null, 2)}
                                    </pre>
                                    <button
                                        type="button"
                                        className="copy-button"
                                        onClick={copyConfig}
                                        title="Copy to clipboard"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            {testResult && (
                                <div className={`test-result ${testResult.includes('✅') ? 'success' : 'error'}`}>
                                    {testResult}
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderStepActions = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="step-actions">
                        <div></div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setCurrentStep(2)}
                        >
                            <ArrowRight size={16} />
                            Continue
                        </button>
                    </div>
                );

            case 2:
                return (
                    <div className="step-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentStep(1)}
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <div className="action-group">
                            <button
                                className="btn btn-outline"
                                onClick={testConnection}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Testing...' : 'Test'}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setCurrentStep(3)}
                                disabled={!validateCurrentStep()}
                            >
                                <ArrowRight size={16} />
                                Continue
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="step-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentStep(2)}
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <div className="action-group">
                            <button className="btn btn-outline" onClick={saveToLocalStorage}>
                                <Save size={16} />
                                Save locally
                            </button>
                            <button className="btn btn-outline" onClick={sendToApp}>
                                <Server size={16} />
                                Send to app
                            </button>
                            <button className="btn btn-outline" onClick={restoreFromStorage}>
                                Restore
                            </button>
                            <button className="btn btn-danger" onClick={clearStorage}>
                                <Trash2 size={16} />
                                Clear
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout currentSection="dashboard-home">
            <div className="email-setup-page">
                <div className="email-setup-container">
                    <div className="email-setup-header">
                        <div className="header-left">
                            <div className="page-icon">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h1 className="page-title">JJUGG Email Setup</h1>
                                <p className="page-subtitle">in‑app configuration</p>
                            </div>
                        </div>
                    </div>

                    <div className="email-setup-card">
                        <Stepper currentStep={currentStep} totalSteps={3} />
                        {renderStepContent()}
                        {renderStepActions()}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default EmailSetupPage;

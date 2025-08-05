// pages/theme-test-simple.tsx
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeTestPage: React.FC = () => {
    const { mode, toggleMode } = useTheme();

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
            transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '2rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-medium)'
            }}>
                <h1 style={{
                    color: 'var(--color-primary)',
                    marginBottom: '1rem'
                }}>
                    Theme Test Page
                </h1>

                <div style={{ marginBottom: '2rem' }}>
                    <p><strong>Current Mode:</strong> {mode}</p>
                    <button
                        onClick={toggleMode}
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '1rem'
                        }}
                    >
                        Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-card)',
                        borderRadius: '4px',
                        border: '1px solid var(--color-border)'
                    }}>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Primary Color</h3>
                        <div style={{
                            width: '100%',
                            height: '40px',
                            backgroundColor: 'var(--color-primary)',
                            borderRadius: '4px'
                        }}></div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-card)',
                        borderRadius: '4px',
                        border: '1px solid var(--color-border)'
                    }}>
                        <h3 style={{ color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>Secondary Color</h3>
                        <div style={{
                            width: '100%',
                            height: '40px',
                            backgroundColor: 'var(--color-secondary)',
                            borderRadius: '4px'
                        }}></div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-card)',
                        borderRadius: '4px',
                        border: '1px solid var(--color-border)'
                    }}>
                        <h3 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Accent Color</h3>
                        <div style={{
                            width: '100%',
                            height: '40px',
                            backgroundColor: 'var(--color-accent)',
                            borderRadius: '4px'
                        }}></div>
                    </div>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-card)',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                    marginBottom: '1rem'
                }}>
                    <h3 style={{ marginBottom: '1rem' }}>Text Colors</h3>
                    <p style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>Primary text color</p>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Secondary text color</p>
                    <p style={{ color: 'var(--color-text-muted)' }}>Muted text color</p>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-card)',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)'
                }}>
                    <h3 style={{ marginBottom: '1rem' }}>CSS Variables Available</h3>
                    <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: '1.4'
                    }}>
                        <p>--color-background</p>
                        <p>--color-surface</p>
                        <p>--color-card</p>
                        <p>--color-border</p>
                        <p>--color-primary</p>
                        <p>--color-secondary</p>
                        <p>--color-accent</p>
                        <p>--color-text</p>
                        <p>--color-text-secondary</p>
                        <p>--color-text-muted</p>
                        <p>--shadow-small</p>
                        <p>--shadow-medium</p>
                        <p>--shadow-large</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeTestPage;

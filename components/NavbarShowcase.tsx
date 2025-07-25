'use client';

import React from 'react';
import ModernNavbar from './ModernNavbar';
import {
    Home, Briefcase, Target, Calendar, FileText, Clock
} from 'lucide-react';
import { SectionKey, NavItemType } from '@/types';

export default function NavbarShowcase() {
    const [currentSection, setCurrentSection] = React.useState<SectionKey>('dashboard-home');

    const navItems: NavItemType[] = [
        { id: 'dashboard-home', key: 'dashboard-home', label: 'Dashboard', icon: <Home size={18} />, color: '#667eea' },
        { id: 'applications-section', key: 'applications-section', label: 'Applications', icon: <Briefcase size={18} />, color: '#667eea', badge: { count: 3 } },
        { id: 'goals-section', key: 'goals-section', label: 'Goals', icon: <Target size={18} />, color: '#667eea' },
        { id: 'calendar-section', key: 'calendar-section', label: 'Calendar', icon: <Calendar size={18} />, color: '#667eea', badge: { count: 1 } },
        { id: 'profile-artifacts-section', key: 'profile-artifacts-section', label: 'Profile', icon: <FileText size={18} />, color: '#667eea' },
        { id: 'reminders-section', key: 'reminders-section', label: 'Reminders', icon: <Clock size={18} />, color: '#667eea', badge: { count: 2 } },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <ModernNavbar
                items={navItems}
                currentSection={currentSection}
                setCurrentSection={setCurrentSection}
                userName="John Doe"
            />

            <div style={{ paddingTop: '80px', padding: '80px 20px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1>New Navbar Design</h1>
                    <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px' }}>
                        <h2>Design Improvements:</h2>
                        <ul style={{ lineHeight: '2' }}>
                            <li>✨ <strong>Cleaner Layout:</strong> Simplified structure with better visual hierarchy</li>
                            <li>🎯 <strong>Focused Navigation:</strong> Primary navigation is now more prominent and accessible</li>
                            <li>🔍 <strong>Improved Search:</strong> Cleaner search bar with keyboard shortcut indicator</li>
                            <li>📱 <strong>Better Mobile Experience:</strong> Responsive design with dedicated mobile menu</li>
                            <li>🎨 <strong>Consistent Styling:</strong> Uniform spacing, sizing, and hover effects</li>
                            <li>🌓 <strong>Dark Mode Support:</strong> Seamless theme switching with proper contrast</li>
                            <li>🔔 <strong>Simplified Actions:</strong> Reduced clutter with essential actions only</li>
                            <li>👤 <strong>Cleaner Profile Menu:</strong> Minimalist dropdown with clear options</li>
                        </ul>
                    </div>

                    <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px' }}>
                        <h2>Key Changes:</h2>
                        <ol style={{ lineHeight: '2' }}>
                            <li>Removed redundant section indicator below navbar</li>
                            <li>Consolidated navigation into a single row</li>
                            <li>Simplified color scheme with subtle accents</li>
                            <li>Reduced visual noise from excessive borders and shadows</li>
                            <li>Made interactive elements more obvious with clear hover states</li>
                            <li>Improved spacing and alignment throughout</li>
                            <li>Better typography hierarchy</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}

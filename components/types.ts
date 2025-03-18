import { JSX } from "react";

import { LucideIcon } from 'lucide-react';

export type SectionKey =
    | 'dashboard-home'
    | 'applications-section'
    | 'reminders-section'
    | 'analytics-section'
    | 'interviews-section'
    | 'profile-artifacts-section'
    | 'goals-section'
    | 'timeline-section';

export interface NavItem {
    key: SectionKey;
    label: string;
    icon: LucideIcon;
    description?: string;
    badge?: number;
    badgeColor?: string;
}

export interface NavItemType {
    id: SectionKey;
    label: string;
    icon: JSX.Element;
    color: string;
    description?: string; // Added description field for subtitles/descriptions
    badge?: { count: number } | { text: string };
    aiGeneratedContent?: boolean; // Flag for AI-generated content
    metadata?: {
        priority?: 'low' | 'medium' | 'high'; // Optional priority marker
        status?: 'pending' | 'in-progress' | 'completed'; // Optional status marker
        timestamp?: string; // Optional timestamp
        tags?: string[]; // Optional tags
    };
}

export interface SidebarSectionType {
    id: string;
    title: string;
    items: NavItemType[];
    isExpandable?: boolean; // Whether this section can be expanded/collapsed
    isAiGenerated?: boolean; // Whether this section is AI-generated
    icon?: JSX.Element; // Optional section icon
}

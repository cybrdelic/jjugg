'use client';
import { JSX, useState } from 'react';
import GlassSidebar from '../components/GlassSidebar'; // Adjust path as needed
import DashboardHome from '../components/sections/DashboardHome'; // Adjust path as needed
import Applications from '../components/sections/Applications'; // Adjust path as needed
import Reminders from '../components/sections/Reminders'; // Adjust path as needed
import Interviews from '../components/sections/Interviews'; // Adjust path as needed
import ProfileArtifacts from '../components/sections/ProfileArtifacts'; // Adjust path as needed
import Goals from '../components/sections/Goals'; // Adjust path as needed
import Timeline from '../components/sections/Timeline'; // Adjust path as needed

// Define the SectionKey type for section identifiers
type SectionKey =
  | 'dashboard-home'
  | 'applications-section'
  | 'reminders-section'
  | 'interviews-section'
  | 'profile-artifacts-section'
  | 'goals-section'
  | 'timeline-section';

// Explicitly type the sections object
const sections: Record<SectionKey, () => JSX.Element> = {
  'dashboard-home': () => <DashboardHome />,
  'applications-section': () => <Applications />,
  'reminders-section': () => <Reminders />,
  'interviews-section': () => <Interviews />,
  'profile-artifacts-section': () => <ProfileArtifacts />,
  'goals-section': () => <Goals />,
  'timeline-section': () => <Timeline />,
};

export default function Home() {
  const [currentSection, setCurrentSection] = useState<SectionKey>('dashboard-home');

  return (
    <div className="flex h-screen">
      <GlassSidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <main id="content-area" className="flex-1 p-8 transition-all duration-300">
        {sections[currentSection] ? sections[currentSection]() : <div>Section not found</div>}
      </main>
    </div>
  );
}

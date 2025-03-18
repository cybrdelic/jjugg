# JJUGG Job Application Tracker

A sleek, modern job application dashboard built with Next.js and Tailwind CSS, featuring a customizable glass-style UI with animated components and a comprehensive theming system.

![JJUGG Dashboard](https://i.imgur.com/TfzrxZW.png)

## Project Overview

JJUGG is a sophisticated job application tracking system designed to help job seekers organize and monitor their job search process. The application features:

- Beautiful glass-style UI with customizable themes
- Interactive dashboard with application statistics
- Application management system
- Reminders for upcoming interviews and tasks
- Visual timeline of application activities
- Goal tracking for job search objectives
- Responsive design that works on mobile and desktop devices

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (v15.2.2)
- **UI**: [React](https://reactjs.org) (v19.0.0)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (v3.2.7)
- **Icons**: 
  - [Hero Icons](https://heroicons.com/) 
  - [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
```bash
git clone [your-repository-url]
cd jjugg-test
```

2. Install dependencies
```bash
npm install
# or
yarn
# or
pnpm install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features

### Interactive Dashboard

The dashboard provides a quick overview of your job search:
- Application statistics (total applications, interviews scheduled, success rate)
- Recent activity feed
- Upcoming events calendar
- Monthly goals progress

### Glass UI Components

The app utilizes a modern "glassmorphism" design approach with:
- Frosted glass effect sidebar with intuitive navigation
- Glass-style cards with hover effects
- Subtle animations and transitions

### Comprehensive Theming System

The app includes a flexible theming system with:
- Light and dark mode support
- 9 predefined themes (Default, Minimalist, Cyberpunk, Premium, etc.)
- Customizable accent colors
- Font family options
- Animation intensity settings
- Border radius adjustments
- Glass effect intensity controls

### Responsive Design

The UI adapts intelligently to different screen sizes:
- Desktop: Multi-column layout with expanded sidebar
- Tablet: Optimized card layout with collapsible sidebar
- Mobile: Single column layout with hidden sidebar (accessible via menu button)

## Architecture

### Directory Structure

```
jjugg-test/
├── components/
│   ├── CardHeader.tsx
│   ├── GlassSidebar.tsx
│   ├── NavItem.tsx
│   ├── NavItemComponent.tsx
│   ├── ResizeHandle.tsx
│   ├── SidebarSection.tsx
│   ├── ThemeSwitcher.tsx
│   ├── sections/
│   │   ├── Applications.tsx
│   │   ├── DashboardHome.tsx
│   │   ├── Goals.tsx
│   │   ├── Interviews.tsx
│   │   ├── ProfileArtifacts.tsx
│   │   ├── Reminders.tsx
│   │   └── Timeline.tsx
│   └── types.ts
├── contexts/
│   └── ThemeContext.tsx
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── api/
│   │   └── hello.ts
│   └── index.tsx
├── public/
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── styles/
    └── globals.css
```

### Key Components

#### GlassSidebar

A responsive sidebar with glass effect that displays navigation items and handles responsive states.

```tsx
<GlassSidebar
  items={sidebarItems}
  currentSection={currentSection}
  setCurrentSection={setCurrentSection}
  width={width}
  isCollapsed={isCollapsed}
  onResize={handleResize}
  userName={userProfile.name}
  userAvatar={userProfile.avatar}
/>
```

#### NavItem

Represents a single navigation item in the sidebar with advanced hover effects, active state, and badge display.

```tsx
<NavItem
  item={item}
  isCollapsed={isCollapsed}
  isActive={currentSection === item.id}
  onClick={() => setCurrentSection(item.id)}
  onContextMenu={(e) => handleContextMenu(e, item)}
/>
```

#### ThemeSwitcher

A component that provides theme customization controls via dropdown menu.

```tsx
<ThemeSwitcher />
```

#### Section Components

Multiple section components that render different views based on the selected navigation item:
- `DashboardHome`: Main dashboard view with stats and activity
- `ApplicationsSection`: List of job applications
- `RemindersSection`: Upcoming events and tasks
- `InterviewsSection`: Interview details
- `ProfileArtifactsSection`: User profile and documents
- `GoalsSection`: Job search goals
- `TimelineSection`: Activity timeline

### Context System

#### ThemeContext

Manages theme state throughout the application, providing various theme options and customization capabilities.

```tsx
<ThemeProvider>
  <Component {...pageProps} />
</ThemeProvider>
```

## Customization

### Theme System

The app supports extensive theme customization:

```tsx
// Available theme options
const themeOptions = [
  'default',       // Default theme
  'minimal',       // Minimalist theme
  'neon',          // Cyberpunk theme
  'elegant',       // Premium theme
  'playful',       // Playful theme
  'corporate',     // Enterprise theme
  'sunset',        // Warm theme
  'oceanic',       // Deep Sea theme
  'monochrome',    // Monochrome theme
  'custom'         // Custom theme with user preferences
];

// Properties that can be customized
interface ThemeSettings {
  colorTheme: 'light' | 'dark';
  accentColor: 'blue' | 'purple' | 'pink' | 'orange' | 'green' | 'yellow' | 'red';
  fontFamily: 'inter' | 'lexend' | 'roboto' | 'poppins' | 'montserrat';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation: 'minimal' | 'subtle' | 'moderate' | 'playful' | 'intense';
  glassEffect: 'none' | 'subtle' | 'medium' | 'heavy';
}
```

## Data Structure

The application uses several data types to represent job applications and related information:

```typescript
// Application stages
type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

// Application data structure
interface Application {
  id: string;
  position: string;
  company: Company;
  dateApplied: Date;
  stage: ApplicationStage;
  jobDescription: string;
  salary: string;
  location: string;
  remote: boolean;
  notes: string;
  contacts: { name: string; role: string; email: string }[];
}

// Activity data structure
interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  application: Application;
  company: Company;
  timestamp: Date;
  details: string;
}

// Event data structure
interface UpcomingEvent {
  id: string;
  title: string;
  company: Company;
  date: Date;
  time: string;
  type: EventType;
  application: Application;
  details: string;
  deadline?: Date;
  location?: string;
  duration?: number;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)
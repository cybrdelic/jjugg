'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Grid3x3, ListFilter, ChevronDown,
  SlidersHorizontal, Download, X, Clock,
  ArrowUp, ArrowDown, FileText, Calendar,
  User, Briefcase, MessageSquare, Bell, Phone
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CardHeader from '../CardHeader';
import ApplicationCard from '../applications/ApplicationCard';
import SearchFilter from '../applications/SearchFilter';
import KanbanColumn from '../applications/KanbanColumn';
import ActionButton from '../dashboard/ActionButton';
import ApplicationDetailModal from '../applications/ApplicationDetailModal';

// Types
interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  website?: string;
  description?: string;
  headquarters?: string;
  size?: string;
  founded?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
}

interface InterviewEvent {
  id: string;
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'other';
  date: Date;
  duration: number; // in minutes
  with?: string;
  location?: string;
  notes?: string;
  completed: boolean;
  feedback?: string;
}

type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  type?: 'general' | 'interview' | 'research' | 'followup';
}

interface Document {
  id: string;
  name: string;
  type: 'resume' | 'cover-letter' | 'portfolio' | 'other';
  url: string;
  createdAt: Date;
}

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
  contacts: Contact[];
  interviews?: InterviewEvent[];
  tasks?: Task[];
  documents?: Document[];
  allNotes?: Note[];
}

// Helper function to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Mock data
const companies: Company[] = [
  {
    id: 'c1',
    name: 'Google',
    logo: '/companies/google.svg',
    industry: 'Technology',
    website: 'https://google.com',
    description: 'A multinational technology company specializing in Internet-related services and products.',
    headquarters: 'Mountain View, California',
    size: '100,000+',
    founded: '1998'
  },
  {
    id: 'c2',
    name: 'Microsoft',
    logo: '/companies/microsoft.svg',
    industry: 'Technology',
    website: 'https://microsoft.com',
    description: 'A multinational technology company that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, and related services.',
    headquarters: 'Redmond, Washington',
    size: '180,000+',
    founded: '1975'
  },
  {
    id: 'c3',
    name: 'Apple',
    logo: '/companies/apple.svg',
    industry: 'Technology',
    website: 'https://apple.com',
    description: 'A multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services.',
    headquarters: 'Cupertino, California',
    size: '147,000+',
    founded: '1976'
  },
  {
    id: 'c4',
    name: 'Amazon',
    logo: '/companies/amazon.svg',
    industry: 'E-commerce',
    website: 'https://amazon.com',
    description: 'A multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
    headquarters: 'Seattle, Washington',
    size: '1,500,000+',
    founded: '1994'
  },
  {
    id: 'c5',
    name: 'Facebook',
    logo: '/companies/facebook.svg',
    industry: 'Social Media',
    website: 'https://facebook.com',
    description: 'A social media and technology company that operates the Facebook social networking service.',
    headquarters: 'Menlo Park, California',
    size: '60,000+',
    founded: '2004'
  },
  {
    id: 'c6',
    name: 'Netflix',
    logo: '/companies/netflix.svg',
    industry: 'Entertainment',
    website: 'https://netflix.com',
    description: 'A streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more.',
    headquarters: 'Los Gatos, California',
    size: '11,000+',
    founded: '1997'
  },
  {
    id: 'c7',
    name: 'Stripe',
    logo: '/companies/stripe.svg',
    industry: 'Fintech',
    website: 'https://stripe.com',
    description: 'A financial services and software as a service company that offers payment processing software and API for e-commerce websites and mobile applications.',
    headquarters: 'San Francisco, California',
    size: '4,000+',
    founded: '2010'
  },
  {
    id: 'c8',
    name: 'Airbnb',
    logo: '/companies/airbnb.svg',
    industry: 'Travel',
    website: 'https://airbnb.com',
    description: 'An online marketplace for lodging, primarily homestays for vacation rentals, and tourism activities.',
    headquarters: 'San Francisco, California',
    size: '6,000+',
    founded: '2008'
  },
];

// Create mock interviews, tasks, documents, and notes
const createMockInterviews = (appId: string, stage: ApplicationStage): InterviewEvent[] => {
  const interviews: InterviewEvent[] = [];

  if (stage === 'screening' || stage === 'interview' || stage === 'offer') {
    // Add completed phone screening
    interviews.push({
      id: `${appId}-int1`,
      type: 'phone',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      duration: 30,
      with: 'HR Recruiter',
      notes: 'Initial screening to discuss background and experience',
      completed: true,
      feedback: 'Positive feedback. Moving forward to technical interview.'
    });
  }

  if (stage === 'interview' || stage === 'offer') {
    // Add technical interview (completed)
    interviews.push({
      id: `${appId}-int2`,
      type: 'technical',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      duration: 60,
      with: 'Senior Developer',
      notes: 'Whiteboard coding and system design questions',
      completed: true,
      feedback: 'Strong technical skills demonstrated. Moving to next round.'
    });
  }

  if (stage === 'interview') {
    // Add upcoming interview
    interviews.push({
      id: `${appId}-int3`,
      type: 'video',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
      duration: 45,
      with: 'Hiring Manager',
      notes: 'Discussion about team fit and future projects',
      completed: false
    });
  }

  return interviews;
};

const createMockTasks = (appId: string): Task[] => {
  return [
    {
      id: `${appId}-task1`,
      title: 'Send follow-up email',
      completed: true,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: `${appId}-task2`,
      title: 'Prepare for technical interview',
      completed: false,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: `${appId}-task3`,
      title: 'Research company culture',
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'medium'
    }
  ];
};

const createMockDocuments = (appId: string): Document[] => {
  return [
    {
      id: `${appId}-doc1`,
      name: 'Resume - Software Engineer',
      type: 'resume',
      url: '/documents/resume.pdf',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: `${appId}-doc2`,
      name: 'Cover Letter',
      type: 'cover-letter',
      url: '/documents/cover-letter.pdf',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: `${appId}-doc3`,
      name: 'Portfolio Website',
      type: 'portfolio',
      url: 'https://portfolio.example.com',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  ];
};

const createMockNotes = (appId: string): Note[] => {
  return [
    {
      id: `${appId}-note1`,
      content: 'Initial research shows this company has strong growth potential in the AI sector.',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      type: 'research'
    },
    {
      id: `${appId}-note2`,
      content: 'Spoke with Jane who currently works there. She mentioned the work-life balance is excellent.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      type: 'research'
    },
    {
      id: `${appId}-note3`,
      content: 'Need to highlight my experience with React and TypeScript for this role.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      type: 'general'
    }
  ];
};

// Create enhanced applications with additional data
const applications: Application[] = [
  {
    id: 'app1',
    position: 'Senior Frontend Developer',
    company: companies[0],
    dateApplied: new Date(2023, 11, 10),
    stage: 'interview',
    jobDescription: 'Building and maintaining Google Maps web applications using React, TypeScript, and various Google APIs. The role involves close collaboration with the design team to implement responsive and accessible user interfaces, optimizing performance, and ensuring cross-browser compatibility. You\'ll also contribute to the component library and help establish best practices for front-end development.',
    salary: '$140,000 - $180,000',
    location: 'Mountain View, CA',
    remote: false,
    notes: 'Had a great initial call with the recruiter. They seem very interested in my experience with large-scale applications and performance optimization.',
    contacts: [
      { id: 'contact1', name: 'Sarah Johnson', role: 'Technical Recruiter', email: 'sarah.j@google.com', phone: '650-555-1234' },
      { id: 'contact2', name: 'David Chen', role: 'Engineering Manager', email: 'dchen@google.com' }
    ],
    interviews: createMockInterviews('app1', 'interview'),
    tasks: createMockTasks('app1'),
    documents: createMockDocuments('app1'),
    allNotes: createMockNotes('app1')
  },
  {
    id: 'app2',
    position: 'Software Engineer',
    company: companies[1],
    dateApplied: new Date(2023, 11, 12),
    stage: 'screening',
    jobDescription: 'Developing features for Microsoft Azure cloud services. This role involves working with distributed systems, containerization technologies, and microservices architecture. You\'ll be part of a team that designs, implements, and maintains cloud infrastructure components that power millions of applications worldwide.',
    salary: '$130,000 - $160,000',
    location: 'Redmond, WA',
    remote: true,
    notes: 'Submitted coding assessment. The questions were focused on algorithm efficiency and system design.',
    contacts: [
      { id: 'contact3', name: 'Michael Smith', role: 'HR Coordinator', email: 'msmith@microsoft.com' }
    ],
    interviews: createMockInterviews('app2', 'screening'),
    tasks: createMockTasks('app2'),
    documents: createMockDocuments('app2'),
    allNotes: createMockNotes('app2')
  },
  {
    id: 'app3',
    position: 'iOS Developer',
    company: companies[2],
    dateApplied: new Date(2023, 11, 15),
    stage: 'applied',
    jobDescription: 'Creating innovative iOS applications using Swift and Apple\'s latest frameworks. You\'ll work on consumer-facing apps that are used by millions of people daily. The role requires strong knowledge of iOS development patterns, performance optimization, and user experience design principles.',
    salary: '$135,000 - $170,000',
    location: 'Cupertino, CA',
    remote: false,
    notes: 'Tailored resume to highlight my Swift and iOS development experience.',
    contacts: [],
    interviews: [],
    tasks: createMockTasks('app3'),
    documents: createMockDocuments('app3'),
    allNotes: createMockNotes('app3')
  },
  {
    id: 'app4',
    position: 'Cloud Engineer',
    company: companies[3],
    dateApplied: new Date(2023, 11, 18),
    stage: 'offer',
    jobDescription: 'Optimizing AWS infrastructure for high-scale services. This role focuses on designing and implementing cloud solutions that are scalable, secure, and cost-effective. You\'ll work with EC2, S3, Lambda, and other AWS services to build distributed systems that support Amazon\'s global operations.',
    salary: '$145,000 - $190,000',
    location: 'Seattle, WA',
    remote: true,
    notes: 'Received offer, negotiating terms. Base salary offered is $145K with $20K sign-on bonus and RSUs valued at $80K over 4 years.',
    contacts: [
      { id: 'contact4', name: 'Mike Brown', role: 'Hiring Manager', email: 'mike.b@amazon.com', phone: '206-555-6789' }
    ],
    interviews: createMockInterviews('app4', 'offer'),
    tasks: createMockTasks('app4'),
    documents: createMockDocuments('app4'),
    allNotes: createMockNotes('app4')
  },
  {
    id: 'app5',
    position: 'Product Manager',
    company: companies[4],
    dateApplied: new Date(2023, 11, 20),
    stage: 'interview',
    jobDescription: 'Leading product strategy for Instagram features, collaborating with designers, engineers, and data scientists to define and launch new user experiences. This role requires a combination of technical understanding, user empathy, and business acumen to prioritize features that delight users while driving business metrics.',
    salary: '$150,000 - $200,000',
    location: 'Menlo Park, CA',
    remote: false,
    notes: 'Preparing for behavioral interview. Need to review STAR method answers and prepare examples of product management achievements.',
    contacts: [
      { id: 'contact5', name: 'Jessica Lee', role: 'Product Lead', email: 'jlee@fb.com' },
      { id: 'contact6', name: 'Robert Taylor', role: 'Recruiter', email: 'rtaylor@fb.com', phone: '650-555-2345' }
    ],
    interviews: createMockInterviews('app5', 'interview'),
    tasks: createMockTasks('app5'),
    documents: createMockDocuments('app5'),
    allNotes: createMockNotes('app5')
  },
  {
    id: 'app6',
    position: 'Backend Engineer',
    company: companies[5],
    dateApplied: new Date(2023, 11, 22),
    stage: 'rejected',
    jobDescription: 'Scaling Netflix streaming services using Java, Spring Boot, and AWS. You\'ll work on systems that handle billions of requests daily, focusing on reliability, performance, and global availability. The role involves designing and implementing microservices that power the content delivery pipeline.',
    salary: '$140,000 - $180,000',
    location: 'Los Gatos, CA',
    remote: true,
    notes: 'Rejected after initial screening. Feedback mentioned they were looking for someone with more experience in high-scale distributed systems.',
    contacts: [],
    interviews: [],
    tasks: [],
    documents: createMockDocuments('app6'),
    allNotes: createMockNotes('app6')
  },
  {
    id: 'app7',
    position: 'DevOps Engineer',
    company: companies[6],
    dateApplied: new Date(2023, 11, 23),
    stage: 'screening',
    jobDescription: 'Managing CI/CD pipelines at Stripe, ensuring smooth and reliable deployment of code changes. This role involves working with Kubernetes, Docker, and various monitoring/observability tools to support the engineering organization. You\'ll help design infrastructure as code and implement automation to increase developer productivity.',
    salary: '$130,000 - $165,000',
    location: 'San Francisco, CA',
    remote: true,
    notes: 'Technical phone screen scheduled for next week. Need to review Kubernetes concepts and CI/CD best practices.',
    contacts: [
      { id: 'contact7', name: 'Alex Wong', role: 'DevOps Lead', email: 'awong@stripe.com' }
    ],
    interviews: createMockInterviews('app7', 'screening'),
    tasks: createMockTasks('app7'),
    documents: createMockDocuments('app7'),
    allNotes: createMockNotes('app7')
  },
  {
    id: 'app8',
    position: 'Frontend Developer',
    company: companies[7],
    dateApplied: new Date(2023, 11, 24),
    stage: 'applied',
    jobDescription: 'Building Airbnb\'s booking platform using React, Redux, and GraphQL. The role involves implementing complex UI components, optimizing for performance across devices, and collaborating with designers and product managers to deliver features that enhance the user experience for both hosts and guests.',
    salary: '$125,000 - $155,000',
    location: 'San Francisco, CA',
    remote: true,
    notes: 'Applied through referral from Lisa Chen who works on the frontend team.',
    contacts: [
      { id: 'contact8', name: 'Lisa Chen', role: 'Senior Engineer', email: 'lisa.c@airbnb.com', linkedin: 'linkedin.com/in/lisachen' }
    ],
    interviews: [],
    tasks: createMockTasks('app8'),
    documents: createMockDocuments('app8'),
    allNotes: createMockNotes('app8')
  },
];

// Get stage color
const getStageColor = (stage: ApplicationStage): string => {
  switch (stage) {
    case 'applied': return 'var(--accent-blue)';
    case 'screening': return 'var(--accent-purple)';
    case 'interview': return 'var(--accent-green)';
    case 'offer': return 'var(--accent-success)';
    case 'rejected': return 'var(--accent-red)';
    default: return 'var(--text-secondary)';
  }
};

// Get stage display name
const getStageLabel = (stage: ApplicationStage): string => {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
};

export default function Applications() {
  const { currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [stageFilter, setStageFilter] = useState<ApplicationStage | 'all'>('all');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{column: keyof Application | 'company.name', direction: 'asc' | 'desc'}>({
    column: 'dateApplied',
    direction: 'desc'
  });
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<Application[]>(applications);
  const [mounted, setMounted] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Animation effect on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find selected application
  const selectedAppData = useMemo(() => {
    if (!selectedApplication) return null;
    return applicationData.find(app => app.id === selectedApplication) || null;
  }, [selectedApplication, applicationData]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  // Handle filter change
  const handleFilterChange = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  // Handle view mode toggle
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'table' ? 'kanban' : 'table');
  };

  // Handle stage change for an application
  const handleStageChange = (appId: string, newStage: ApplicationStage) => {
    setApplicationData(prev =>
      prev.map(app =>
        app.id === appId ? { ...app, stage: newStage } : app
      )
    );
  };

  // Handle application edit
  const handleEditApplication = (appId: string) => {
    setSelectedApplication(appId);
    console.log(`Edit application ${appId}`);
    // Open edit modal
  };

  // Handle application delete
  const handleDeleteApplication = (appId: string) => {
    console.log(`Delete application ${appId}`);
    // Show confirmation dialog before deleting
    if (confirm(`Are you sure you want to delete this application?`)) {
      setApplicationData(prev => prev.filter(app => app.id !== appId));
      if (selectedApplication === appId) {
        setSelectedApplication(null);
        setIsDetailModalVisible(false);
      }
    }
  };

  // Handle adding new application
  const handleAddApplication = () => {
    setIsAddModalOpen(true);
    console.log('Add new application');
    // Open add modal
  };

  // Open application detail modal
  const handleOpenDetailModal = (appId: string) => {
    setSelectedApplication(appId);
    setIsDetailModalVisible(true);
  };

  // Close application detail modal
  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
  };

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applicationData];

    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.position.toLowerCase().includes(search) ||
        app.company.name.toLowerCase().includes(search) ||
        app.location.toLowerCase().includes(search) ||
        app.notes.toLowerCase().includes(search)
      );
    }

    // Apply stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(app => app.stage === stageFilter);
    }

    // Apply selected filters
    if (Object.keys(selectedFilters).length > 0) {
      filtered = filtered.filter(app => {
        for (const [key, values] of Object.entries(selectedFilters)) {
          if (values.length === 0) continue;

          switch (key) {
            case 'stages':
              if (values.length > 0 && !values.includes(app.stage)) return false;
              break;
            case 'companies':
              if (values.length > 0 && !values.includes(app.company.name)) return false;
              break;
            case 'locations':
              if (values.includes('remote') && !app.remote) return false;
              if (values.some(loc => loc !== 'remote') &&
                  !values.some(loc => app.location.includes(loc) && loc !== 'remote')) return false;
              break;
            // Add other filter types as needed
          }
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { column, direction } = sortConfig;

      let valueA, valueB;

      if (column === 'company.name') {
        valueA = a.company.name;
        valueB = b.company.name;
      } else {
        valueA = a[column];
        valueB = b[column];
      }

      if (valueA instanceof Date && valueB instanceof Date) {
        return direction === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });

    return filtered;
  }, [applicationData, searchTerm, stageFilter, selectedFilters, sortConfig]);

  // Group applications by stage for kanban view
  const applicationsByStage = useMemo(() => {
    const stages: Record<ApplicationStage, Application[]> = {
      applied: [],
      screening: [],
      interview: [],
      offer: [],
      rejected: []
    };

    filteredApplications.forEach(app => {
      stages[app.stage].push(app);
    });

    return stages;
  }, [filteredApplications]);

  return (
    <section className={`applications-section ${mounted ? 'mounted' : ''}`}>
      <CardHeader
        title="Applications"
        subtitle="Track and manage your job applications"
        accentColor="var(--accent-primary)"
        variant="default"
      >
        <div className="header-actions">
          <ActionButton
            label="Add Application"
            icon={PlusCircle}
            variant="primary"
            onClick={handleAddApplication}
          />
        </div>
      </CardHeader>

      <div className="applications-toolbar">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilterChange}
          placeholder="Search applications..."
        />

        <div className="view-toggles">
          <button
            className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <Grid3x3 size={18} />
            <span>Kanban</span>
          </button>

          <button
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <ListFilter size={18} />
            <span>List</span>
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="kanban-view">
          <div className="kanban-container">
            {(['applied', 'screening', 'interview', 'offer', 'rejected'] as ApplicationStage[]).map(stage => (
              <KanbanColumn
                key={stage}
                title={getStageLabel(stage)}
                count={applicationsByStage[stage].length}
                color={getStageColor(stage)}
                onAddNew={() => {
                  // Pre-fill the stage when adding from a specific column
                  console.log(`Add new application with stage: ${stage}`);
                  setIsAddModalOpen(true);
                }}
                onCollapseToggle={(collapsed) => {
                  console.log(`${stage} column ${collapsed ? 'collapsed' : 'expanded'}`);
                }}
              >
                {applicationsByStage[stage].map(app => (
                  <ApplicationCard
                    key={app.id}
                    id={app.id}
                    position={app.position}
                    company={app.company}
                    dateApplied={app.dateApplied}
                    stage={app.stage}
                    salary={app.salary}
                    location={app.location}
                    remote={app.remote}
                    notes={app.notes}
                    onEdit={() => handleEditApplication(app.id)}
                    onDelete={() => handleDeleteApplication(app.id)}
                    onStageChange={(newStage) => handleStageChange(app.id, newStage)}
                    onClick={() => handleOpenDetailModal(app.id)}
                  />
                ))}
              </KanbanColumn>
            ))}
          </div>
        </div>
      ) : (
        <div className="table-view">
          <div className="applications-table">
            <div className="table-header">
              <div
                className={`header-cell company-cell ${sortConfig.column === 'company.name' ? 'sorted' : ''}`}
                onClick={() => setSortConfig({
                  column: 'company.name',
                  direction: sortConfig.column === 'company.name' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                })}
              >
                <span>Company</span>
                {sortConfig.column === 'company.name' && (
                  sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </div>

              <div
                className={`header-cell position-cell ${sortConfig.column === 'position' ? 'sorted' : ''}`}
                onClick={() => setSortConfig({
                  column: 'position',
                  direction: sortConfig.column === 'position' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                })}
              >
                <span>Position</span>
                {sortConfig.column === 'position' && (
                  sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </div>

              <div
                className={`header-cell date-cell ${sortConfig.column === 'dateApplied' ? 'sorted' : ''}`}
                onClick={() => setSortConfig({
                  column: 'dateApplied',
                  direction: sortConfig.column === 'dateApplied' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                })}
              >
                <span>Date Applied</span>
                {sortConfig.column === 'dateApplied' && (
                  sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </div>

              <div className="header-cell stage-cell">
                <span>Stage</span>
              </div>

              <div className="header-cell location-cell">
                <span>Location</span>
              </div>

              <div className="header-cell actions-cell">
                <span>Actions</span>
              </div>
            </div>

            <div className="table-body">
              {filteredApplications.length === 0 ? (
                <div className="empty-state">
                  <p>No applications match your filters</p>
                  <button
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setStageFilter('all');
                      setSelectedFilters({});
                    }}
                  >
                    <X size={14} />
                    <span>Clear filters</span>
                  </button>
                </div>
              ) : (
                filteredApplications.map(app => (
                  <div
                    key={app.id}
                    className={`table-row ${selectedApplication === app.id ? 'selected' : ''}`}
                    onClick={() => handleOpenDetailModal(app.id)}
                  >
                    <div className="cell company-cell">
                      <div className="company-logo">
                        {app.company.logo ? (
                          <img src={app.company.logo} alt={app.company.name} />
                        ) : (
                          app.company.name.charAt(0)
                        )}
                      </div>
                      <span className="company-name">{app.company.name}</span>
                    </div>

                    <div className="cell position-cell">
                      <span className="position-title">{app.position}</span>
                    </div>

                    <div className="cell date-cell">
                      <span className="date-applied">{formatDate(app.dateApplied)}</span>
                    </div>

                    <div className="cell stage-cell">
                      <div
                        className="stage-badge"
                        style={{
                          backgroundColor: `rgba(${getStageColor(app.stage).replace('var(--accent-', 'var(--accent-').replace(')', '-rgb)')}, 0.1)`,
                          color: getStageColor(app.stage)
                        }}
                      >
                        <span className="stage-indicator" style={{ backgroundColor: getStageColor(app.stage) }}></span>
                        <span>{getStageLabel(app.stage)}</span>
                      </div>
                    </div>

                    <div className="cell location-cell">
                      <span className="location">{app.location}</span>
                      {app.remote && <span className="remote-badge">Remote</span>}
                    </div>

                    <div className="cell actions-cell">
                      <div className="row-actions">
                        <button
                          className="action-btn view"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetailModal(app.id);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditApplication(app.id);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteApplication(app.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedAppData && (
        <ApplicationDetailModal
          id={selectedAppData.id}
          position={selectedAppData.position}
          company={selectedAppData.company}
          dateApplied={selectedAppData.dateApplied}
          stage={selectedAppData.stage}
          jobDescription={selectedAppData.jobDescription}
          salary={selectedAppData.salary}
          location={selectedAppData.location}
          remote={selectedAppData.remote}
          notes={selectedAppData.notes}
          contacts={selectedAppData.contacts}
          interviews={selectedAppData.interviews || []}
          tasks={selectedAppData.tasks || []}
          documents={selectedAppData.documents || []}
          allNotes={selectedAppData.allNotes || []}
          isVisible={isDetailModalVisible}
          onClose={handleCloseDetailModal}
          onEdit={() => handleEditApplication(selectedAppData.id)}
          onStageChange={(newStage) => handleStageChange(selectedAppData.id, newStage)}
        />
      )}

      <style jsx>{`
        .applications-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.6s var(--easing-standard);
        }

        .applications-section.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .applications-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.1s;
        }

        .view-toggles {
          display: flex;
          gap: 8px;
        }

        .view-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .view-toggle-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .view-toggle-btn.active {
          background: rgba(var(--accent-primary-rgb), 0.1);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        /* Kanban View */
        .kanban-view {
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.2s;
          padding-bottom: 24px;
        }

        .kanban-container {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding: 12px 8px 32px 8px;
          min-height: calc(100vh - 200px);
          scrollbar-width: thin;
          scrollbar-color: var(--border-thin) transparent;
        }

        .kanban-container::-webkit-scrollbar {
          height: 8px;
        }

        .kanban-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .kanban-container::-webkit-scrollbar-thumb {
          background-color: var(--border-thin);
          border-radius: 20px;
        }

        /* Table View */
        .table-view {
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.2s;
        }

        .applications-table {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .table-header {
          display: flex;
          background: var(--glass-bg);
          border-bottom: 1px solid var(--border-divider);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-cell {
          padding: 16px;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .header-cell:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
        }

        .header-cell.sorted {
          color: var(--accent-primary);
        }

        .company-cell {
          width: 22%;
        }

        .position-cell {
          width: 28%;
        }

        .date-cell {
          width: 15%;
        }

        .stage-cell {
          width: 15%;
        }

        .location-cell {
          width: 15%;
        }

        .actions-cell {
          width: 15%;
        }

        .table-body {
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }

        .table-row {
          display: flex;
          border-bottom: 1px solid var(--border-divider);
          transition: all 0.2s var(--easing-standard);
          cursor: pointer;
        }

        .table-row:hover {
          background: var(--hover-bg);
        }

        .table-row.selected {
          background: rgba(var(--accent-primary-rgb), 0.05);
          border-left: 3px solid var(--accent-primary);
        }

        .cell {
          padding: 16px;
          display: flex;
          align-items: center;
        }

        .company-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          font-weight: 600;
          overflow: hidden;
        }

        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .company-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .position-title {
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .date-applied {
          color: var(--text-secondary);
        }

        .stage-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .stage-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .location {
          color: var(--text-secondary);
        }

        .remote-badge {
          display: inline-block;
          padding: 2px 6px;
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
          margin-left: 8px;
        }

        .row-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.2s var(--easing-standard);
        }

        .table-row:hover .row-actions {
          opacity: 1;
          transform: translateY(0);
        }

        .action-btn {
          padding: 6px 10px;
          border-radius: var(--border-radius);
          font-size: 13px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .action-btn.view {
          background: rgba(var(--accent-primary-rgb), 0.1);
          color: var(--accent-primary);
        }

        .action-btn.view:hover {
          background: rgba(var(--accent-primary-rgb), 0.2);
        }

        .action-btn.edit {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .action-btn.edit:hover {
          background: rgba(var(--accent-blue-rgb), 0.2);
        }

        .action-btn.delete {
          background: rgba(var(--accent-red-rgb), 0.1);
          color: var(--accent-red);
        }

        .action-btn.delete:hover {
          background: rgba(var(--accent-red-rgb), 0.2);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .clear-filters-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        /* Animations */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .applications-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .table-header {
            display: none;
          }

          .table-row {
            flex-direction: column;
            padding: 16px;
            border-bottom: 8px solid var(--hover-bg);
          }

          .cell {
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-divider);
          }

          .cell:last-child {
            border-bottom: none;
          }

          .company-cell {
            order: 1;
          }

          .position-cell {
            order: 2;
          }

          .stage-cell {
            order: 3;
          }

          .date-cell {
            order: 4;
          }

          .location-cell {
            order: 5;
          }

          .actions-cell {
            order: 6;
          }

          .row-actions {
            opacity: 1;
            transform: translateY(0);
            justify-content: flex-end;
            margin-top: 8px;
          }
        }
      `}</style>
    </section>
  );
}

import { db } from './connection';

export const seedData = () => {
    console.log('🌱 Starting database seeding...');

    // Insert users
    const insertUser = db.prepare(`
    INSERT INTO users (name, email, avatar)
    VALUES (?, ?, ?)
  `);

    const userId = insertUser.run(
        'Alex Foster',
        'alex.foster@example.com',
        '/avatar.jpg'
    ).lastInsertRowid;

    // Insert companies
    const insertCompany = db.prepare(`
    INSERT INTO companies (name, logo, industry, website, description)
    VALUES (?, ?, ?, ?, ?)
  `);

    const companies = [
        {
            name: 'TechFlow Inc',
            logo: '/company-logos/techflow.png',
            industry: 'Technology',
            website: 'https://techflow.com',
            description: 'A leading software development company'
        },
        {
            name: 'DataVision Analytics',
            logo: '/company-logos/datavision.png',
            industry: 'Data Analytics',
            website: 'https://datavision.com',
            description: 'Advanced data analytics and machine learning solutions'
        },
        {
            name: 'CloudSync Solutions',
            logo: '/company-logos/cloudsync.png',
            industry: 'Cloud Computing',
            website: 'https://cloudsync.com',
            description: 'Cloud infrastructure and DevOps solutions'
        },
        {
            name: 'InnovateLab',
            logo: '/company-logos/innovatelab.png',
            industry: 'Research & Development',
            website: 'https://innovatelab.com',
            description: 'Innovation laboratory for emerging technologies'
        },
        {
            name: 'SecureNet Corp',
            logo: '/company-logos/securenet.png',
            industry: 'Cybersecurity',
            website: 'https://securenet.com',
            description: 'Enterprise cybersecurity solutions'
        }
    ];

    const companyIds = companies.map(company => {
        return insertCompany.run(
            company.name,
            company.logo,
            company.industry,
            company.website,
            company.description
        ).lastInsertRowid;
    });

    // Insert applications
    const insertApplication = db.prepare(`
    INSERT INTO applications (user_id, company_id, position, stage, date_applied, salary_range, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    const applications = [
        {
            companyIndex: 0,
            position: 'Senior Full Stack Developer',
            stage: 'interview',
            dateApplied: '2024-01-15',
            salaryRange: '$120k - $150k',
            notes: 'Excellent company culture, remote-first approach'
        },
        {
            companyIndex: 1,
            position: 'Data Scientist',
            stage: 'screening',
            dateApplied: '2024-01-20',
            salaryRange: '$110k - $140k',
            notes: 'Strong focus on ML and AI projects'
        },
        {
            companyIndex: 2,
            position: 'DevOps Engineer',
            stage: 'applied',
            dateApplied: '2024-01-25',
            salaryRange: '$105k - $135k',
            notes: 'AWS and Kubernetes heavy environment'
        },
        {
            companyIndex: 3,
            position: 'Frontend Developer',
            stage: 'offer',
            dateApplied: '2024-01-10',
            salaryRange: '$100k - $125k',
            notes: 'React and TypeScript focused role'
        },
        {
            companyIndex: 4,
            position: 'Security Engineer',
            stage: 'rejected',
            dateApplied: '2024-01-05',
            salaryRange: '$115k - $145k',
            notes: 'Required more cybersecurity experience'
        }
    ];

    const applicationIds = applications.map(app => {
        return insertApplication.run(
            userId,
            companyIds[app.companyIndex],
            app.position,
            app.stage,
            app.dateApplied,
            app.salaryRange,
            app.notes
        ).lastInsertRowid;
    });

    // Insert interviews
    const insertInterview = db.prepare(`
    INSERT INTO interviews (application_id, type, scheduled_date, duration, interviewer_name, interviewer_role, notes, outcome)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const interviews = [
        {
            applicationIndex: 0,
            type: 'technical',
            scheduledDate: '2024-01-22 14:00:00',
            duration: 90,
            interviewerName: 'Sarah Johnson',
            interviewerRole: 'Senior Engineering Manager',
            notes: 'Technical coding interview focusing on React and Node.js',
            outcome: 'passed'
        },
        {
            applicationIndex: 0,
            type: 'behavioral',
            scheduledDate: '2024-01-25 10:00:00',
            duration: 60,
            interviewerName: 'Mike Chen',
            interviewerRole: 'VP of Engineering',
            notes: 'Culture fit and leadership discussion',
            outcome: 'pending'
        },
        {
            applicationIndex: 1,
            type: 'phone',
            scheduledDate: '2024-01-23 15:30:00',
            duration: 45,
            interviewerName: 'Dr. Lisa Park',
            interviewerRole: 'Lead Data Scientist',
            notes: 'Initial screening for data science role',
            outcome: 'passed'
        }
    ];

    interviews.forEach(interview => {
        insertInterview.run(
            applicationIds[interview.applicationIndex],
            interview.type,
            interview.scheduledDate,
            interview.duration,
            interview.interviewerName,
            interview.interviewerRole,
            interview.notes,
            interview.outcome
        );
    });

    // Insert activities
    const insertActivity = db.prepare(`
    INSERT INTO activities (user_id, application_id, type, title, description, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    const activities = [
        {
            applicationIndex: 0,
            type: 'interview',
            title: 'Technical Interview with TechFlow',
            description: 'Completed technical coding interview',
            priority: 'high',
            status: 'completed'
        },
        {
            applicationIndex: 1,
            type: 'application',
            title: 'Applied to DataVision Analytics',
            description: 'Submitted application for Data Scientist position',
            priority: 'medium',
            status: 'completed'
        },
        {
            applicationIndex: 2,
            type: 'follow_up',
            title: 'Follow up on CloudSync application',
            description: 'Send follow-up email to HR department',
            priority: 'medium',
            status: 'pending'
        },
        {
            applicationIndex: null,
            type: 'network',
            title: 'LinkedIn networking',
            description: 'Connect with 5 professionals in target companies',
            priority: 'low',
            status: 'pending'
        }
    ];

    activities.forEach(activity => {
        insertActivity.run(
            userId,
            activity.applicationIndex !== null ? applicationIds[activity.applicationIndex] : null,
            activity.type,
            activity.title,
            activity.description,
            activity.priority,
            activity.status
        );
    });

    // Insert events/reminders
    const insertEvent = db.prepare(`
    INSERT INTO events (user_id, application_id, title, description, event_date, event_type, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    const events = [
        {
            applicationIndex: 0,
            title: 'Final Interview with TechFlow',
            description: 'Final round interview with VP of Engineering',
            eventDate: '2024-01-25 10:00:00',
            eventType: 'interview',
            isCompleted: false
        },
        {
            applicationIndex: 1,
            title: 'Follow up on DataVision application',
            description: 'Send thank you email after phone screening',
            eventDate: '2024-01-24 09:00:00',
            eventType: 'follow_up',
            isCompleted: false
        },
        {
            applicationIndex: 2,
            title: 'CloudSync application deadline',
            description: 'Application review period ends',
            eventDate: '2024-01-30 23:59:00',
            eventType: 'deadline',
            isCompleted: false
        }
    ];

    events.forEach(event => {
        insertEvent.run(
            userId,
            event.applicationIndex !== null ? applicationIds[event.applicationIndex] : null,
            event.title,
            event.description,
            event.eventDate,
            event.eventType,
            event.isCompleted ? 1 : 0
        );
    });

    // Insert goals
    const insertGoal = db.prepare(`
    INSERT INTO goals (user_id, title, description, target_value, current_value, target_date, category, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const goals = [
        {
            title: 'Apply to 20 companies this month',
            description: 'Submit high-quality applications to target companies',
            targetValue: 20,
            currentValue: 5,
            targetDate: '2024-01-31',
            category: 'applications',
            isCompleted: false
        },
        {
            title: 'Complete 10 technical interviews',
            description: 'Successfully complete technical interview rounds',
            targetValue: 10,
            currentValue: 3,
            targetDate: '2024-02-29',
            category: 'interviews',
            isCompleted: false
        },
        {
            title: 'Build network of 50 connections',
            description: 'Connect with professionals in target industry',
            targetValue: 50,
            currentValue: 15,
            targetDate: '2024-03-31',
            category: 'networking',
            isCompleted: false
        }
    ];

    goals.forEach(goal => {
        insertGoal.run(
            userId,
            goal.title,
            goal.description,
            goal.targetValue,
            goal.currentValue,
            goal.targetDate,
            goal.category,
            goal.isCompleted ? 1 : 0
        );
    });

    // Insert contacts
    const insertContact = db.prepare(`
    INSERT INTO contacts (user_id, company_id, name, role, email, linkedin, notes, relationship)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const contacts = [
        {
            companyIndex: 0,
            name: 'Sarah Johnson',
            role: 'Senior Engineering Manager',
            email: 'sarah.johnson@techflow.com',
            linkedin: 'https://linkedin.com/in/sarahjohnson',
            notes: 'Very helpful and responsive, great technical insights',
            relationship: 'hiring_manager'
        },
        {
            companyIndex: 1,
            name: 'Dr. Lisa Park',
            role: 'Lead Data Scientist',
            email: 'lisa.park@datavision.com',
            linkedin: 'https://linkedin.com/in/drlisamark',
            notes: 'Expert in ML/AI, conducted phone screening',
            relationship: 'hiring_manager'
        },
        {
            companyIndex: 3,
            name: 'Tom Rodriguez',
            role: 'Software Engineer',
            email: 'tom.rodriguez@innovatelab.com',
            linkedin: 'https://linkedin.com/in/tomrodriguez',
            notes: 'Former colleague, provided referral',
            relationship: 'referral'
        }
    ];

    contacts.forEach(contact => {
        insertContact.run(
            userId,
            companyIds[contact.companyIndex],
            contact.name,
            contact.role,
            contact.email,
            contact.linkedin,
            contact.notes,
            contact.relationship
        );
    });

    console.log('✅ Database seeded successfully with sample data');
    console.log(`📊 Created ${applications.length} applications, ${interviews.length} interviews, ${activities.length} activities`);
};

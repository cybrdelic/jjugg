import { faker } from '@faker-js/faker';
import { db } from './connection';

export const seedData = () => {
    console.log('🌱 Starting database seeding with Faker.js...');

    // Set seed for reproducible data
    faker.seed(12345);

    // Insert users
    const insertUser = db.prepare(`
        INSERT INTO users (name, email, avatar)
        VALUES (?, ?, ?)
    `);

    const userId = insertUser.run(
        'Alex Foster',
        `alex.foster.${Date.now()}@example.com`,
        '/avatar.jpg'
    ).lastInsertRowid;

    // Generate 75 companies with realistic data
    const insertCompany = db.prepare(`
        INSERT INTO companies (name, logo, industry, website, description)
        VALUES (?, ?, ?, ?, ?)
    `);

    const industries = [
        'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Gaming',
        'SaaS', 'Fintech', 'Biotech', 'AI/ML', 'Cybersecurity',
        'Cloud Computing', 'Data Analytics', 'EdTech', 'Marketing',
        'Manufacturing', 'Consulting', 'Media', 'Real Estate',
        'Transportation', 'Energy', 'Retail', 'Entertainment'
    ];

    const companies = [];
    const companyIds = [];

    for (let i = 0; i < 75; i++) {
        const industry = faker.helpers.arrayElement(industries);
        const companyName = faker.company.name();
        const company = {
            name: companyName,
            logo: `/company-logos/${faker.lorem.slug()}.png`,
            industry,
            website: `https://${faker.internet.domainName()}`,
            description: faker.company.catchPhrase() + '. ' + faker.lorem.sentence()
        };

        companies.push(company);
        const companyId = insertCompany.run(
            company.name,
            company.logo,
            company.industry,
            company.website,
            company.description
        ).lastInsertRowid;
        companyIds.push(companyId);
    }

    // Generate 250 applications across different stages
    const insertApplication = db.prepare(`
        INSERT INTO applications (user_id, company_id, position, stage, date_applied, salary_range, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const stages = ['applied', 'screening', 'interview', 'offer', 'rejected'];
    const techPositions = [
        'Senior Software Engineer', 'Full Stack Developer', 'Frontend Developer',
        'Backend Developer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer',
        'Product Manager', 'Engineering Manager', 'Staff Engineer', 'Principal Engineer',
        'Solutions Architect', 'Security Engineer', 'Mobile Developer', 'QA Engineer',
        'Platform Engineer', 'Site Reliability Engineer', 'Data Engineer', 'Research Scientist',
        'Technical Lead', 'Engineering Director', 'CTO', 'VP of Engineering'
    ];

    const applications = [];
    const applicationIds = [];

    for (let i = 0; i < 250; i++) {
        const companyId = faker.helpers.arrayElement(companyIds);
        const position = faker.helpers.arrayElement(techPositions);
        const stage = faker.helpers.arrayElement(stages);
        const salaryMin = faker.number.int({ min: 80, max: 200 });
        const salaryMax = salaryMin + faker.number.int({ min: 20, max: 50 });
        const dateApplied = faker.date.between({
            from: '2023-09-01',
            to: '2024-01-31'
        }).toISOString().split('T')[0];

        const notes = faker.helpers.arrayElements([
            'Great company culture mentioned in reviews',
            'Strong technical team and growth opportunities',
            'Remote-first company with flexible hours',
            'Competitive benefits and equity package',
            'Fast-growing startup with innovative products',
            'Established company with stable technology stack',
            'Excellent learning and development programs',
            'Strong engineering practices and code quality',
            'Interesting technical challenges and scale',
            'Good work-life balance according to Glassdoor'
        ], { min: 1, max: 3 }).join('. ');

        const application = {
            userId,
            companyId,
            position,
            stage,
            dateApplied,
            salaryRange: `$${salaryMin}k - $${salaryMax}k`,
            notes
        };

        applications.push(application);
        const applicationId = insertApplication.run(
            application.userId,
            application.companyId,
            application.position,
            application.stage,
            application.dateApplied,
            application.salaryRange,
            application.notes
        ).lastInsertRowid;
        applicationIds.push(applicationId);
    }

    // Generate interviews for applications in interview stages
    const insertInterview = db.prepare(`
        INSERT INTO interviews (application_id, type, scheduled_date, duration, interviewer_name, interviewer_role, notes, outcome)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const interviewTypes = ['phone', 'video', 'onsite', 'technical', 'behavioral'];
    const interviewRoles = [
        'Engineering Manager', 'Senior Engineer', 'Tech Lead', 'VP of Engineering',
        'HR Manager', 'Product Manager', 'Architect', 'Director of Engineering',
        'Principal Engineer', 'Team Lead', 'CTO', 'Hiring Manager'
    ];
    const outcomes = ['passed', 'failed', 'pending', 'cancelled'];

    const interviewApplications = applications.filter(app =>
        ['screening', 'interview', 'offer'].includes(app.stage)
    );

    const interviews = [];
    for (let i = 0; i < Math.min(400, interviewApplications.length * 2); i++) {
        const application = faker.helpers.arrayElement(interviewApplications);
        const applicationIndex = applications.indexOf(application);
        const interviewType = faker.helpers.arrayElement(interviewTypes);
        const duration = interviewType === 'phone' ?
            faker.number.int({ min: 30, max: 45 }) :
            faker.number.int({ min: 45, max: 120 });

        const scheduledDate = faker.date.between({
            from: application.dateApplied,
            to: '2024-02-15'
        });

        const interview = {
            applicationId: applicationIds[applicationIndex],
            type: interviewType,
            scheduledDate: scheduledDate.toISOString().replace('T', ' ').substring(0, 19),
            duration,
            interviewerName: faker.person.fullName(),
            interviewerRole: faker.helpers.arrayElement(interviewRoles),
            notes: `${interviewType} interview covering ${faker.lorem.sentence()}`,
            outcome: faker.helpers.arrayElement(outcomes)
        };

        interviews.push(interview);
        insertInterview.run(
            interview.applicationId,
            interview.type,
            interview.scheduledDate,
            interview.duration,
            interview.interviewerName,
            interview.interviewerRole,
            interview.notes,
            interview.outcome
        );
    }

    // Generate activities
    const insertActivity = db.prepare(`
        INSERT INTO activities (user_id, application_id, type, title, description, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const activityTypes = ['application', 'interview', 'network', 'follow_up', 'offer', 'rejection'];
    const priorities = ['low', 'medium', 'high'];
    const statuses = ['pending', 'completed', 'cancelled'];

    const activities = [];
    for (let i = 0; i < 300; i++) {
        const shouldHaveApplication = faker.datatype.boolean({ probability: 0.7 });
        const applicationId = shouldHaveApplication ?
            faker.helpers.arrayElement(applicationIds) : null;

        const activityType = faker.helpers.arrayElement(activityTypes);
        const priority = faker.helpers.arrayElement(priorities);
        const status = faker.helpers.arrayElement(statuses);

        const titles: Record<string, () => string> = {
            application: () => `Applied to ${faker.company.name()}`,
            interview: () => `${faker.helpers.arrayElement(['Technical', 'Behavioral', 'Phone'])} Interview`,
            follow_up: () => `Follow up on ${faker.company.name()} application`,
            network: () => `Connect with ${faker.person.jobTitle()} at ${faker.company.name()}`,
            offer: () => `Received offer from ${faker.company.name()}`,
            rejection: () => `Rejection from ${faker.company.name()}`
        };

        const activity = {
            userId,
            applicationId,
            type: activityType,
            title: titles[activityType](),
            description: faker.lorem.sentence(),
            priority,
            status
        };

        activities.push(activity);
        insertActivity.run(
            activity.userId,
            activity.applicationId,
            activity.type,
            activity.title,
            activity.description,
            activity.priority,
            activity.status
        );
    }

    // Generate events/reminders
    const insertEvent = db.prepare(`
        INSERT INTO events (user_id, application_id, title, description, event_date, event_type, is_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const eventTypes = ['interview', 'follow_up', 'deadline', 'networking', 'other'];
    const events = [];

    for (let i = 0; i < 150; i++) {
        const shouldHaveApplication = faker.datatype.boolean({ probability: 0.8 });
        const applicationId = shouldHaveApplication ?
            faker.helpers.arrayElement(applicationIds) : null;

        const eventType = faker.helpers.arrayElement(eventTypes);
        const eventDate = faker.date.between({
            from: '2024-01-01',
            to: '2024-03-31'
        });
        const isCompleted = eventDate < new Date() ? faker.datatype.boolean() : false;

        const eventTitles: Record<string, () => string> = {
            interview: () => `${faker.helpers.arrayElement(['Phone', 'Technical', 'Behavioral'])} Interview`,
            follow_up: () => `Follow up with ${faker.person.fullName()}`,
            deadline: () => `Application deadline for ${faker.company.name()}`,
            networking: () => `Coffee chat with ${faker.person.fullName()}`,
            other: () => `${faker.lorem.words(3)}`
        };

        const event = {
            userId,
            applicationId,
            title: eventTitles[eventType](),
            description: faker.lorem.sentence(),
            eventDate: eventDate.toISOString().replace('T', ' ').substring(0, 19),
            eventType,
            isCompleted
        };

        events.push(event);
        insertEvent.run(
            event.userId,
            event.applicationId,
            event.title,
            event.description,
            event.eventDate,
            event.eventType,
            event.isCompleted ? 1 : 0
        );
    }

    // Generate goals
    const insertGoal = db.prepare(`
        INSERT INTO goals (user_id, title, description, target_value, current_value, target_date, category, is_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const goalCategories = ['applications', 'interviews', 'networking', 'skills', 'other'];
    const goals = [];

    for (let i = 0; i < 25; i++) {
        const category = faker.helpers.arrayElement(goalCategories);
        const targetValue = faker.number.int({ min: 5, max: 100 });
        const currentValue = faker.number.int({ min: 0, max: targetValue });
        const isCompleted = currentValue >= targetValue;

        const targetDate = faker.date.between({
            from: '2024-02-01',
            to: '2024-06-30'
        }).toISOString().split('T')[0];

        const goalTitles: Record<string, () => string> = {
            applications: () => `Apply to ${targetValue} companies`,
            interviews: () => `Complete ${targetValue} interviews`,
            networking: () => `Connect with ${targetValue} professionals`,
            skills: () => `Learn ${targetValue} new technologies`,
            other: () => `Complete ${targetValue} job search tasks`
        };

        const goal = {
            userId,
            title: goalTitles[category](),
            description: faker.lorem.sentence(),
            targetValue,
            currentValue,
            targetDate,
            category,
            isCompleted
        };

        goals.push(goal);
        insertGoal.run(
            goal.userId,
            goal.title,
            goal.description,
            goal.targetValue,
            goal.currentValue,
            goal.targetDate,
            goal.category,
            goal.isCompleted ? 1 : 0
        );
    }

    // Generate contacts
    const insertContact = db.prepare(`
        INSERT INTO contacts (user_id, company_id, name, role, email, linkedin, notes, relationship)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const relationships = ['hiring_manager', 'recruiter', 'employee', 'referral', 'other'];
    const contacts = [];

    for (let i = 0; i < 200; i++) {
        const companyId = faker.helpers.arrayElement(companyIds);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const relationship = faker.helpers.arrayElement(relationships);

        const contact = {
            userId,
            companyId,
            name: fullName,
            role: faker.person.jobTitle(),
            email: faker.internet.email({ firstName, lastName }),
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
            notes: faker.lorem.sentence(),
            relationship
        };

        contacts.push(contact);
        insertContact.run(
            contact.userId,
            contact.companyId,
            contact.name,
            contact.role,
            contact.email,
            contact.linkedin,
            contact.notes,
            contact.relationship
        );
    }

    console.log('✅ Database seeded successfully with comprehensive Faker.js data');
    console.log(`📊 Statistics:`);
    console.log(`   👥 Companies: ${companies.length}`);
    console.log(`   📝 Applications: ${applications.length}`);
    console.log(`   🎤 Interviews: ${interviews.length}`);
    console.log(`   📋 Activities: ${activities.length}`);
    console.log(`   📅 Events: ${events.length}`);
    console.log(`   🎯 Goals: ${goals.length}`);
    console.log(`   👤 Contacts: ${contacts.length}`);
    console.log(`   💾 Total records: ${companies.length + applications.length + interviews.length + activities.length + events.length + goals.length + contacts.length + 1}`);
};

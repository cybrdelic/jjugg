import { faker } from '@faker-js/faker';
import { db } from './connection';

export const seedData = () => {
    console.log('🌱 Starting database seeding with Faker.js...');

    // Set seed for reproducible data
    faker.seed(12345);

    db.exec('PRAGMA synchronous = OFF;');
    db.exec('PRAGMA journal_mode = WAL;');

    const transaction = db.transaction(() => {
        // Insert users
        const insertUser = db.prepare(`
            INSERT INTO users (name, email, avatar)
            VALUES (?, ?, ?)
        `);

        const userId = insertUser.run(
            'Alex Foster',
            `alex.foster.${Date.now()}@example.com`,
            '/avatar.jpg'
        ).lastInsertRowid as number;

        // Companies
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

        const companies: number[] = [];
        for (let i = 0; i < 200; i++) {
            const industry = faker.helpers.arrayElement(industries);
            const companyName = faker.company.name();
            const companyId = insertCompany.run(
                companyName,
                `/company-logos/${faker.lorem.slug()}.png`,
                industry,
                `https://${faker.internet.domainName()}`,
                faker.company.catchPhrase() + '. ' + faker.lorem.sentence()
            ).lastInsertRowid as number;
            companies.push(companyId);
        }

        // Applications (10k) with long job descriptions
        const insertApplication = db.prepare(`
            INSERT INTO applications (user_id, company_id, position, stage, date_applied, salary_range, job_description, notes, location, remote, benefits, tech_stack)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

        const techCatalog = [
            'React', 'Next.js', 'TypeScript', 'Node.js', 'GraphQL', 'REST', 'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB',
            'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Tailwind CSS', 'Styled Components', 'Zustand', 'Redux',
            'Jest', 'Vitest', 'Cypress', 'Storybook', 'Express', 'NestJS', 'Prisma', 'Drizzle ORM', 'tRPC', 'Go', 'Python', 'Django', 'FastAPI'
        ];

        const makeLongJD = () => {
            const bullets = Array.from({ length: 12 }, () => `• ${faker.lorem.sentence()}`).join('\n');
            const reqs = Array.from({ length: 10 }, () => `- ${faker.lorem.sentence()}`).join('\n');
            return [
                `${faker.company.catchPhrase()}`,
                '',
                'About the role',
                faker.lorem.paragraphs(3, '\n\n'),
                '',
                'What you will do',
                bullets,
                '',
                'What we are looking for',
                reqs,
                '',
                'Nice to have',
                Array.from({ length: 6 }, () => `- ${faker.lorem.sentence()}`).join('\n'),
                '',
                'Benefits',
                Array.from({ length: 6 }, () => `- ${faker.helpers.arrayElement(['401k match', 'Remote stipend', 'Health, dental & vision', 'Annual learning budget', 'Flexible PTO', 'Parental leave'])}`).join('\n')
            ].join('\n');
        };

        const makeTechStack = () => {
            const size = faker.number.int({ min: 4, max: 9 });
            const picks = faker.helpers.arrayElements(techCatalog, size);
            // Ensure some common anchors appear often
            if (!picks.includes('React') && Math.random() < 0.6) picks.push('React');
            if (!picks.includes('TypeScript') && Math.random() < 0.6) picks.push('TypeScript');
            return Array.from(new Set(picks)).slice(0, 10);
        };

        const makeBenefits = () => Array.from({ length: faker.number.int({ min: 3, max: 7 }) }, () =>
            faker.helpers.arrayElement(['401k match', 'Remote stipend', 'Health, dental & vision', 'Annual learning budget', 'Flexible PTO', 'Parental leave'])
        );

        const now = new Date();
        const start = new Date(now.getFullYear() - 1, 0, 1);

        const BATCH = 1000;
        const TOTAL = 10000;
        for (let i = 0; i < TOTAL; i++) {
            const companyId = companies[i % companies.length];
            const position = faker.helpers.arrayElement(techPositions);
            const stage = faker.helpers.arrayElement(stages);
            const salaryMin = faker.number.int({ min: 80, max: 220 });
            const salaryMax = salaryMin + faker.number.int({ min: 10, max: 60 });
            const dateApplied = faker.date.between({ from: start, to: now }).toISOString().slice(0, 19).replace('T', ' ');
            const location = faker.helpers.arrayElement(['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA']);

            insertApplication.run(
                userId,
                companyId,
                position,
                stage,
                dateApplied,
                `$${salaryMin}k - $${salaryMax}k`,
                makeLongJD(),
                faker.lorem.sentences(2),
                location,
                faker.datatype.boolean({ probability: 0.6 }) ? 1 : 0,
                JSON.stringify(makeBenefits()),
                JSON.stringify(makeTechStack())
            );

            if (i % BATCH === 0 && i > 0) {
                // Yield log every batch
                if (i % (BATCH * 5) === 0) console.log(`  Inserted ${i} applications...`);
            }
        }

        // Create a small number of interviews and contacts to keep seed fast
        const insertInterview = db.prepare(`
            INSERT INTO interviews (application_id, type, scheduled_date, duration, interviewer_name, interviewer_role, notes, outcome)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const interviewTypes = ['phone', 'video', 'onsite', 'technical', 'behavioral'];
        for (let i = 1; i <= 1000; i++) {
            const type = faker.helpers.arrayElement(interviewTypes);
            insertInterview.run(
                i,
                type,
                faker.date.soon({ days: 60 }).toISOString().slice(0, 19).replace('T', ' '),
                type === 'phone' ? 30 : 60,
                faker.person.fullName(),
                faker.person.jobTitle(),
                faker.lorem.sentence(),
                faker.helpers.arrayElement(['pending', 'passed', 'failed'])
            );
        }

        const insertContact = db.prepare(`
            INSERT INTO contacts (user_id, company_id, name, role, email, linkedin, notes, relationship)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (let i = 0; i < 1000; i++) {
            insertContact.run(
                userId,
                faker.helpers.arrayElement(companies),
                faker.person.fullName(),
                faker.person.jobTitle(),
                faker.internet.email(),
                `https://linkedin.com/in/${faker.internet.userName().toLowerCase()}`,
                faker.lorem.sentence(),
                faker.helpers.arrayElement(['recruiter', 'hiring_manager', 'employee', 'referral', 'other'])
            );
        }
    });

    console.time('seed');
    transaction();
    console.timeEnd('seed');

    console.log('✅ Database seeded with 10,000 applications and long job descriptions');
};

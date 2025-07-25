import { db } from './connection';

// Types for database entities
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
}

export interface Company {
    id: number;
    name: string;
    logo?: string;
    industry?: string;
    website?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Application {
    id: number;
    user_id: number;
    company_id: number;
    position: string;
    stage: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
    date_applied: string;
    salary_range?: string;
    job_description?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    company?: Company;
}

export interface Interview {
    id: number;
    application_id: number;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral';
    scheduled_date: string;
    duration?: number;
    interviewer_name?: string;
    interviewer_role?: string;
    notes?: string;
    feedback?: string;
    outcome?: 'pending' | 'passed' | 'failed' | 'cancelled';
    created_at: string;
    updated_at: string;
    application?: Application;
}

export interface Activity {
    id: number;
    user_id: number;
    application_id?: number;
    type: 'application' | 'interview' | 'network' | 'follow_up' | 'offer' | 'rejection';
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    application?: Application;
}

export interface Event {
    id: number;
    user_id: number;
    application_id?: number;
    title: string;
    description?: string;
    event_date: string;
    event_type: 'interview' | 'follow_up' | 'deadline' | 'networking' | 'other';
    is_completed: boolean;
    created_at: string;
    updated_at: string;
    application?: Application;
}

export interface Goal {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    target_value: number;
    current_value: number;
    target_date?: string;
    category: 'applications' | 'interviews' | 'networking' | 'skills' | 'other';
    is_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Contact {
    id: number;
    user_id: number;
    company_id?: number;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    notes?: string;
    relationship: 'recruiter' | 'hiring_manager' | 'employee' | 'referral' | 'other';
    created_at: string;
    updated_at: string;
    company?: Company;
}

// Database service class
export class DatabaseService {
    // User operations
    static getUser(id: number): User | undefined {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id) as User | undefined;
    }

    static getAllUsers(): User[] {
        const stmt = db.prepare('SELECT * FROM users');
        return stmt.all() as User[];
    }

    // Company operations
    static getAllCompanies(): Company[] {
        const stmt = db.prepare('SELECT * FROM companies ORDER BY name');
        return stmt.all() as Company[];
    }

    static getCompany(id: number): Company | undefined {
        const stmt = db.prepare('SELECT * FROM companies WHERE id = ?');
        return stmt.get(id) as Company | undefined;
    }

    // Application operations
    static getAllApplications(userId?: number): Application[] {
        let query = `
      SELECT a.*,
             c.name as company_name,
             c.logo as company_logo,
             c.industry as company_industry,
             c.website as company_website,
             c.description as company_description
      FROM applications a
      LEFT JOIN companies c ON a.company_id = c.id
    `;
        const params: any[] = [];

        if (userId) {
            query += ' WHERE a.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY a.date_applied DESC';

        const stmt = db.prepare(query);
        const results = stmt.all(...params) as any[];

        return results.map(row => ({
            id: row.id,
            user_id: row.user_id,
            company_id: row.company_id,
            position: row.position,
            stage: row.stage,
            date_applied: row.date_applied,
            salary_range: row.salary_range,
            job_description: row.job_description,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            company: row.company_name ? {
                id: row.company_id,
                name: row.company_name,
                logo: row.company_logo,
                industry: row.company_industry,
                website: row.company_website || '',
                description: row.company_description || '',
                created_at: '',
                updated_at: ''
            } : undefined
        }));
    } static getApplication(id: number): Application | undefined {
        const stmt = db.prepare(`
      SELECT a.*, c.name as company_name, c.logo as company_logo, c.industry as company_industry,
             c.website as company_website, c.description as company_description
      FROM applications a
      LEFT JOIN companies c ON a.company_id = c.id
      WHERE a.id = ?
    `);
        const row = stmt.get(id) as any;

        if (!row) return undefined;

        return {
            id: row.id,
            user_id: row.user_id,
            company_id: row.company_id,
            position: row.position,
            stage: row.stage,
            date_applied: row.date_applied,
            salary_range: row.salary_range,
            job_description: row.job_description,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            company: row.company_name ? {
                id: row.company_id,
                name: row.company_name,
                logo: row.company_logo,
                industry: row.company_industry,
                website: row.company_website,
                description: row.company_description,
                created_at: '',
                updated_at: ''
            } : undefined
        };
    }

    static createApplication(data: Partial<Application>): Application {
        const stmt = db.prepare(`
            INSERT INTO applications (user_id, company_id, position, stage, date_applied, salary_range, job_description, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const now = new Date().toISOString();
        const result = stmt.run(
            data.user_id || 1,
            data.company_id,
            data.position,
            data.stage || 'applied',
            data.date_applied || now,
            data.salary_range,
            data.job_description,
            data.notes
        );

        return this.getApplication(result.lastInsertRowid as number)!;
    }

    static updateApplication(id: number, data: Partial<Application>): Application {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.position !== undefined) {
            updates.push('position = ?');
            values.push(data.position);
        }
        if (data.stage !== undefined) {
            updates.push('stage = ?');
            values.push(data.stage);
        }
        if (data.company_id !== undefined) {
            updates.push('company_id = ?');
            values.push(data.company_id);
        }
        if (data.salary_range !== undefined) {
            updates.push('salary_range = ?');
            values.push(data.salary_range);
        }
        if (data.job_description !== undefined) {
            updates.push('job_description = ?');
            values.push(data.job_description);
        }
        if (data.notes !== undefined) {
            updates.push('notes = ?');
            values.push(data.notes);
        }

        if (updates.length === 0) {
            return this.getApplication(id)!;
        }

        updates.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);

        const stmt = db.prepare(`
            UPDATE applications
            SET ${updates.join(', ')}
            WHERE id = ?
        `);

        stmt.run(...values);
        return this.getApplication(id)!;
    }

    static deleteApplication(id: number): void {
        // Delete related records first (foreign key constraints)
        db.prepare('DELETE FROM activities WHERE application_id = ?').run(id);
        db.prepare('DELETE FROM events WHERE application_id = ?').run(id);
        db.prepare('DELETE FROM interviews WHERE application_id = ?').run(id);

        // Delete the application
        db.prepare('DELETE FROM applications WHERE id = ?').run(id);
    }

    // Interview operations
    static getAllInterviews(userId?: number): Interview[] {
        let query = `
      SELECT i.*, a.position, c.name as company_name
      FROM interviews i
      LEFT JOIN applications a ON i.application_id = a.id
      LEFT JOIN companies c ON a.company_id = c.id
    `;
        const params: any[] = [];

        if (userId) {
            query += ' WHERE a.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY i.scheduled_date DESC';

        const stmt = db.prepare(query);
        return stmt.all(...params) as Interview[];
    }

    static getUpcomingInterviews(userId?: number): Interview[] {
        let query = `
      SELECT i.*, a.position, c.name as company_name
      FROM interviews i
      LEFT JOIN applications a ON i.application_id = a.id
      LEFT JOIN companies c ON a.company_id = c.id
      WHERE i.scheduled_date > datetime('now')
    `;
        const params: any[] = [];

        if (userId) {
            query += ' AND a.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY i.scheduled_date ASC';

        const stmt = db.prepare(query);
        return stmt.all(...params) as Interview[];
    }

    // Activity operations
    static getAllActivities(userId?: number): any[] {
        let query = `
      SELECT act.*,
             a.position,
             a.company_id,
             c.name as company_name,
             c.logo as company_logo,
             c.industry as company_industry
      FROM activities act
      LEFT JOIN applications a ON act.application_id = a.id
      LEFT JOIN companies c ON a.company_id = c.id
    `;
        const params: any[] = [];

        if (userId) {
            query += ' WHERE act.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY act.created_at DESC';

        const stmt = db.prepare(query);
        const results = stmt.all(...params) as any[];

        return results.map(row => ({
            id: row.id,
            user_id: row.user_id,
            application_id: row.application_id,
            type: row.type,
            title: row.title,
            description: row.description,
            priority: row.priority,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            application: row.application_id ? {
                id: row.application_id,
                position: row.position,
                company: {
                    id: row.company_id,
                    name: row.company_name,
                    logo: row.company_logo,
                    industry: row.company_industry
                }
            } : undefined,
            company_name: row.company_name
        }));
    }    // Event operations
    static getAllEvents(userId?: number): Event[] {
        let query = `
      SELECT e.*,
             a.position, a.company_id,
             c.name as company_name
      FROM events e
      LEFT JOIN applications a ON e.application_id = a.id
      LEFT JOIN companies c ON a.company_id = c.id
    `;
        const params: any[] = [];

        if (userId) {
            query += ' WHERE e.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY e.event_date ASC';

        const stmt = db.prepare(query);
        const rows = stmt.all(...params) as any[];

        return rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            application_id: row.application_id,
            title: row.title,
            description: row.description,
            event_date: row.event_date,
            event_type: row.event_type,
            is_completed: Boolean(row.is_completed),
            created_at: row.created_at,
            updated_at: row.updated_at
        }));
    }

    static getUpcomingEvents(userId?: number): any[] {
        let query = `
      SELECT e.*,
             a.position,
             a.company_id,
             c.name as company_name,
             c.logo as company_logo,
             c.industry as company_industry
      FROM events e
      LEFT JOIN applications a ON e.application_id = a.id
      LEFT JOIN companies c ON a.company_id = c.id
      WHERE e.event_date > datetime('now') AND e.is_completed = 0
    `;
        const params: any[] = [];

        if (userId) {
            query += ' AND e.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY e.event_date ASC LIMIT 10';

        const stmt = db.prepare(query);
        const results = stmt.all(...params) as any[];

        return results.map(row => ({
            id: row.id,
            user_id: row.user_id,
            application_id: row.application_id,
            title: row.title,
            description: row.description,
            event_date: row.event_date,
            event_type: row.event_type,
            is_completed: row.is_completed,
            created_at: row.created_at,
            updated_at: row.updated_at,
            position: row.position,
            company_name: row.company_name,
            company_logo: row.company_logo,
            company_industry: row.company_industry
        }));
    }

    // Goal operations
    static getAllGoals(userId?: number): Goal[] {
        let query = 'SELECT * FROM goals';
        const params: any[] = [];

        if (userId) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY target_date ASC';

        const stmt = db.prepare(query);
        return stmt.all(...params) as Goal[];
    }

    // Contact operations
    static getAllContacts(userId?: number): Contact[] {
        let query = `
      SELECT cont.*, c.name as company_name
      FROM contacts cont
      LEFT JOIN companies c ON cont.company_id = c.id
    `;
        const params: any[] = [];

        if (userId) {
            query += ' WHERE cont.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY cont.name ASC';

        const stmt = db.prepare(query);
        return stmt.all(...params) as Contact[];
    }

    // Statistics
    static getApplicationStats(userId?: number) {
        const baseQuery = userId ? 'WHERE user_id = ?' : '';
        const params = userId ? [userId] : [];

        const totalApps = db.prepare(`SELECT COUNT(*) as count FROM applications ${baseQuery}`).get(...params) as { count: number };
        const interviews = db.prepare(`
      SELECT COUNT(*) as count FROM interviews i
      JOIN applications a ON i.application_id = a.id
      ${userId ? 'WHERE a.user_id = ?' : ''}
    `).get(...params) as { count: number };

        const offers = db.prepare(`SELECT COUNT(*) as count FROM applications ${baseQuery} AND stage = 'offer'`).get(...params) as { count: number };
        const rejections = db.prepare(`SELECT COUNT(*) as count FROM applications ${baseQuery} AND stage = 'rejected'`).get(...params) as { count: number };

        const responseRate = totalApps.count > 0 ? ((interviews.count / totalApps.count) * 100).toFixed(1) : '0';
        const successRate = totalApps.count > 0 ? ((offers.count / totalApps.count) * 100).toFixed(1) : '0';

        return {
            totalApplications: totalApps.count,
            interviewsScheduled: interviews.count,
            offersReceived: offers.count,
            rejections: rejections.count,
            responseRate: `${responseRate}%`,
            successRate: `${successRate}%`,
            activeApplications: totalApps.count - rejections.count - offers.count
        };
    }
}

'use client';

import React from 'react';
import {
    FileText, BookOpen, Users, Plus, ChevronRight, DollarSign, MapPin,
    Rocket, Mail, Clock, CheckSquare, UserPlus, ExternalLink, Calendar
} from 'lucide-react';
import ActionButton from '../components/dashboard/ActionButton';

// Types (can be moved to a shared types file if reused elsewhere)
interface Company {
    id: string;
    name: string;
    logo: string;
    industry: string;
}

interface Application {
    id: string;
    position: string;
    company: Company;
    dateApplied: Date;
    stage: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
}

interface RecommendedAction {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    type: 'application' | 'follow-up' | 'preparation' | 'networking' | 'skill';
    dueDate?: Date;
}

interface ActionsTabProps {
    recommendedActions: RecommendedAction[];
}

export default function ActionsTab({ recommendedActions }: ActionsTabProps) {
    return (
        <div className="dashboard-grid actions-grid">
            <div className="dashboard-card action-items-card">
                <div className="card-header">
                    <h3 className="card-title">Priority Action Items</h3>
                    <div className="filters">
                        <select className="filter-select">
                            <option value="all">All Types</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="application">Applications</option>
                            <option value="preparation">Preparation</option>
                            <option value="networking">Networking</option>
                            <option value="skill">Skills</option>
                        </select>
                    </div>
                </div>
                <div className="action-items-list">
                    {recommendedActions.map(action => (
                        <div className={`action-item ${action.priority}`} key={action.id}>
                            <div className="action-header">
                                <h4 className="action-title">{action.title}</h4>
                                <div className={`action-type ${action.type}`}>
                                    {action.type === 'follow-up' && <Mail size={16} />}
                                    {action.type === 'application' && <FileText size={16} />}
                                    {action.type === 'preparation' && <BookOpen size={16} />}
                                    {action.type === 'networking' && <Users size={16} />}
                                    {action.type === 'skill' && <Plus size={16} />}
                                    <span>{action.type.replace('-', ' ')}</span>
                                </div>
                            </div>
                            <p className="action-description">{action.description}</p>
                            {action.dueDate && (
                                <div className="action-due-date">
                                    <Clock size={14} />
                                    <span>Due {new Date(action.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            )}
                            <div className="action-buttons">
                                <button className="action-btn primary"><CheckSquare size={14} /><span>Complete</span></button>
                                <button className="action-btn secondary"><Clock size={14} /><span>Snooze</span></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="dashboard-card recommended-jobs-card">
                <div className="card-header">
                    <h3 className="card-title">Recommended Jobs</h3>
                    <ActionButton label="View All" icon={ChevronRight} variant="ghost" size="small" onClick={() => console.log('View all recommended jobs')} />
                </div>
                <div className="recommended-jobs-list">
                    <div className="recommended-job">
                        <div className="job-match-badge">95%</div>
                        <div className="job-content">
                            <div className="job-header">
                                <h4 className="job-title">Senior Frontend Developer</h4>
                                <div className="company-logo"><span>A</span></div>
                            </div>
                            <div className="job-company">Airbnb</div>
                            <div className="job-details">
                                <div className="job-location"><MapPin size={14} /><span>San Francisco (Remote)</span></div>
                                <div className="job-salary"><DollarSign size={14} /><span>$120K - $150K</span></div>
                            </div>
                            <div className="matched-skills">
                                <span className="skill-tag">React</span>
                                <span className="skill-tag">TypeScript</span>
                                <span className="skill-tag">GraphQL</span>
                                <span className="skill-tag">+3</span>
                            </div>
                            <div className="job-actions">
                                <button className="job-action-btn primary"><Rocket size={14} /><span>Quick Apply</span></button>
                                <button className="job-action-btn secondary"><ExternalLink size={14} /><span>View</span></button>
                            </div>
                        </div>
                    </div>
                    <div className="recommended-job">
                        <div className="job-match-badge">92%</div>
                        <div className="job-content">
                            <div className="job-header">
                                <h4 className="job-title">Full Stack Engineer</h4>
                                <div className="company-logo"><span>S</span></div>
                            </div>
                            <div className="job-company">Stripe</div>
                            <div className="job-details">
                                <div className="job-location"><MapPin size={14} /><span>Remote (US)</span></div>
                                <div className="job-salary"><DollarSign size={14} /><span>$130K - $160K</span></div>
                            </div>
                            <div className="matched-skills">
                                <span className="skill-tag">Node.js</span>
                                <span className="skill-tag">React</span>
                                <span className="skill-tag">API Design</span>
                                <span className="skill-tag">+4</span>
                            </div>
                            <div className="job-actions">
                                <button className="job-action-btn primary"><Rocket size={14} /><span>Quick Apply</span></button>
                                <button className="job-action-btn secondary"><ExternalLink size={14} /><span>View</span></button>
                            </div>
                        </div>
                    </div>
                    <div className="recommended-job">
                        <div className="job-match-badge">88%</div>
                        <div className="job-content">
                            <div className="job-header">
                                <h4 className="job-title">UI/UX Developer</h4>
                                <div className="company-logo"><span>F</span></div>
                            </div>
                            <div className="job-company">Figma</div>
                            <div className="job-details">
                                <div className="job-location"><MapPin size={14} /><span>New York, NY</span></div>
                                <div className="job-salary"><DollarSign size={14} /><span>$110K - $140K</span></div>
                            </div>
                            <div className="matched-skills">
                                <span className="skill-tag">UI Design</span>
                                <span className="skill-tag">React</span>
                                <span className="skill-tag">CSS</span>
                                <span className="skill-tag">+2</span>
                            </div>
                            <div className="job-actions">
                                <button className="job-action-btn primary"><Rocket size={14} /><span>Quick Apply</span></button>
                                <button className="job-action-btn secondary"><ExternalLink size={14} /><span>View</span></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-actions centered">
                    <button className="action-btn view-all-jobs"><span>Browse More Jobs</span><ChevronRight size={14} /></button>
                </div>
            </div>
            <div className="dashboard-card networking-card">
                <div className="card-header">
                    <h3 className="card-title">Networking Opportunities</h3>
                    <ActionButton label="Manage" icon={Users} variant="ghost" size="small" onClick={() => console.log('Manage networking')} />
                </div>
                <div className="networking-opportunities">
                    <div className="opportunity">
                        <div className="opportunity-content">
                            <div className="avatar-group">
                                <div className="avatar"><span>J</span></div>
                                <div className="company-logo small"><span>G</span></div>
                            </div>
                            <div className="opportunity-details">
                                <h4 className="contact-name">Jessica Thompson</h4>
                                <div className="contact-role">Engineering Manager at Google</div>
                                <div className="connection-info">
                                    <span>2nd degree connection</span>
                                    <span>• Connected via Alex Kim</span>
                                </div>
                            </div>
                        </div>
                        <div className="opportunity-actions">
                            <button className="network-action-btn primary"><UserPlus size={14} /><span>Connect</span></button>
                            <button className="network-action-btn secondary"><Mail size={14} /><span>Message</span></button>
                        </div>
                    </div>
                    <div className="opportunity">
                        <div className="opportunity-content">
                            <div className="avatar-group">
                                <div className="avatar"><span>M</span></div>
                                <div className="company-logo small"><span>A</span></div>
                            </div>
                            <div className="opportunity-details">
                                <h4 className="contact-name">Michael Chen</h4>
                                <div className="contact-role">Senior Developer at Amazon</div>
                                <div className="connection-info">
                                    <span>Mutual connection</span>
                                    <span>• Viewed your profile</span>
                                </div>
                            </div>
                        </div>
                        <div className="opportunity-actions">
                            <button className="network-action-btn primary"><UserPlus size={14} /><span>Connect</span></button>
                            <button className="network-action-btn secondary"><Mail size={14} /><span>Message</span></button>
                        </div>
                    </div>
                </div>
                <div className="upcoming-events networking-events">
                    <h4 className="section-subtitle">Upcoming Events</h4>
                    <div className="event">
                        <Calendar size={18} className="event-icon" />
                        <div className="event-details">
                            <div className="event-name">Frontend Developer Meetup</div>
                            <div className="event-info">
                                <span>May 15, 2023</span>
                                <span>• Virtual</span>
                                <span>• 45 Attendees</span>
                            </div>
                        </div>
                        <button className="event-action-btn"><span>RSVP</span></button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .dashboard-grid {
          display: grid;
          gap: 24px;
        }

        .actions-grid {
          grid-template-columns: minmax(300px, 2fr) repeat(2, minmax(300px, 1fr));
        }

        .dashboard-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-divider);
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .filters {
          display: flex;
          align-items: center;
        }

        .filter-select {
          padding: 6px 10px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
        }

        .action-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 500px;
        }

        .action-item {
          padding: 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          border-left: 4px solid var(--accent-blue);
        }

        .action-item.high {
          border-left-color: var(--accent-red);
        }

        .action-item.medium {
          border-left-color: var(--accent-orange);
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .action-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .action-type {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--glass-bg);
          color: var(--text-secondary);
        }

        .action-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0 0 12px 0;
        }

        .action-due-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-tertiary);
          margin-bottom: 12px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .action-btn.primary {
          background: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }

        .action-btn.secondary {
          background: transparent;
          color: var(--text-secondary);
          border-color: var(--border-thin);
        }

        .recommended-jobs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 500px;
        }

        .recommended-job {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
        }

        .job-match-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-green);
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .job-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .job-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .job-company {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .job-details {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .job-location, .job-salary {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .matched-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 5px;
        }

        .skill-tag {
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--glass-bg);
          font-size: 12px;
          color: var(--accent-blue);
          font-weight: 500;
        }

        .job-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .job-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .job-action-btn.primary {
          background: var(--accent-blue);
          color: white;
          border: none;
        }

        .job-action-btn.secondary {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-thin);
        }

        .card-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--border-divider);
        }

        .card-actions.centered {
          justify-content: center;
        }

        .networking-opportunities {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .opportunity {
          padding: 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
        }

        .opportunity-content {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }

        .avatar-group {
          position: relative;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .company-logo {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--glass-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .company-logo.small {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          font-size: 10px;
          border: 2px solid var(--hover-bg);
        }

        .opportunity-details {
          flex: 1;
        }

        .contact-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .contact-role {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .connection-info {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .opportunity-actions {
          display: flex;
          gap: 10px;
        }

        .network-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          font-size: 13px;
          font-weight: 500;
          flex: 1;
          justify-content: center;
          cursor: pointer;
        }

        .network-action-btn.primary {
          background: var(--accent-blue);
          color: white;
          border: none;
        }

        .network-action-btn.secondary {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-thin);
        }

        .networking-events {
          margin-top: 10px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .section-subtitle {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 14px 0;
        }

        .event {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
        }

        .event-icon {
          color: var(--accent-blue);
        }

        .event-details {
          flex: 1;
        }

        .event-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .event-info {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .event-action-btn {
          padding: 4px 12px;
          border-radius: var(--border-radius);
          background: var(--accent-blue);
          color: white;
          font-size: 12px;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }

        @media (max-width: 1200px) {
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}

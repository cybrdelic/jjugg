import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import GlassButton from '../components/GlassButton';
import Pill from '../components/Pill';

interface Email {
  id: string;
  date: string;
  subject: string;
  class: string;
  vendor: string;
  application_id: string;
  company?: string;
  position?: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pulling, setPulling] = useState(false);

  const fetchEmails = () => {
    setLoading(true);
    fetch('/api/email/recent')
      .then(res => res.json())
      .then(data => {
        setEmails(data.emails || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load emails');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const pullRecentEmail = async () => {
    setPulling(true);
    setError(null);
    try {
      const res = await fetch('/api/email/pull', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to pull email');
      fetchEmails();
    } catch (err: any) {
      setError(err.message || 'Failed to pull email');
    } finally {
      setPulling(false);
    }
  };

  return (
    <AppLayout currentSection="applications-section">
      <div className="emails-page">
        <h1 className="page-title">Job Application Emails</h1>
        <p className="page-subtitle">Visualizing automated parsing and linking to applications</p>
        <div style={{ marginBottom: 16 }}>
          <GlassButton onClick={pullRecentEmail} disabled={pulling}>
            {pulling ? 'Pulling from IMAP…' : 'Pull Recent Email from IMAP'}
          </GlassButton>
        </div>
        {loading && <div className="loading">Loading emails…</div>}
        {error && <div className="error">{error}</div>}
        <div className="emails-list">
          {emails.length > 0 && (
            <Card key={emails[0].id} className="email-card recent-email">
              <div className="email-header">
                <span className="email-date">{new Date(emails[0].date).toLocaleString()}</span>
                <Pill label={emails[0].class} color={emails[0].class === 'applied' ? 'green' : emails[0].class === 'interview' ? 'blue' : 'gray'} />
                <span className="email-vendor">{emails[0].vendor}</span>
              </div>
              <div className="email-subject">{emails[0].subject}</div>
              {emails[0].company && (
                <div className="email-link">
                  <GlassButton>
                    Linked to: {emails[0].company} — {emails[0].position}
                  </GlassButton>
                </div>
              )}
            </Card>
          )}
          {emails.slice(1).map(email => (
            <Card key={email.id} className="email-card">
              <div className="email-header">
                <span className="email-date">{new Date(email.date).toLocaleString()}</span>
                <Pill label={email.class} color={email.class === 'applied' ? 'green' : email.class === 'interview' ? 'blue' : 'gray'} />
                <span className="email-vendor">{email.vendor}</span>
              </div>
              <div className="email-subject">{email.subject}</div>
              {email.company && (
                <div className="email-link">
                  <GlassButton>
                    Linked to: {email.company} — {email.position}
                  </GlassButton>
                </div>
              )}
            </Card>
          ))}
          {emails.length === 0 && !loading && <div className="empty">No job application emails found.</div>}
        </div>
      </div>
      <style jsx>{`
  .emails-page {
          padding: 32px 0;
          max-width: 700px;
          margin: 0 auto;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .page-subtitle {
          color: #888;
          margin-bottom: 24px;
        }
  .emails-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
  .email-card {
        .recent-email {
          border: 2px solid #4f8cff;
          box-shadow: 0 4px 18px rgba(79,140,255,0.12);
        }
          backdrop-filter: blur(8px);
          background: rgba(255,255,255,0.08);
          border-radius: 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          padding: 18px 22px;
        }
        .email-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }
        .email-date {
          font-size: 0.95em;
          color: #aaa;
        }
        .email-vendor {
          font-size: 0.95em;
          color: #888;
        }
        .email-subject {
          font-size: 1.1em;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .email-link {
          margin-top: 6px;
        }
        .loading, .error, .empty {
          text-align: center;
          margin: 32px 0;
          color: #888;
        }
      `}</style>
    </AppLayout>
  );
}

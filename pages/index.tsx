import Link from 'next/link';

export default function Home() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1>Welcome to JJugg</h1>
      <p>Your workspace for managing applications and timelines.</p>
      <Link href="/dashboard/home" legacyBehavior>
        <a style={{
          display: 'inline-block',
          padding: '0.75rem 1rem',
          background: '#3b82f6',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none'
        }}>
          Go to Dashboard
        </a>
      </Link>
    </div>
  );
}

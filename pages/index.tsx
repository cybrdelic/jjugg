import Link from 'next/link';

export default function Home() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 className="shoutout">Welcome to JJugg</h1>
      <p className="lead">Your workspace for managing applications and timelines.</p>
      <Link href="/dashboard/home" legacyBehavior>
        <a className="btn-primary">
          Go to Dashboard
        </a>
      </Link>
    </div>
  );
}

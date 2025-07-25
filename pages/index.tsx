import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard/home to maintain the same default behavior
    router.replace('/dashboard/home');
  }, [router]);

  return null; // This component doesn't render anything since it redirects
}

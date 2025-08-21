import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LegacyEmailSetupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile');
  }, [router]);
  return null;
}

import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Redirect dashboard to dashboard/home
export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/home');
    }, [router]);

    return null;
}

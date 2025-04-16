'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function MyBookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to the bookings page
    router.push('/bookings');
  }, [router]);

  // Return a simple loading state while redirecting
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Redirecting to My Bookings...</h1>
        <p>Please wait...</p>
      </div>
    </div>
  );
} 
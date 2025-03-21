'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Using required: true tells NextAuth to handle the redirect automatically
  // This could be causing issues if there's a conflict with our manual redirect
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if explicitly unauthenticated
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-gray-700 shadow-lg">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-gray-800 dark:text-white">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (status === 'authenticated' && session) {
    return <>{children}</>;
  }
  
  // Return null for any other state to prevent flashing content
  return null;
} 
// Create a new file: components/SessionDebug.tsx
'use client';
import { useSession } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded shadow text-xs">
      <p>Session status: {status}</p>
      <p>User: {session?.user?.name || 'None'}</p>
    </div>
  );
}
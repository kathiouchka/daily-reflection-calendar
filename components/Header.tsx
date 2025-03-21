'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Daily Phrase</Link>
        
        <div className="flex items-center gap-4">
          {session && (
            <nav className="flex items-center space-x-4">
              <Link 
                href="/" 
                className={`hover:text-blue-300 transition-colors ${pathname === '/' ? 'text-blue-400' : ''}`}
              >
                Today
              </Link>
              <Link 
                href="/calendar" 
                className={`hover:text-blue-300 transition-colors ${pathname === '/calendar' ? 'text-blue-400' : ''}`}
              >
                Calendar
              </Link>
            </nav>
          )}
          
          {/* Only render theme toggle after component is mounted */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
              className="p-2 rounded hover:bg-gray-700"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? "🌞" : "🌜"}
            </button>
          )}
          
          {session && (
            <div className="flex items-center">
              <img 
                src={session.user?.image || '/default-avatar.png'} 
                alt={session.user?.name || 'User'} 
                className="w-8 h-8 rounded-full mr-2"
              />
              <button 
                onClick={() => signOut()} 
                className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

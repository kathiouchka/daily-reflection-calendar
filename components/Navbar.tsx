"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import { getTranslation } from '@/lib/translations';
import LoginButton from './LoginButton';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { locale } = useLanguage();
  const t = (key: string) => getTranslation(key, locale);

  // Avoid hydration mismatch by only rendering theme-dependent elements after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Only determine dark mode on client side after mounting
  const isDarkMode = mounted ? theme === "dark" : false;

  // Don't render anything theme-related until mounted
  if (!mounted) {
    return (
      <nav className="bg-journal-paper dark:bg-slate-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-medium memory-title text-indigo-600 dark:text-indigo-400">
                  {locale === 'fr' ? 'Ma petite question' : 'My little question'}
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Placeholder for theme toggle */}
              <div className="w-9 h-9"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-journal-paper dark:bg-slate-900 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-medium memory-title text-indigo-600 dark:text-indigo-400">
              {locale === 'fr' ? 'Ma petite question' : 'My little question'}
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            {session ? (
              <>
                <Link 
                  href="/calendar" 
                  className="text-[15px] font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  {t('calendar')}
                </Link>
                
                <button 
                  onClick={() => signOut()}
                  className="text-[15px] font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  {t('signOut')}
                </button>
              </>
            ) : (
              <LoginButton />
            )}
            
            <LanguageSwitcher />
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/30 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

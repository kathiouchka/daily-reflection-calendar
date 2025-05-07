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

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDarkMode = mounted ? theme === "dark" : false;

  if (!mounted) {
    return (
      <nav className="bg-journal-paper dark:bg-slate-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight text-brand-primary select-none">
                  {locale === 'fr' ? 'MPQ' : 'MLQ'}
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-journal-paper dark:bg-slate-900 md:backdrop-blur-md md:bg-slate-100/80 dark:md:bg-slate-900/80 md:border-b md:border-slate-200/80 dark:md:border-slate-700/80 sticky top-0 z-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 hover:underline underline-offset-4" aria-label="Accueil">
            <img 
              src="/question_simple_logo.png" 
              alt="Ma petite question logo"
              className="w-10 h-10 sm:w-12 sm:h-12 text-brand-primary"
            />
          </Link>
          <div className="ml-auto flex items-center gap-6">
            {session ? (
              <>
                <Link 
                  href="/calendar" 
                  aria-label={t('calendar')}
                  className="text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary hover:underline underline-offset-4 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="4" fill="none" stroke="currentColor" />
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </Link>
                <button 
                  onClick={() => signOut()}
                  aria-label={t('signOut')}
                  className="text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                  </svg>
                </button>
              </>
            ) : (
              <LoginButton />
            )}
            <LanguageSwitcher />
            <button 
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 20 20" fill="currentColor">
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

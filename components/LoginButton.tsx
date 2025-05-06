// components/LoginButton.tsx
'use client';
import { signIn } from 'next-auth/react';
import { useLanguage } from './LanguageContext';
import { getTranslation } from '@/lib/translations';

export default function LoginButton() {
  const { locale } = useLanguage();
  const t = (key: string) => getTranslation(key, locale);

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center mx-auto px-8 py-3 bg-[#4d78e3] hover:bg-[#3a63c3] text-white rounded-lg transition-colors gap-2 shadow-md"
    >
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
      </svg>
      Sign In
    </button>
  );
}

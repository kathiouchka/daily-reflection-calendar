'use client';

import { useLanguage } from './LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLocale('fr')}
        className={`text-[14px] font-medium px-2 py-1 rounded-md transition-colors duration-200 ${
          locale === 'fr' 
            ? 'text-gray-900 dark:text-white bg-gray-100/50 dark:bg-gray-700/50' 
            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`text-[14px] font-medium px-2 py-1 rounded-md transition-colors duration-200 ${
          locale === 'en' 
            ? 'text-gray-900 dark:text-white bg-gray-100/50 dark:bg-gray-700/50' 
            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
} 
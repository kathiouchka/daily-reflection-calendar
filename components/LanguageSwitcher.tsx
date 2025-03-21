'use client';

import { useLanguage } from './LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLocale('fr')}
        className={`px-2 py-1 text-xs rounded-md ${
          locale === 'fr' 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-2 py-1 text-xs rounded-md ${
          locale === 'en' 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        EN
      </button>
    </div>
  );
} 
'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import LoginButton from '../components/LoginButton';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/translations';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [response, setResponse] = useState('');
  const [phrase, setPhrase] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { locale } = useLanguage();
  const t = (key: string) => getTranslation(key, locale);

  // Fetch the phrase of the day from your API endpoint
  useEffect(() => {
    async function fetchPhrase() {
      try {
        const res = await fetch('/api/phrase');
        if (!res.ok) throw new Error('Failed to fetch phrase');
        const data = await res.json();
        setPhrase(data.phrase?.text);
      } catch (error) {
        console.error('Error fetching phrase:', error);
        setPhrase('Unable to load today\'s phrase.');
      }
    }
    fetchPhrase();
  }, []);

  // Update hasUnsavedChanges when response changes
  useEffect(() => {
    setHasUnsavedChanges(response.trim().length > 0);
  }, [response]);
  
  // Warn before navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle submission or update of daily response
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Improved input validation
    if (!response.trim()) {
      setError('Please enter a response');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (response.length > 1000) {
      setError('Response exceeds maximum length');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Check for potentially malicious content
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(response))) {
      setError('Response contains potentially unsafe content');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Sanitize user input
    const sanitizedResponse = DOMPurify.sanitize(response.trim());
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: sanitizedResponse }),
      });
      
      if (!res.ok) throw new Error('Failed to submit');
      
      setSuccessMessage('Response submitted successfully!');
      setResponse('');
      setHasUnsavedChanges(false);
      
      // Add confetti effect on successful submission
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(confettiContainer);
      
      // Simple confetti animation with CSS
      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'absolute w-2 h-2 bg-blue-500 rounded-full';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
        confetti.style.opacity = Math.random() * 0.5 + 0.5 + '';
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        confettiContainer.appendChild(confetti);
      }
      
      // Remove confetti after animation
      setTimeout(() => {
        document.body.removeChild(confettiContainer);
      }, 5000);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting response:', error);
      setError('Failed to submit. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle keyboard shortcuts for form submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (response.trim()) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  // Update Link to Calendar to include confirmation
  const navigateToCalendar = (e: React.MouseEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/calendar');
      }
    }
  };

  // Loading state with a shorter timeout
  if (status === 'loading') {
    // Add a console log to help with debugging
    console.log('Session loading state:', { status });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-600 dark:text-gray-300">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Daily Phrase</h1>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="text-gray-800 dark:text-gray-200 italic">
                {phrase || 'Loading phrase...'}
              </p>
            </div>
            
            <div className="text-center py-6">
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Please sign in to record your response and view your calendar.
              </p>
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content for logged-in users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </span>
            {t('todaysPhrase')}
          </h1>
          
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="text-gray-800 dark:text-gray-200 italic">
              {phrase || 'Loading phrase...'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('yourResponse')}
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('writePlaceholder')}
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 h-32 resize-none"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                {response.length}/{1000} {t('characters')}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-500 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isSubmitting ? t('submitting') : t('submitResponse')}
            </button>
            
            {successMessage && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 rounded-md border border-green-100 dark:border-green-800 text-center">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-md border border-red-100 dark:border-red-800 text-center">
                {error}
              </div>
            )}
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link 
              href="/calendar" 
              onClick={navigateToCalendar}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <span>{t('viewCalendar')}</span>
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    console.log('Session loading state:', { status });
    
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-300">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg memory-card bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-indigo-900/40 overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="p-10">
            <h1 className="text-3xl font-bold memory-title text-indigo-500 dark:text-indigo-400 mb-6">Ma petite question</h1>
            
            <div className="mb-8 p-6 bg-journal-paper dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
              <p className="text-slate-700 dark:text-slate-200 italic font-serif">
                {phrase || 'Chargement de la question du jour...'}
              </p>
            </div>
            
            <div className="text-center py-8">
              <p className="mb-6 text-slate-600 dark:text-slate-300">
                Connectez-vous pour noter vos souvenirs et consulter votre calendrier.
              </p>
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in state - Response form
  return (
    <div className="min-h-[80vh] py-10">
      <div className="w-full max-w-2xl mx-auto">
        <div className="memory-card mb-10 bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-lg dark:shadow-indigo-900/40 border border-slate-100 dark:border-slate-700">
          <h1 className="text-3xl font-bold memory-title text-indigo-500 dark:text-indigo-400 mb-8">
            {t('todaysQuestion')}
          </h1>

          <div className="mb-8 p-6 bg-journal-paper dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            <p className="text-xl text-slate-700 dark:text-slate-200 italic font-serif">
              {phrase || t('loadingPhrase')}
            </p>
          </div>

          {successMessage && (
            <div className="success-message mb-8 p-6 bg-pastel-green dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
              <p className="flex items-center">
                <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-8 p-6 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
              <p className="flex items-center">
                <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="response" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t('yourResponse')}
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('writeYourThoughts')}
                rows={6}
                className="w-full p-4 textarea-focus border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 resize-none rounded-lg"
                data-gramm="false"
              />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {t('shiftEnterToSubmit')}
              </p>
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !response.trim()}
                className="btn-primary px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('submitting')}</span>
                  </>
                ) : <span>{t('submit')}</span>}
              </button>
            </div>
          </form>

          <div className="mt-20 text-center">
            <Link 
              href="/calendar" 
              onClick={navigateToCalendar}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{t('viewCalendar')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

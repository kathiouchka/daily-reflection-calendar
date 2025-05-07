'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { Permanent_Marker, Inter } from 'next/font/google';

const permanentMarker = Permanent_Marker({ subsets: ['latin'], weight: '400' });
const inter = Inter({ subsets: ['latin'] });

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

  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  // Fetch the phrase of the day
  useEffect(() => {
    async function fetchPhrase() {
      try {
        const res = await fetch('/api/phrase');
        if (!res.ok) throw new Error('Failed to fetch phrase');
        const data = await res.json();
        setPhrase(data.phrase?.text);
      } catch (error) {
        console.error('Error fetching phrase:', error);
        setPhrase(t('loadingErrorPhrase') || 'Unable to load today\'s phrase.');
      }
    }
    fetchPhrase();
  }, [t]);

  // Update hasUnsavedChanges when response changes
  useEffect(() => {
    setHasUnsavedChanges(response.trim().length > 0);
  }, [response]);
  
  // Warn before navigating away with unsaved changes (for authenticated state mainly)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && session) { // Only warn if session exists and changes are present
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, session]);

  // Handle submission or update of daily response (for authenticated users)
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response.trim()) {
      setError(t('pleaseEnterResponse') || 'Please enter a response');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (response.length > 1000) {
      setError(t('responseTooLong') || 'Response exceeds maximum length');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    const suspiciousPatterns = [/<script/i, /javascript:/i, /on\\w+=/i, /data:/i];
    if (suspiciousPatterns.some(pattern => pattern.test(response))) {
      setError(t('unsafeContentError') || 'Response contains potentially unsafe content');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
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
      
      setSuccessMessage(t('responseSubmittedSuccess') || 'Response submitted successfully!');
      setResponse('');
      setHasUnsavedChanges(false);
      
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(confettiContainer);
      
      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'absolute w-2 h-2 bg-blue-500 rounded-full'; // Confetti color can be theme aligned
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
        confetti.style.opacity = Math.random() * 0.5 + 0.5 + '';
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        confettiContainer.appendChild(confetti);
      }
      
      setTimeout(() => {
        if (document.body.contains(confettiContainer)) {
          document.body.removeChild(confettiContainer);
        }
      }, 5000);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting response:', error);
      setError(t('submitFailedError') || 'Failed to submit. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  }, [response, t, setHasUnsavedChanges]); // Added dependencies for useCallback

  // Handle keyboard shortcuts for form submission (authenticated)
  const handleKeyDownAuth = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (response.trim()) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };
  
  // Handle sign-in initiation for unauthenticated users
  const handleSignInAndSave = useCallback(async (event?: React.FormEvent | React.KeyboardEvent) => {
    if (event) event.preventDefault();
    setError('');

    if (!response.trim()) {
      setError(t('pleaseEnterResponseToSave') || 'Please enter a response to save.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem('pendingResponse', response.trim());
      signIn('google', { callbackUrl: window.location.pathname });
    } catch (err) {
      console.error("Error during sign-in initiation:", err);
      setError(t('signInFailedError') || 'Failed to initiate sign-in. Please try again.');
      setTimeout(() => setError(''), 3000);
      setIsSubmitting(false); // Reset if sign-in initiation fails
    }
    // setIsSubmitting(false) will not be hit if signIn navigates away.
    // Button will be gone or page reloads.
  }, [response, t]); // Added dependencies

  // Handle keyboard shortcuts for unauthenticated "Save & Sign In"
  const handleKeyDownUnauth = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (response.trim()) {
        handleSignInAndSave(e);
      }
    }
  };

  // Check for pending response on successful login and auto-submit
  useEffect(() => {
    if (session && status === 'authenticated') {
      const pendingResponseText = localStorage.getItem('pendingResponse');
      if (pendingResponseText) {
        localStorage.removeItem('pendingResponse');
        setResponse(pendingResponseText);
        setIsAutoSubmitting(true); // Signal to auto-submit
      }
    }
  }, [session, status]);

  useEffect(() => {
    if (isAutoSubmitting && response.trim().length > 0 && session) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      setIsAutoSubmitting(false);
    }
  }, [isAutoSubmitting, response, session, handleSubmit]);


  // Update Link to Calendar to include confirmation
  const navigateToCalendar = (e: React.MouseEvent) => {
    if (hasUnsavedChanges && session) { // Only if logged in and has changes
      e.preventDefault();
      if (confirm(t('unsavedChangesConfirm') || 'You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/calendar');
      }
    } else if (!session && response.trim().length > 0) { // Unauthenticated with text in box
        e.preventDefault();
        if (confirm(t('unsavedResponseConfirmUnauth') || 'You have an unsaved response. Sign in to save it, or leave?')) {
             router.push('/calendar'); // Or offer to sign in first: handleSignInAndSave();
        }
    } else {
        router.push('/calendar');
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <main className={`mx-auto max-w-screen-md px-4 sm:px-8 ${inter.className} font-sans`}>
        <div className="min-h-[80vh] flex items-center justify-center bg-brand-surface">
          <div className="animate-pulse text-slate-300">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>{t('loading') || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Unified main content for both authenticated and unauthenticated users
  return (
    <main className={`mx-auto max-w-screen-md px-4 sm:px-8 ${inter.className} font-sans`}>
      <div className="min-h-screen flex flex-col items-center justify-start pt-4 sm:pt-8 md:pt-12">
        <h1 className={`text-center font-bold text-brand-primary mb-6 sm:mb-12 md:mb-16 ${permanentMarker.className} whitespace-nowrap leading-tight tracking-wide drop-shadow-[0_1px_4px_rgba(109,123,255,0.35)]`} style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}>
          {t('mainPageTitle') || 'Ma petite question'}
        </h1>
        <div className="relative w-full max-w-full sm:max-w-2xl md:max-w-3xl bg-white/10 dark:bg-slate-700/40 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/20 ring-1 ring-white/20 dark:ring-slate-700/60 overflow-hidden p-4 sm:p-8 md:p-16 transition-colors duration-200">
          <div className="relative mb-8 sm:mb-12 md:mb-14 p-6 md:p-8 bg-slate-50 dark:bg-slate-700 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner transition-colors duration-200">
            <p className="text-lg sm:text-2xl md:text-3xl text-slate-700 dark:text-slate-200 text-center">
              {phrase || (t('loadingPhrase') || 'Loading question...')}
            </p>
            <svg width="16" height="8" aria-hidden="true" className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 pointer-events-none">
              <polygon points="0,0 16,0 8,8" className="fill-slate-50 dark:fill-slate-700" />
            </svg>
          </div>

          {successMessage && (
            <div className="success-message mb-12 p-4 sm:p-6 md:p-8 bg-green-100 dark:bg-green-700/30 text-green-700 dark:text-green-200 rounded-xl text-lg">
              <p className="flex items-center">
                <svg className="h-6 w-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 sm:mb-8 md:mb-12 p-4 sm:p-6 md:p-8 bg-red-100 dark:bg-red-800/60 text-red-700 dark:text-red-200 rounded-xl text-lg">
              <p className="flex items-center">
                <svg className="h-6 w-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={session ? handleSubmit : (e) => { e.preventDefault(); handleSignInAndSave();}} className="space-y-6 sm:space-y-8 md:space-y-10">
            <div>
              <textarea
                id={session ? "response" : "responseUnauth"}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                onKeyDown={session ? handleKeyDownAuth : handleKeyDownUnauth}
                placeholder={t('writeYourThoughtsHere') || 'Write your thoughts here...'}
                aria-label={t('writeYourThoughtsHere') || 'Write your thoughts here...'}
                rows={7}
                className="w-full p-4 sm:p-6 md:p-8 textarea-focus border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-brand-primary dark:focus:border-brand-primary shadow-inner transition-colors duration-200"
                data-gramm="false"
                style={{ fontSize: 'clamp(1rem, 3.5vw, 1.75rem)' }}
              />
            </div>

            <div className="flex justify-center items-center pt-0.5 pb-0.5 sm:pt-2 sm:pb-2">
              <button
                type="submit"
                disabled={isSubmitting || !response.trim()}
                title={session ? (t('submitAnswer') || 'Submit Answer') : (t('signInAndSave') || 'Save & Sign In')}
                className="p-3 sm:p-4 md:p-5 rounded-full flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 text-white disabled:opacity-50 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-brand-primary dark:focus:ring-brand-primary focus:ring-offset-2 sm:focus:ring-offset-4 focus:ring-offset-white dark:focus:ring-offset-slate-800"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-6 w-6 sm:h-7 sm:w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 sm:mt-16 md:mt-20 text-center">
            <Link 
              href="/calendar" 
              onClick={navigateToCalendar}
              className="text-brand-primary hover:text-brand-primary/90 flex items-center justify-center gap-3 sm:gap-4 text-xl sm:text-2xl transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{t('viewCalendar')}</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

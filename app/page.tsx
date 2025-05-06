'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
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
      <div className="min-h-[80vh] flex items-center justify-center bg-[#181a2e]">
        <div className="animate-pulse text-slate-300">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#4d78e3] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>{t('loading') || 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state - New flow with response form
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-12">{t('mainPageTitle') || 'Ma petite question'}</h1>
        
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 p-8 transition-colors duration-200">
          <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner transition-colors duration-200">
            <p className="text-xl text-slate-700 dark:text-slate-200 italic font-serif text-center">
              {phrase || (t('loadingPhrase') || 'Chargement de la question du jour...')}
            </p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSignInAndSave();}} className="space-y-6">
            <div>
              <textarea
                id="responseUnauth"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                onKeyDown={handleKeyDownUnauth}
                placeholder={t('writeYourThoughtsHere') || 'Write your thoughts here...'}
                aria-label={t('writeYourThoughtsHere') || 'Write your thoughts here...'}
                rows={5}
                className="w-full p-4 textarea-focus border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none rounded-lg focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 shadow-inner transition-colors duration-200"
                data-gramm="false"
              />
            </div>

            {error && (
              <div className="p-3 mb-4 bg-red-100 dark:bg-red-800/60 text-red-700 dark:text-red-200 rounded-lg text-sm text-center">
                <p>{error}</p>
              </div>
            )}
            
            <div className="flex justify-center items-center pt-0.5 pb-0.5">
              <button
                type="submit"
                disabled={isSubmitting || !response.trim()}
                title={t('submitAnswer') || 'Submit Answer'}
                className="p-2 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Logged in state - Response form (mostly existing, ensure colors match)
  return (
    <div className="min-h-[80vh] py-10"> {/* Ensure main bg color */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="memory-card mb-10 bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl dark:shadow-lg dark:shadow-indigo-900/40 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <h1 className="text-3xl font-bold memory-title text-indigo-600 dark:text-indigo-400 mb-8 text-center">
            {t('todaysQuestion')}
          </h1>

          <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner transition-colors duration-200"> {/* Slightly different inner card bg */}
            <p className="text-xl text-slate-700 dark:text-slate-200 italic font-serif text-center">
              {phrase || t('loadingPhrase')}
            </p>
          </div>

          {successMessage && (
            <div className="success-message mb-8 p-6 bg-green-100 dark:bg-green-700/30 text-green-700 dark:text-green-200 rounded-lg"> {/* Adjusted success color for dark theme */}
              <p className="flex items-center">
                <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-8 p-6 bg-red-100 dark:bg-red-800/60 text-red-700 dark:text-red-200 rounded-lg"> {/* Adjusted error color */}
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
              <label htmlFor="response" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
                {t('yourResponse')}
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                onKeyDown={handleKeyDownAuth} // Use authenticated keydown handler
                placeholder={t('writeYourThoughts')}
                rows={6}
                className="w-full p-4 textarea-focus border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none rounded-lg focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 shadow-inner transition-colors duration-200" // Adjusted styles
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
                className="btn-primary px-6 py-3 rounded-lg flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors duration-200" // Unified button style
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
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center justify-center gap-2 transition-colors duration-200" // Unified link color
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

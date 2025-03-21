// components/ResponseForm.tsx
'use client';
import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useTheme } from 'next-themes';

interface ResponseFormProps {
  session: any;
  phrase?: string;
}

export default function ResponseForm({ session, phrase }: ResponseFormProps) {
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!response.trim()) {
      setError('Please enter a response');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Only sanitize on client side after component is mounted
    const sanitizedResponse = mounted ? DOMPurify.sanitize(response.trim()) : response.trim();
    
    setIsSubmitting(true);
    setStatus('');
    setError('');
    
    try {
      const res = await fetch('/api/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: sanitizedResponse }),
      });
      
      if (res.ok) {
        setStatus('Response saved successfully!');
        setResponse('');
        setTimeout(() => setStatus(''), 5000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Failed to save response.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      setError('Error saving response. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Don't render theme-dependent elements until mounted
  if (!mounted) {
    return <div className="w-full max-w-xl">Loading...</div>;
  }

  return (
    <div className="w-full max-w-xl">
      {phrase && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
          <p className="text-gray-800 dark:text-gray-200 italic">{phrase}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="relative">
          <textarea
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 h-32 resize-none"
            placeholder="Write your response for today..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            maxLength={1000}
            required
            disabled={isSubmitting}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
            {response.length}/1000
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`py-2.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            isSubmitting 
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
          } text-white`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Response'
          )}
        </button>
        
        {status && (
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-md text-green-600 dark:text-green-400 text-sm">
            {status}
          </div>
        )}
        
        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

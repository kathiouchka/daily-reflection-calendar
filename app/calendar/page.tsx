// app/calendar/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, subMonths, addMonths } from "date-fns";
import { fr as frLocale, enUS as enUSLocale } from 'date-fns/locale'; // Import locales
import DOMPurify from 'dompurify';
import ProtectedRoute from "../../components/ProtectedRoute";
import { useSession } from "next-auth/react";
import ReactMarkdown from 'react-markdown';
import { Inter } from 'next/font/google';
import { useLanguage } from '@/components/LanguageContext'; // Import useLanguage

const inter = Inter({ subsets: ['latin'] });

// Helper to map app locale to date-fns locale
const getDateFnsLocale = (locale: string) => {
  switch (locale) {
    case 'fr':
      return frLocale;
    case 'en':
    default:
      return enUSLocale;
  }
};

export default function CalendarPage() {
  const { data: session } = useSession();
  const { locale } = useLanguage(); // Get current locale
  const dateFnsLocale = getDateFnsLocale(locale); // Get date-fns locale object

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [phrases, setPhrases] = useState<{ [date: string]: string }>({});
  const [responses, setResponses] = useState<{ [date: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session) return; // Don't fetch data if not authenticated
    
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Get the actual date range displayed in the calendar grid
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
    
    const start = format(calendarStart, "yyyy-MM-dd");
    const end = format(calendarEnd, "yyyy-MM-dd");

    const apiUrl = `/api/calendar?start=${start}&end=${end}`;
    console.log("Fetching calendar data from:", apiUrl);

    async function fetchCalendarData() {
      setIsLoading(true);
      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          console.log("Received data:", data);
          setPhrases(data.phrases);
          setResponses(data.responses);
        } else {
          console.error("Failed to fetch calendar data", res.status);
        }
      } catch (error) {
        console.error("Error fetching calendar data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCalendarData();
  }, [currentMonth, session]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const firstDay = startOfWeek(monthStart, { weekStartsOn: 0 });
  const lastDay = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);

  const days: Date[] = [];
  for (let d = firstDay; d <= lastDay; d = addDays(d, 1)) {
    days.push(d);
  }

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: dateFnsLocale });

  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfWeek(new Date(), { locale: dateFnsLocale, weekStartsOn: 0 }), i);
    return format(day, 'EEE', { locale: dateFnsLocale });
  });

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center p-4 sm:p-8 ${inter.className}`}>
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-6xl relative backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          {/* Mobile-friendly header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 sm:mb-12 gap-4">
            <div className="flex items-center justify-between sm:justify-start space-x-6">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-all duration-300 hover:scale-105"
                aria-label="Previous month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-3xl font-semibold tracking-tight">{monthLabel}</h2>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-all duration-300 hover:scale-105"
                aria-label="Next month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(startOfMonth(today));
                  setSelectedDate(today);
                }}
                className="ml-2 px-5 py-2.5 text-base bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-800 dark:text-white transition-all duration-300 hover:scale-105"
              >
                Today
              </button>
            </div>
          </div>

          {/* Days of the week */}
          <div className="grid grid-cols-7 text-center mb-5">
            {dayNames.map((day) => (
              <div key={day} className="py-3.5 font-medium text-gray-500 dark:text-gray-400 text-base tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div key={currentMonth.toString()} className="grid grid-cols-7 gap-2.5 text-center calendar-fade-in">
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isCurrentMonthDay = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasResponse = Boolean(responses[dateStr]);

              return (
                <div 
                  key={dateStr} 
                  onClick={() => onDateClick(day)} 
                  className={`
                    relative p-3.5 md:p-5 rounded-xl cursor-pointer transition-all duration-300
                    ${!isCurrentMonthDay ? "text-gray-400 dark:text-gray-600" : "text-gray-800 dark:text-white"} 
                    ${isSelected ? "bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-100 shadow-lg scale-105" : 
                      isToday ? "bg-sage-50 dark:bg-sage-800/50 font-medium" : 
                      "hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-105"}
                  `}
                  aria-label={`${format(day, "MMMM d, yyyy", { locale: dateFnsLocale })}${hasResponse ? ", has response" : ""}`}
                  role="button"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-base md:text-lg">{format(day, "d", { locale: dateFnsLocale })}</span>
                    {hasResponse && (
                      <div className="mt-2 w-2.5 h-2.5 rounded-full bg-sage-400 dark:bg-sage-300 animate-fade-in"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected date details */}
          {selectedDate && (
            <div className="mt-10 p-8 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/50 shadow-lg transition-all duration-300 animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white tracking-tight">
                  {format(selectedDate, "MMMM do, yyyy", { locale: dateFnsLocale })}
                </h3>
                {isLoading && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-600/50 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h4 className="text-base font-medium text-gray-500 dark:text-gray-400 mb-3">Daily Phrase</h4>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                    {phrases[format(selectedDate, "yyyy-MM-dd")] || "A new day brings new possibilities..."}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-600/50 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h4 className="text-base font-medium text-gray-500 dark:text-gray-400 mb-3">Your Response</h4>
                  {responses[format(selectedDate, "yyyy-MM-dd")] ? (
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
                      <ReactMarkdown>
                        {responses[format(selectedDate, "yyyy-MM-dd")]}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <p className="text-center text-lg">Un souvenir attend d'être écrit...</p>
                      {format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") && (
                        <Link href="/" className="mt-4 text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300 transition-colors duration-300">
                          Ajouter un souvenir
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-gray-700 shadow-xl">
                <svg className="animate-spin h-8 w-8 text-sage-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-800 dark:text-white">Loading calendar data...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

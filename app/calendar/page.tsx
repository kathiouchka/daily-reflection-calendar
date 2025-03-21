// app/calendar/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, subMonths, addMonths } from "date-fns";
import DOMPurify from 'dompurify';
import ProtectedRoute from "../../components/ProtectedRoute";
import { useSession } from "next-auth/react";
import ReactMarkdown from 'react-markdown';

export default function CalendarPage() {
  const { data: session } = useSession();
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

  const monthLabel = format(currentMonth, "MMMM yyyy");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
          {/* Mobile-friendly header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center justify-between sm:justify-start space-x-4">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors"
                aria-label="Previous month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">{monthLabel}</h2>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors"
                aria-label="Next month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(startOfMonth(today));
                  setSelectedDate(today);
                }}
                className="ml-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-white transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Days of the week */}
          <div className="grid grid-cols-7 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div key={currentMonth.toString()} className="grid grid-cols-7 gap-1 text-center calendar-fade-in">
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
                    relative p-2 md:p-3 rounded-md cursor-pointer transition-all duration-200
                    ${!isCurrentMonthDay ? "text-gray-400 dark:text-gray-600" : "text-gray-800 dark:text-white"} 
                    ${isSelected ? "bg-blue-500 text-white ring-2 ring-blue-300 dark:ring-blue-700" : 
                      isToday ? "bg-blue-100 dark:bg-blue-900 font-bold" : 
                      "hover:bg-gray-100 dark:hover:bg-gray-700"}
                  `}
                  aria-label={`${format(day, "MMMM d, yyyy")}${hasResponse ? ", has response" : ""}`}
                  role="button"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm md:text-base">{format(day, "d")}</span>
                    {hasResponse && (
                      <div className="mt-1 w-2 h-2 rounded-full bg-green-400 dark:bg-green-300"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected date details */}
          {selectedDate && (
            <div className="mt-6 p-5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {format(selectedDate, "MMMM do, yyyy")}
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
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Daily Phrase</h4>
                  <p className="text-gray-800 dark:text-gray-200">
                    {phrases[format(selectedDate, "yyyy-MM-dd")] || "No phrase available for this date."}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your Response</h4>
                  {responses[format(selectedDate, "yyyy-MM-dd")] ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {responses[format(selectedDate, "yyyy-MM-dd")]}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <p className="text-center">No response for this date.</p>
                      {format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") && (
                        <Link href="/" className="mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                          Add a response
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-gray-700 shadow-lg">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

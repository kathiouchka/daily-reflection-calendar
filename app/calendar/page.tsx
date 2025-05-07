// app/calendar/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, subMonths, addMonths, addYears, subDays } from "date-fns";
import { fr as frLocale, enUS as enUSLocale } from 'date-fns/locale'; // Import locales
import DOMPurify from 'dompurify';
import ProtectedRoute from "../../components/ProtectedRoute";
import { useSession } from "next-auth/react";
import ReactMarkdown from 'react-markdown';
import { Inter, Permanent_Marker } from 'next/font/google';
import { useLanguage } from '@/components/LanguageContext'; // Import useLanguage
import { getTranslation } from '@/lib/translations'; // Import getTranslation

const inter = Inter({ subsets: ['latin'] });
const permanentMarker = Permanent_Marker({ weight: '400', subsets: ['latin'] }); // Instantiate Permanent_Marker

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

const capitalizeFirstLetter = (string: string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getRandomElement = (arr: any[] | undefined): any => {
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
};

export default function CalendarPage() {
  const { data: session } = useSession();
  const { locale } = useLanguage(); // Get current locale
  const t = (key: string) => getTranslation(key, locale); // Setup t function
  const dateFnsLocale = getDateFnsLocale(locale); // Get date-fns locale object

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today); // Default to today
  const [phrases, setPhrases] = useState<{ [date: string]: string }>({});
  const [responses, setResponses] = useState<{ [date: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCalendarModal, setIsLoadingCalendarModal] = useState(false); // Loading state for modal calendar

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDisplayMonth, setCalendarDisplayMonth] = useState(startOfMonth(selectedDate));

  useEffect(() => {
    if (!session || !selectedDate) return;

    async function fetchDataForDayAcrossYears() {
      setIsLoading(true);
      let newPhrasesData = {};
      let newResponsesData = {};

      try {
        // Fetch data for the month of the selectedDate (covers current year's phrase and responses)
        const monthStartForSelected = startOfMonth(selectedDate);
        const monthEndForSelected = endOfMonth(selectedDate);
        const apiCalendarStart = format(startOfWeek(monthStartForSelected, { weekStartsOn: 0 }), "yyyy-MM-dd");
        const apiCalendarEnd = format(addDays(startOfWeek(monthEndForSelected, { weekStartsOn: 0 }), 6), "yyyy-MM-dd");
        
        console.log("Fetching data for current year month (main view):", apiCalendarStart, "-", apiCalendarEnd);
        const currentYearMonthRes = await fetch(`/api/calendar?start=${apiCalendarStart}&end=${apiCalendarEnd}`);
        if (currentYearMonthRes.ok) {
          const data = await currentYearMonthRes.json();
          newPhrasesData = { ...newPhrasesData, ...data.phrases };
          newResponsesData = { ...newResponsesData, ...data.responses };
        } else {
          console.error("Failed to fetch current year month data (main view)", currentYearMonthRes.status);
        }

        // Fetch specific data for selectedDate in previous years
        const yearsToFetch = [selectedDate.getFullYear() - 1, selectedDate.getFullYear() - 2];
        for (const year of yearsToFetch) {
          const dateInPrevYear = new Date(year, selectedDate.getMonth(), selectedDate.getDate());
          if (dateInPrevYear.getMonth() !== selectedDate.getMonth()) continue;

          const dateStrPrevYear = format(dateInPrevYear, "yyyy-MM-dd");
          console.log("Fetching data for previous year date (main view):", dateStrPrevYear);
          const prevYearRes = await fetch(`/api/calendar?start=${dateStrPrevYear}&end=${dateStrPrevYear}`);
          if (prevYearRes.ok) {
            const data = await prevYearRes.json();
            newPhrasesData = { ...newPhrasesData, ...data.phrases };
            newResponsesData = { ...newResponsesData, ...data.responses };
          } else {
            console.error(`Failed to fetch data for ${dateStrPrevYear} (main view)`, prevYearRes.status);
          }
        }
        
        setPhrases(prev => ({ ...prev, ...newPhrasesData }));
        setResponses(prev => ({ ...prev, ...newResponsesData }));

      } catch (error) {
        console.error("Error fetching calendar data across years (main view)", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataForDayAcrossYears();
  }, [selectedDate, session]);

  useEffect(() => {
    if (!session || !showCalendarModal) return;

    async function fetchModalCalendarData() {
      setIsLoadingCalendarModal(true);
      const monthStart = startOfMonth(calendarDisplayMonth);
      const monthEnd = endOfMonth(calendarDisplayMonth);
      const calendarGridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarGridEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
      
      const startStr = format(calendarGridStart, "yyyy-MM-dd");
      const endStr = format(calendarGridEnd, "yyyy-MM-dd");

      console.log("Fetching data for modal calendar month:", startStr, "-", endStr);
      try {
        const res = await fetch(`/api/calendar?start=${startStr}&end=${endStr}`);
        if (res.ok) {
          const data = await res.json();
          setPhrases(prev => ({ ...prev, ...data.phrases }));
          setResponses(prev => ({ ...prev, ...data.responses }));
        } else {
          console.error("Failed to fetch modal calendar data", res.status);
        }
      } catch (error) {
        console.error("Error fetching modal calendar data", error);
      } finally {
        setIsLoadingCalendarModal(false);
      }
    }
    fetchModalCalendarData();
  }, [calendarDisplayMonth, session, showCalendarModal]);

  const handlePreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const handleGoToToday = () => {
    setSelectedDate(today);
    setCalendarDisplayMonth(startOfMonth(today)); // Also reset modal calendar month
  };

  const formattedSelectedDate = capitalizeFirstLetter(format(selectedDate, "MMMM do, yyyy", { locale: dateFnsLocale }));

  const questionForSelectedDate = phrases[format(selectedDate, "yyyy-MM-dd")] || 
                                (isLoading ? t('calendarLoadingQuestion') : t('calendarNoQuestion'));

  const displayYears = [
    selectedDate.getFullYear(),
    selectedDate.getFullYear() - 1,
    selectedDate.getFullYear() - 2,
  ];

  // --- Monthly Calendar Modal Logic ---
  const modalCalendarMonthLabel = capitalizeFirstLetter(format(calendarDisplayMonth, "MMMM yyyy", { locale: dateFnsLocale }));
  const modalCalendarDayNames = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfWeek(new Date(), { locale: dateFnsLocale, weekStartsOn: 0 }), i);
    return format(day, 'EEE', { locale: dateFnsLocale });
  });

  const modalCalendarDays: Date[] = [];
  if (showCalendarModal) {
    const monthStart = startOfMonth(calendarDisplayMonth);
    const monthEnd = endOfMonth(calendarDisplayMonth);
    const firstDay = startOfWeek(monthStart, { weekStartsOn: 0 });
    const lastDay = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
    for (let d = firstDay; d <= lastDay; d = addDays(d, 1)) {
      modalCalendarDays.push(d);
    }
  }
  
  const onModalDateClick = (day: Date) => {
    setSelectedDate(day);
    setShowCalendarModal(false);
  };
  // --- End Monthly Calendar Modal Logic ---

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col items-center p-4 sm:p-8 ${inter.className}`}>
        <h1 className={`text-center font-bold text-brand-primary mb-6 sm:mb-12 md:mb-16 ${permanentMarker.className} whitespace-nowrap leading-tight tracking-wide drop-shadow-[0_1px_4px_rgba(109,123,255,0.35)]`} style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}>
          {t('calendarPageTitle')}
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-3xl relative backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          
          {/* Date Navigation & Calendar Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 sm:mb-12 gap-4">
            <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4">
              <button 
                onClick={handlePreviousDay}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-all duration-300 hover:scale-105"
                aria-label={String(t('calendarPreviousDay'))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 
                className="text-base sm:text-lg font-medium tracking-tight text-center sm:text-left whitespace-nowrap cursor-pointer hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                onClick={() => {
                  setCalendarDisplayMonth(startOfMonth(selectedDate));
                  setShowCalendarModal(true);
                }}
              >
                {formattedSelectedDate}
              </h3>
              <button 
                onClick={handleNextDay}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-all duration-300 hover:scale-105"
                aria-label={String(t('calendarNextDay'))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3 mt-4 sm:mt-0">
              <button
                onClick={handleGoToToday}
                className="px-4 py-2 sm:px-5 sm:py-2.5 text-base sm:text-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-800 dark:text-white transition-all duration-300 hover:scale-105"
              >
                {t('today')}
              </button>
            </div>
          </div>

          {/* Question of the Day Section - Replicated from app/page.tsx for consistency */}
          <div className="relative mb-8 sm:mb-12 md:mb-14 text-center">
            <div className="relative p-6 md:p-8 bg-slate-50 dark:bg-slate-700 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner transition-colors duration-200">
              <p className="text-lg sm:text-2xl md:text-3xl text-slate-700 dark:text-slate-200 text-center">
                {questionForSelectedDate}
              </p>
              <svg width="16" height="8" aria-hidden="true" className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 pointer-events-none">
                <polygon points="0,0 16,0 8,8" className="fill-slate-50 dark:fill-slate-700" />
              </svg>
            </div>
          </div>

          {/* Yearly Answers Section */}
          {isLoading && !Object.keys(responses).length ? ( // Show main loader only if no responses yet and loading
             <div className="flex flex-col items-center justify-center py-10">
                <svg className="animate-spin h-8 w-8 text-sage-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 dark:text-white">{t('calendarLoadingAnswers')}</span>
              </div>
          ) : (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              {displayYears.map(year => {
                const dateForYear = new Date(year, selectedDate.getMonth(), selectedDate.getDate());
                // Handle invalid dates like Feb 29 in non-leap years by checking if month changed after setting date
                const isValidDateForYear = dateForYear.getMonth() === selectedDate.getMonth();
                const dateStrForYear = isValidDateForYear ? format(dateForYear, "yyyy-MM-dd") : null;
                const responseForYear = dateStrForYear ? responses[dateStrForYear] : undefined;
                const isFutureDate = dateForYear > today && !isSameDay(dateForYear, today);

                if (!isValidDateForYear) return null; // Don't render for invalid dates like Feb 29 in non-leap

                let noResponseMessageKey = t('calendarNoResponseForYear');
                let noResponseMessage = typeof noResponseMessageKey === 'string' ? noResponseMessageKey.replace("{year}", year.toString()) : "Error displaying message.";

                if (!responseForYear && !isFutureDate && dateForYear < today) {
                  const pastFunny = t('calendarPastNoResponseFunny');
                  if (Array.isArray(pastFunny)) {
                    noResponseMessage = getRandomElement(pastFunny);
                  }
                }

                let futureDateMessage = t('calendarFutureDate');
                if (typeof futureDateMessage !== 'string') futureDateMessage = String(futureDateMessage); // Ensure it's a string

                if (isFutureDate) {
                    const futureRandom = t('calendarFutureDateRandom');
                    if(Array.isArray(futureRandom)) {
                        let randomFutureMsg = getRandomElement(futureRandom);
                        // Replace placeholder if it exists in the chosen string
                        if (typeof randomFutureMsg === 'string') {
                             const yearsDiff = dateForYear.getFullYear() - today.getFullYear();
                             futureDateMessage = randomFutureMsg.replace("{years}", yearsDiff.toString());
                        } else {
                            futureDateMessage = String(randomFutureMsg); // Fallback
                        }
                    } else {
                        // Fallback if t('calendarFutureDateRandom') is not an array for some reason
                        futureDateMessage = String(futureRandom); 
                    }
                }

                return (
                  <div key={year} className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
                    <h5 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{year}</h5>
                    {isLoading && !responseForYear && !isFutureDate ? (
                       <p className="text-lg font-normal text-gray-500 dark:text-gray-400">{t('calendarLoadingResponse')}</p>
                    ): responseForYear ? (
                      <div className="prose prose-lg dark:prose-invert max-w-none break-words">
                        <ReactMarkdown>{responseForYear}</ReactMarkdown>
                      </div>
                    ) : isFutureDate ? (
                       <p className="text-lg font-normal text-gray-500 dark:text-gray-400">{futureDateMessage}</p>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        <p className="text-lg font-normal">{noResponseMessage}</p>
                        {year === today.getFullYear() && isSameDay(dateForYear, today) && (
                           <Link href="/" className="mt-2 inline-block text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300 transition-colors duration-300">
                            {t('calendarAddTodaysMemory')}
                          </Link>
                        )}
                         {year === today.getFullYear() && dateForYear < today && !isSameDay(dateForYear,today) && (
                           <Link href={`/?date=${format(dateForYear, "yyyy-MM-dd")}`} className="mt-2 inline-block text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300 transition-colors duration-300">
                            {t('calendarAddMemoryForThisDay')}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* General loading overlay for main view */}
          {isLoading && (
            <div className="fixed top-4 right-4 z-20">
              <div className="flex items-center p-3 rounded-lg bg-white dark:bg-gray-700 shadow-lg">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-sage-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-700 dark:text-white">{t('loading')}...</span>
              </div>
            </div>
          )}

          {/* Monthly Calendar Modal */}
          {showCalendarModal && (
            <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCalendarDisplayMonth(subMonths(calendarDisplayMonth, 1))}
                    className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label={String(t('calendarModalPreviousMonth'))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">{modalCalendarMonthLabel}</h3>
                  <button
                    onClick={() => setCalendarDisplayMonth(addMonths(calendarDisplayMonth, 1))}
                    className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label={String(t('calendarModalNextMonth'))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 text-center mb-3">
                  {modalCalendarDayNames.map((dayName) => (
                    <div key={dayName} className="py-2 font-medium text-sm text-gray-500 dark:text-gray-400">
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid in Modal */}
                {isLoadingCalendarModal && !modalCalendarDays.length ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t('calendarModalLoadingCalendar')}</div>
                ) : (
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {modalCalendarDays.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const isCurrentDisplayMonthDay = isSameMonth(day, calendarDisplayMonth);
                      const isModalToday = isSameDay(day, today);
                      const isModalSelected = isSameDay(day, selectedDate);
                      const hasResponse = Boolean(responses[dateStr]);

                      return (
                        <div
                          key={dateStr}
                          onClick={() => onModalDateClick(day)}
                          className={`
                            relative p-2 md:p-3 rounded-lg cursor-pointer transition-all duration-200
                            ${!isCurrentDisplayMonthDay ? "text-gray-300 dark:text-gray-600/70" : "text-gray-700 dark:text-gray-200"}
                            ${isModalSelected ? "bg-sage-500 text-white font-semibold ring-2 ring-sage-600 dark:ring-sage-400" :
                              isModalToday ? "bg-sage-100 dark:bg-sage-800/60 font-medium" :
                              isCurrentDisplayMonthDay ? "hover:bg-gray-100 dark:hover:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"}
                          `}
                          aria-label={`${capitalizeFirstLetter(format(day, "MMMM d, yyyy", { locale: dateFnsLocale }))}${hasResponse ? String(t('calendarDayHasResponseSuffix')) : ""}`}
                        >
                          <span className="text-sm md:text-base">{format(day, "d")}</span>
                          {hasResponse && isCurrentDisplayMonthDay && (
                            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sage-400 dark:bg-sage-300"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="mt-6 w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-white transition-colors"
                >
                  {t('calendarModalCloseButton')}
                </button>
                 {isLoadingCalendarModal && (
                    <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                        <svg className="animate-spin h-6 w-6 text-sage-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

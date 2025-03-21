import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import Providers from '@/components/Providers';
import SessionDebug from '@/components/Sessiondebug';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Daily Phrase',
  description: 'A daily phrase app with calendar view',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-grow flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-7xl">
              {children}
            </div>
          </main>
          <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
            <p>Daily Phrase App — Reflect on something new every day</p>
          </footer>
          {process.env.NODE_ENV === 'development' && <SessionDebug />}
        </Providers>
      </body>
    </html>
  );
}

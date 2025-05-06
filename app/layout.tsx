import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import Providers from '@/components/Providers';
import SessionDebug from '@/components/Sessiondebug';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ma petite question',
  description: 'Une application pour écrire des souvenirs quotidiens',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-journal-paper dark:bg-slate-900 text-slate-700 dark:text-slate-200 min-h-screen flex flex-col transition-colors duration-200`}>
        <Providers>
          <Navbar />
          <main className="flex-grow flex items-center justify-center py-16 px-6 transition-colors duration-200">
            <div className="w-full max-w-5xl">
              {children}
            </div>
          </main>
          {process.env.NODE_ENV === 'development' && <SessionDebug />}
        </Providers>
      </body>
    </html>
  );
}

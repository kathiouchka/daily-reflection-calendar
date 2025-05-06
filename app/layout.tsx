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
      <body className={`${inter.className} bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 text-slate-700 dark:text-slate-200 min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-grow flex items-center justify-center py-16 px-6">
            <div className="w-full max-w-5xl">
              {children}
            </div>
          </main>
          <footer className="py-8 px-8 text-center text-sm text-slate-500 dark:text-slate-400 mt-10">
            <p>Ma petite question — Capturez vos souvenirs précieux chaque jour</p>
          </footer>
          {process.env.NODE_ENV === 'development' && <SessionDebug />}
        </Providers>
      </body>
    </html>
  );
}

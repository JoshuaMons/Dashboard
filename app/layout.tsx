import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'Chatbot Dashboard',
  description: 'Analyseer je chatbot handover data met interactieve grafieken en inzichten.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`
        }} />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <DatabaseProvider>{children}</DatabaseProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

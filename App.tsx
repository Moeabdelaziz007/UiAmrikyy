import React, { useState, createContext, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import LoginPage from './components/LoginPage';
import DesktopManager from './components/os/DesktopManager'; // Import the new DesktopManager

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { themes, Theme } from './lib/themes';

// Language Context
interface LanguageContextType {
    lang: 'en' | 'ar';
    setLang: (lang: 'en' | 'ar') => void;
}
export const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => {},
});

// Notification Context
interface NotificationContextType {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
}
export const NotificationContext = createContext<NotificationContextType>({
    notificationsEnabled: true,
    setNotificationsEnabled: () => {},
});

// TTS Context
interface TTSContextType {
    selectedVoice: string;
    setSelectedVoice: (voice: string) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
}
export const TTSContext = createContext<TTSContextType>({
    selectedVoice: 'Zephyr', // Default value
    setSelectedVoice: () => {},
    playbackSpeed: 1.0,
    setPlaybackSpeed: () => {},
});


// AppProviders component to wrap the entire application with contexts
const AppProviders: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'ar'>(() => {
    const savedLang = localStorage.getItem('amrikyy-lang');
    return savedLang === 'ar' ? 'ar' : 'en';
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('amrikyy-notifications-enabled');
    return saved === 'false' ? false : true;
  });
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem('amrikyy-tts-voice') || 'Zephyr';
  });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('amrikyy-tts-speed');
    return saved ? parseFloat(saved) : 1.0;
  });


  useEffect(() => {
    localStorage.setItem('amrikyy-notifications-enabled', String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('amrikyy-tts-voice', selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    localStorage.setItem('amrikyy-tts-speed', String(playbackSpeed));
  }, [playbackSpeed]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = lang;
    document.body.className = lang === 'ar' ? 'font-arabic' : 'font-sans';
    localStorage.setItem('amrikyy-lang', lang);
  }, [lang]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const languageContextValue = useMemo(() => ({ lang, setLang }), [lang]);
  const notificationContextValue = useMemo(() => ({ notificationsEnabled, setNotificationsEnabled }), [notificationsEnabled]);
  const ttsContextValue = useMemo(() => ({ selectedVoice, setSelectedVoice, playbackSpeed, setPlaybackSpeed }), [selectedVoice, playbackSpeed]);

  return (
    <ThemeProvider>
      <LanguageContext.Provider value={languageContextValue}>
        <NotificationContext.Provider value={notificationContextValue}>
          <TTSContext.Provider value={ttsContextValue}>
            <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} isOffline={isOffline} />
          </TTSContext.Provider>
        </NotificationContext.Provider>
      </LanguageContext.Provider>
    </ThemeProvider>
  );
};

interface AppContentProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  isOffline: boolean;
}

const AppContent: React.FC<AppContentProps> = ({ isAuthenticated, setIsAuthenticated, isOffline }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme.mode);
  }, [theme.mode]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${theme.mode} h-screen w-screen overflow-hidden ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}
         style={{ background: theme.colors.background, color: theme.colors.text }}>
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[10001] p-3 bg-warning text-center text-text font-semibold"
          >
            {lang === 'en' ? 'You are currently offline. Some features may be limited.' : 'أنت غير متصل بالإنترنت حالياً. قد تكون بعض الميزات محدودة.'}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Render the new DesktopManager for the full OS experience */}
      <DesktopManager />
    </div>
  );
};

export default AppProviders;
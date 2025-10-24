import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useWindowStore from '../../stores/windowStore';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { List, Mic } from 'lucide-react';
import { allApps } from '../../lib/apps';
import { WindowData } from '../../types';
import VoiceAssistant from './VoiceAssistant';

interface TaskbarProps {
  onToggleAppLauncher: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ onToggleAppLauncher }) => {
  const { theme } = useTheme();
  const { lang } = useContext(LanguageContext);
  const currentGlobalText = translations.global[lang];

  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const { focusWindow, minimizeWindow } = useWindowStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVoiceAssistantVisible, setVoiceAssistantVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleTaskbarIconClick = (id: string) => {
    if (id === activeWindowId) {
        minimizeWindow(id);
    } else {
        focusWindow(id);
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-14 bg-surface/80 backdrop-blur-xl border-t border-white/20 flex items-center justify-between px-2 sm:px-4 z-[9999]"
        style={{
          background: `rgba(${theme.mode === 'dark' ? '30, 41, 59' : '255, 255, 255'} 0.8)`,
          borderColor: theme.colors.border,
        }}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onToggleAppLauncher}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
            style={{ background: theme.colors.primary }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={currentGlobalText.start}
          >
            <List />
          </motion.button>
        </div>

        <div className="flex-1 flex justify-center items-center h-full px-2 overflow-x-auto">
          <div className="flex items-center gap-2">
          {Object.values(windows).map((win: WindowData) => {
             const appDef = allApps.find(app => app.id === win.appId);
             const Icon = appDef?.icon;
             if (!Icon) return null;

             const isActive = win.id === activeWindowId && win.state !== 'minimized';

             return (
              <motion.button
                key={win.id}
                onClick={() => handleTaskbarIconClick(win.id)}
                className="relative h-10 w-10 flex items-center justify-center rounded-lg hover:bg-white/10"
                title={appDef.name[lang]}
                whileHover={{ y: -2 }}
              >
                <Icon className="w-6 h-6 text-text" />
                <AnimatePresence>
                  {(isActive || win.state === 'minimized') && (
                      <motion.div
                      className="absolute bottom-0 h-1 w-4 rounded-full bg-primary"
                      style={{ background: theme.colors.primary }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
             );
          })}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-text-secondary text-center">
           <motion.button
            onClick={() => setVoiceAssistantVisible(prev => !prev)}
            className={`flex items-center justify-center h-10 w-10 rounded-full text-text transition-colors ${isVoiceAssistantVisible ? 'bg-primary/20' : 'hover:bg-white/10'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle Voice Assistant"
          >
            <Mic />
          </motion.button>

          <div>
            <div>{currentTime.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs hidden sm:block">{currentTime.toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
        </div>
      </motion.div>
      
      <VoiceAssistant 
        isVisible={isVoiceAssistantVisible} 
        onClose={() => setVoiceAssistantVisible(false)} 
      />
    </>
  );
};

export default Taskbar;
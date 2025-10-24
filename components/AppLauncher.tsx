import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allApps } from '../lib/apps';
import useWindowStore from '../stores/windowStore';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { Search } from 'lucide-react';
import AgentCard from './AgentCard'; // Re-using AgentCard for consistency

interface AppLauncherProps {
  isVisible: boolean;
  onClose: () => void;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ isVisible, onClose }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const { openWindow } = useWindowStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = allApps.filter(app =>
    app.name[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description[lang].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLaunch = (appId: string) => {
    const app = allApps.find(a => a.id === appId);
    if (app) {
      openWindow(app);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9998] bg-black/50 flex flex-col items-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="relative mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-text-secondary" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search apps and agents...' : 'ابحث عن التطبيقات والوكلاء...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface/80 border border-border rounded-full pl-14 pr-6 py-4 text-lg text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{ background: theme.colors.surface, borderColor: theme.colors.border }}
                autoFocus
              />
            </div>
          </motion.div>

          <motion.div
            className="flex-1 w-full max-w-4xl p-8 overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence>
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }}
              >
                {filteredApps.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                  >
                    <AgentCard
                      app={app}
                      isActive={false} // Launcher cards are not "active"
                      onClick={() => handleLaunch(app.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppLauncher;
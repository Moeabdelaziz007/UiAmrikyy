import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { allApps } from '../../lib/apps';
import useWindowStore from '../../stores/windowStore';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, X } from 'lucide-react';
import AgentCard from '../AgentCard';

interface StartMenuProps {
  onClose: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onClose }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const { openWindow } = useWindowStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = allApps.filter(app =>
    app.name[lang].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLaunch = (appId: string) => {
    const app = allApps.find(a => a.id === appId);
    if (app) {
      // Pass the fully localized app definition to openWindow
      openWindow({ ...app, name: { en: app.name.en, ar: app.name.ar } });
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[95vw] max-w-2xl h-[70vh] max-h-[600px] bg-surface/80 backdrop-blur-xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden border-t border-x border-white/20 z-[9998]"
      style={{
        background: `rgba(${theme.mode === 'dark' ? '30, 41, 59' : '255, 255, 255'} 0.8)`,
        borderColor: theme.colors.border,
      }}
    >
      <header className="p-4 flex items-center justify-between border-b" style={{ borderColor: theme.colors.border }}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search for apps...' : 'ابحث عن تطبيقات...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2 text-text focus:ring-2 focus:ring-primary focus:border-transparent"
              style={{ background: theme.colors.background, borderColor: theme.colors.border }}
              autoFocus
            />
          </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <AgentCard
              key={app.id}
              app={app}
              isActive={false}
              onClick={() => handleLaunch(app.id)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StartMenu;
import React from 'react';
import { motion } from 'framer-motion';
import { AppDefinition } from '../../types';

interface DesktopIconProps {
  app: AppDefinition;
  onLaunch: (appId: string) => void;
  lang: 'en' | 'ar';
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ app, onLaunch, lang }) => {
  const { name, icon: Icon } = app;

  return (
    <motion.div
      className="flex flex-col items-center gap-1 w-20 text-center cursor-pointer group"
      onDoubleClick={() => onLaunch(app.id)}
      whileHover={{ scale: 1.1 }}
      title={name[lang]}
    >
      <div className="p-2 rounded-lg group-hover:bg-white/10 transition-colors">
        <Icon className="w-10 h-10 text-white drop-shadow-lg" />
      </div>
      <p className="text-white text-xs font-medium truncate w-full p-1 rounded group-hover:bg-primary/50"
         style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
      >
        {name[lang]}
      </p>
    </motion.div>
  );
};

export default DesktopIcon;
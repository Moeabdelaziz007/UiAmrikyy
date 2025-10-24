import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import { AppDefinition } from '../types'; // Import AppDefinition

interface AgentCardProps {
  // Use the new AppDefinition type
  app: AppDefinition;
  isActive: boolean;
  onClick: (id: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ app, isActive, onClick }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentThemeColors = theme.colors;

  const getAppColorClasses = (colorName: string, isGradient: boolean = false) => {
    switch (colorName) {
      case 'blue': return isGradient ? `from-${currentThemeColors.primary} to-${currentThemeColors.secondary}` : currentThemeColors.primary;
      case 'purple': return isGradient ? `from-${currentThemeColors.secondary} to-${currentThemeColors.accent}` : currentThemeColors.secondary;
      case 'green': return isGradient ? `from-${currentThemeColors.accent} to-${currentThemeColors.primary}` : currentThemeColors.primary;
      case 'cyan': return isGradient ? `from-${currentThemeColors.secondary} to-${currentThemeColors.primary}` : currentThemeColors.secondary;
      case 'orange': return isGradient ? `from-${currentThemeColors.accent} to-${currentThemeColors.secondary}` : currentThemeColors.accent;
      case 'indigo': return isGradient ? `from-${currentThemeColors.primary} to-${currentThemeColors.accent}` : currentThemeColors.primary;
      case 'red': return isGradient ? `from-red-500 to-orange-500` : 'red-500'; // Specific for media/video, can be themed
      case 'pink': return isGradient ? `from-pink-500 to-purple-500` : 'pink-500'; // Specific for communicator, can be themed
      case 'emerald': return isGradient ? `from-${currentThemeColors.accent} to-${currentThemeColors.primary}` : currentThemeColors.accent; // For coding
      case 'amber': return isGradient ? `from-amber-500 to-yellow-500` : 'amber-500'; // For system apps
      case 'gray': return isGradient ? `from-gray-500 to-gray-600` : 'gray-500'; // For system apps
      default: return isGradient ? `from-gray-500 to-gray-600` : 'gray-500';
    }
  };

  const cardBgClass = isActive
    ? `bg-gradient-to-br ${getAppColorClasses(app.color, true)} text-white shadow-xl scale-105`
    : `${currentThemeColors.surface} text-text border border-border hover:shadow-lg hover:scale-[1.02]`;

  const iconColorClass = isActive ? 'text-white' : `text-${app.color}-500`; // Icon color

  return (
    <motion.button
      whileHover={{ scale: isActive ? 1.05 : 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(app.id)}
      className={`relative p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-200 cursor-pointer ${cardBgClass}`}
      aria-label={`${app.name[lang]} App`} // Updated aria-label
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-200 ${isActive ? 'bg-white/30' : `bg-${app.color}-100/${theme.mode === 'dark' ? '20' : '80'}`}`}>
        <app.icon className={`w-8 h-8 transition-colors duration-200 ${iconColorClass}`} />
      </div>
      <h3 className={`text-xl font-bold mb-1 ${isActive ? 'text-white' : 'text-text'}`}>
        {app.name[lang]}
      </h3>
      <p className={`text-sm ${isActive ? 'text-white/80' : 'text-text-secondary'}`}>
        {app.description[lang]}
      </p>
    </motion.button>
  );
};

export default AgentCard;
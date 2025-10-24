import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../App'; // Import LanguageContext
import GeminiLogo from './os/GeminiLogo'; // Import the new logo

interface DesktopProps {
  // Removed lang prop
}

const Desktop: React.FC<DesktopProps> = () => { // Removed lang from props
  const { theme } = useTheme();
  const { lang } = useContext(LanguageContext); // Use lang from context directly

  const content = {
    en: {
      mainText: "Amrikyy QuantumOS",
      subText: "Powered By Gemini Pro",
    },
    ar: {
      mainText: "Amrikyy QuantumOS",
      subText: "مدعوم من Gemini Pro",
    }
  };

  const currentThemeColors = theme.colors;

  // Set the root element's font based on language
  useEffect(() => {
    document.documentElement.style.fontFamily = lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif';
  }, [lang]);
  
  return (
    <div
      className={`fixed inset-0 w-full h-full ${currentThemeColors.background} -z-10 overflow-hidden`}
    >
      {/* Animated Aurora Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-aurora-pulse-1 animate-aurora-move-1" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-aurora-pulse-2 animate-aurora-move-2" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-aurora-pulse-1 delay-1s animate-aurora-move-1 delay-1s" />
        <div className="absolute bottom-1/2 left-1/3 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-aurora-pulse-2 delay-2s animate-aurora-move-2 delay-2s" />
      </div>

      {/* Futuristic Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 animate-grid-pan" style={{
        backgroundImage: `radial-gradient(${currentThemeColors.textSecondary} 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
      }}></div>

      <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-4">
        <GeminiLogo className="w-24 h-24 mb-4 text-text" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent`}
          style={{ backgroundImage: currentThemeColors.gradient }}
          key={`${lang}-${theme.id}-osName`}
        >
          {content[lang].mainText}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={`mt-4 text-xl md:text-2xl text-text-secondary tracking-wider`}
          key={`${lang}-${theme.id}-poweredBy`}
        >
          {content[lang].subText}
        </motion.p>
      </div>
    </div>
  );
};

export default Desktop;
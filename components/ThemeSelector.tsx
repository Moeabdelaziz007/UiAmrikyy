import React, { useContext } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import { LanguageContext } from '../App';
import { Palette, Check } from 'lucide-react'; // Import icons
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

interface ThemeSelectorProps {
  // Removed language prop, now using useContext(LanguageContext)
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  const { lang } = useContext(LanguageContext); // Use lang from LanguageContext
  const currentThemeColors = theme.colors;

  const [isOpen, setIsOpen] = React.useState(false); // State to manage dropdown visibility

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg border text-text bg-background hover:bg-opacity-80 transition-all`}
        // FIX: Complete the style object for the button background.
        style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-text-secondary" />
          <span className="font-medium">
            {lang === 'en' ? theme.name : theme.nameAr}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-10 w-full mt-2 rounded-lg shadow-xl overflow-hidden border border-white/20`}
            style={{ background: currentThemeColors.surface }}
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {availableThemes.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  whileHover={{ backgroundColor: currentThemeColors.background }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                    theme.id === t.id ? 'bg-background' : ''
                  }`}
                  style={{ color: currentThemeColors.text, background: theme.id === t.id ? currentThemeColors.background : currentThemeColors.surface }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{ background: t.colors.primary }}
                    ></span>
                    <span>{lang === 'en' ? t.name : t.nameAr}</span>
                  </div>
                  {theme.id === t.id && (
                    <Check className="w-5 h-5 text-primary" style={{ color: currentThemeColors.primary }} />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
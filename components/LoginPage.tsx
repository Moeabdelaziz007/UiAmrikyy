import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const currentText = translations.global[lang]; // Use global translations

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      onLogin();
    } else {
      setError(currentText.loginError);
    }
  };

  const currentThemeColors = theme.colors;

  return (
    <div className={`fixed inset-0 w-full h-full ${currentThemeColors.background} overflow-hidden flex items-center justify-center`}
         // Removed inline fontFamily here as it's set globally in App.tsx now
         >
      {/* Animated Gradient Background */}
      <div 
        className={`absolute inset-0 bg-[length:200%_200%] animate-gradient opacity-60`}
        style={{ backgroundImage: currentThemeColors.gradient }}
      />
      {/* Futuristic Grid Overlay */}
      <div className={`absolute inset-0 z-0 opacity-10`} style={{
        backgroundImage: `radial-gradient(${currentThemeColors.textSecondary} 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
      }}></div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 p-8 md:p-12 rounded-2xl shadow-2xl max-w-md w-full text-center border border-white/20"
        style={{ background: currentThemeColors.surface }}
      >
        <h1 className={`text-4xl sm:text-5xl font-bold mb-2 text-transparent bg-clip-text`}
            style={{ backgroundImage: currentThemeColors.gradient }}
        >
          {currentText.appName}
        </h1>
        <p className={`text-lg sm:text-xl text-text-secondary mb-8`}>
          {currentText.poweredBy}
        </p>

        <h2 className={`text-2xl sm:text-3xl font-semibold mb-6 text-text`}>
          {currentText.loginHeader}
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="text"
            placeholder={currentText.usernamePlaceholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full p-3 rounded-lg border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`}
            style={{ borderColor: currentThemeColors.border }}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder={currentText.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-lg border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`}
            style={{ borderColor: currentThemeColors.border }}
            autoComplete="current-password"
          />
          {error && <p className="text-error text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className={`w-full p-3 rounded-lg text-white font-semibold bg-primary hover:opacity-90 transition-colors`}
            style={{ background: currentThemeColors.primary }}
          >
            {currentText.loginButton}
          </button>
          <button
            type="button"
            onClick={onLogin} // Guest login bypasses credentials
            className={`w-full p-3 rounded-lg text-text font-semibold bg-surface hover:opacity-90 transition-colors`}
            style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border, border: '1px solid' }}
          >
            {currentText.loginAsGuest}
          </button>
        </form>
        <p className={`mt-8 text-sm text-text-secondary`}>
          {currentText.loginPrompt}
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
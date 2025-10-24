import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext, NotificationContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSelector } from '../components/ThemeSelector';
import { translations } from '../lib/i18n';
import VoiceSettings from '../components/os/VoiceSettings'; // Import the new VoiceSettings
import { Cog, Palette, Mic } from 'lucide-react';

const SettingsApp: React.FC = () => {
    const { lang, setLang } = useContext(LanguageContext);
    const { notificationsEnabled, setNotificationsEnabled } = useContext(NotificationContext);
    const currentText = translations.global[lang];
    const { theme } = useTheme();

    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: currentText.generalSettings, icon: Cog },
        { id: 'appearance', label: lang === 'en' ? 'Appearance' : 'المظهر', icon: Palette },
        { id: 'voice', label: lang === 'en' ? 'Voice & TTS' : 'الصوت و TTS', icon: Mic },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'appearance':
                return (
                    <div>
                         <h2 className="text-xl font-semibold mb-3">{lang === 'en' ? 'Appearance Settings' : 'إعدادات المظهر'}</h2>
                        <div className="space-y-4">
                             <div>
                                <label className="block mb-2 font-medium text-text-secondary">{currentText.theme}</label>
                                <ThemeSelector />
                            </div>
                        </div>
                    </div>
                );
            case 'voice':
                return <VoiceSettings />;
            case 'general':
            default:
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-3">{currentText.generalSettings}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 font-medium text-text-secondary">{currentText.language}</label>
                                <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'ar')} className="w-full p-2 rounded bg-background border text-text" style={{ borderColor: theme.colors.border }}>
                                    <option value="en">{currentText.english}</option>
                                    <option value="ar">{currentText.arabic}</option>
                                </select>
                            </div>
                             <div>
                                <label className="block mb-2 font-medium text-text-secondary">{currentText.notifications}</label>
                                <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white/10" style={{background: 'transparent'}}>
                                    <div className="relative">
                                        <input type="checkbox" checked={notificationsEnabled} onChange={e => setNotificationsEnabled(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </div>
                                    <span className="ms-3 text-sm font-medium text-text">{currentText.enableNotifications}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col bg-background text-text">
            <header className="p-4 border-b flex-shrink-0" style={{ borderColor: theme.colors.border }}>
                <h1 className="text-2xl font-bold">{currentText.settings}</h1>
            </header>
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <nav className="w-full md:w-48 border-b md:border-b-0 md:border-r p-2 flex-shrink-0" style={{ borderColor: theme.colors.border }}>
                    <ul className="flex flex-row md:flex-col gap-1 overflow-x-auto custom-scrollbar md:overflow-x-visible">
                        {tabs.map(tab => (
                            <li key={tab.id} className="flex-shrink-0 md:flex-shrink">
                                <button 
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 text-left p-2 rounded-md text-sm transition-colors ${activeTab === tab.id ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-white/10'}`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <main className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default SettingsApp;
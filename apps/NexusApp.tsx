import React, { useState, useContext } from 'react';
import { TaskHistoryEntry } from '../types';
// FIX: Changed to a named import to resolve module resolution error.
import { SharedMediaLounge } from '../components/apps/nexus/SharedMediaLounge';
import VibeCodingSpace from '../components/apps/nexus/VibeCodingSpace';
import NexusSocialPanel from '../components/apps/nexus/NexusSocialPanel';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import { Video, Code } from 'lucide-react';

type NexusTab = 'lounge' | 'coding';

const NexusApp: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const currentText = translations.agents.nexus[lang];
    const [activeTab, setActiveTab] = useState<NexusTab>('lounge');

    const tabs = [
        { id: 'lounge', label: currentText.tasks.sharedLounge, icon: Video },
        { id: 'coding', label: currentText.tasks.vibeCodingSpace, icon: Code },
    ];

    return (
        <div className="h-full flex flex-col md:flex-row bg-background text-text p-2 gap-2">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex border-b flex-shrink-0" style={{ borderColor: theme.colors.border }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as NexusTab)}
                            className={`flex-shrink-0 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-primary border-b-2' : 'text-text-secondary hover:bg-white/5'}`}
                            style={{ borderColor: activeTab === tab.id ? theme.colors.primary : 'transparent' }}
                        >
                            <tab.icon size={16} />
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="flex-1 relative">
                    {activeTab === 'lounge' && <SharedMediaLounge onTaskComplete={onTaskComplete} />}
                    {activeTab === 'coding' && <VibeCodingSpace onTaskComplete={onTaskComplete} />}
                </div>
            </div>

            {/* Persistent Social Panel */}
            <NexusSocialPanel />
        </div>
    );
};

export default NexusApp;

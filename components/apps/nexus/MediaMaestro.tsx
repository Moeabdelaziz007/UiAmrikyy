import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../../../App';
import { useTheme } from '../../../contexts/ThemeContext';
import { translations } from '../../../lib/i18n';
import { TaskHistoryEntry } from '../../../types';
import { Wand2, Loader } from 'lucide-react';
import { playBase64Audio } from '../../../utils/audio';

interface MediaMaestroProps {
    videoTitle: string;
    onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const MediaMaestro: React.FC<MediaMaestroProps> = ({ videoTitle, onTaskComplete }) => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const currentText = translations.agents.nexus[lang];

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');

    const speakText = async (text: string) => {
        try {
            const response = await fetch('http://localhost:3000/api/agents/translator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'textToVoice', text, language: lang })
            });
            if (!response.ok) throw new Error('Failed to generate audio');
            const data = await response.json();
            if (data.audioContent) {
                playBase64Audio(data.audioContent);
            }
        } catch (error) {
            console.error('TTS Error:', error);
        }
    };

    const handleAction = async (taskType: 'summarizeVideo' | 'contextualSearch') => {
        if (!videoTitle) return;
        setIsLoading(true);
        setResult('');

        try {
            const response = await fetch(`http://localhost:3000/api/agents/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: taskType, 
                    title: videoTitle, // for summarize
                    query: videoTitle  // for contextual search
                }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to get AI response');
            }
            const data = await response.json();
            setResult(data.result);
            speakText(data.result); // Speak the result
            onTaskComplete({
                id: Date.now().toString(),
                agentId: 'media',
                agentName: 'Media Maestro',
                taskType: taskType,
                taskInput: { title: videoTitle },
                taskOutput: data.result,
                timestamp: new Date().toISOString(),
                status: 'success',
            });
        } catch (error: any) {
            setResult(`Error: ${error.message}`);
             onTaskComplete({
                id: Date.now().toString(),
                agentId: 'media',
                agentName: 'Media Maestro',
                taskType: taskType,
                taskInput: { title: videoTitle },
                taskOutput: { error: error.message },
                timestamp: new Date().toISOString(),
                status: 'error',
                errorMessage: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full bg-surface rounded-lg p-3 flex flex-col">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 border-b pb-2" style={{ borderColor: theme.colors.border }}>
                <Wand2 size={18} className="text-secondary" style={{ color: theme.colors.secondary }} />
                {currentText.tasks.aiAssistant}
            </h3>

            <div className="space-y-2 mb-3">
                <button
                    onClick={() => handleAction('summarizeVideo')}
                    disabled={isLoading}
                    className="w-full text-sm p-2 rounded-md bg-background border hover:bg-white/5 disabled:opacity-50"
                    style={{ borderColor: theme.colors.border }}
                >
                    {currentText.tasks.summarizeVideo}
                </button>
                <button
                    onClick={() => handleAction('contextualSearch')}
                    disabled={isLoading}
                    className="w-full text-sm p-2 rounded-md bg-background border hover:bg-white/5 disabled:opacity-50"
                    style={{ borderColor: theme.colors.border }}
                >
                    {currentText.tasks.suggestRelated}
                </button>
            </div>

            <div className="flex-1 bg-background rounded p-2 text-sm overflow-y-auto custom-scrollbar">
                {isLoading && <Loader className="mx-auto my-4 animate-spin" />}
                <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-pre-wrap"
                    >
                        {result}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MediaMaestro;
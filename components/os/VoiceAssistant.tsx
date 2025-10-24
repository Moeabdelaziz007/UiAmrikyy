import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../App';
import { translations } from '../../lib/i18n';
import useWindowStore from '../../stores/windowStore';
import { allApps } from '../../lib/apps';
import useTaskHistoryStore from '../../stores/taskHistoryStore';
import useVoiceInput from '../../hooks/useVoiceInput';
import useTTS from '../../hooks/useTTS';
import VoiceWaveform from './VoiceWaveform';

type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceAssistantProps {
    isVisible: boolean;
    onClose: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isVisible, onClose }) => {
    const { theme } = useTheme();
    const { lang } = useContext(LanguageContext);
    const { openWindow } = useWindowStore();
    const { addTask } = useTaskHistoryStore();
    
    const [state, setState] = useState<AssistantState>('idle');
    const [transcript, setTranscript] = useState('');
    const [feedbackText, setFeedbackText] = useState('');

    const { isListening, finalTranscript, interimTranscript, startListening, stopListening, error: voiceError } = useVoiceInput();
    const { speak, isSpeaking, cancel } = useTTS();

    useEffect(() => {
        if (!isVisible) {
            cancel();
            if (isListening) stopListening();
            setState('idle');
            setTranscript('');
            setFeedbackText('');
        }
    }, [isVisible, cancel, isListening, stopListening]);

    useEffect(() => {
      // Automatically stop listening if there's a pause after final transcript is received.
        if (finalTranscript && isListening) {
            stopListening();
            handleCommand(finalTranscript);
        }
    }, [finalTranscript, isListening, stopListening]);

     useEffect(() => {
        const fullTranscript = (finalTranscript ? finalTranscript + ' ' : '') + interimTranscript;
        setTranscript(fullTranscript);
    }, [interimTranscript, finalTranscript]);

    useEffect(() => {
        if (state === 'speaking' && !isSpeaking) {
            setState('idle');
        }
    }, [isSpeaking, state]);

    const handleCommand = async (command: string) => {
        setState('processing');
        setFeedbackText(translations.global[lang].loading);
        let resultText = "Sorry, I couldn't understand that.";

        try {
            const response = await fetch('http://localhost:3000/api/voice-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to process command');
            }

            const result = await response.json();

            switch(result.action) {
                case 'openApp':
                    const appToOpen = allApps.find(app => 
                        app.name.en.toLowerCase() === result.appName.toLowerCase() || 
                        app.id.toLowerCase() === result.appName.toLowerCase() || 
                        app.name.ar.toLowerCase() === result.appName.toLowerCase()
                    );
                    if (appToOpen) {
                        openWindow(appToOpen);
                        resultText = `Opening ${appToOpen.name[lang]}.`;
                    } else {
                        resultText = `Sorry, I couldn't find an app named ${result.appName}.`;
                    }
                    break;
                case 'executeWorkflow':
                    // In a real scenario, this would trigger the orchestrator
                    // For now, we just give feedback.
                    resultText = `Starting workflow for: ${result.prompt}`;
                    break;
                case 'speak':
                    resultText = result.text;
                    break;
                default:
                    resultText = "Sorry, I couldn't process that command.";
            }

            addTask({
                id: Date.now().toString(),
                agentId: 'voiceControl',
                agentName: 'Voice Assistant',
                taskType: 'Parse Command',
                taskInput: command,
                taskOutput: result,
                timestamp: new Date().toISOString(),
                status: 'success'
            });

        } catch (error: any) {
            resultText = `Error: ${error.message}`;
            setState('error');
            addTask({
                id: Date.now().toString(),
                agentId: 'voiceControl',
                agentName: 'Voice Assistant',
                taskType: 'Parse Command',
                taskInput: command,
                taskOutput: { error: error.message },
                timestamp: new Date().toISOString(),
                status: 'error',
                errorMessage: error.message
            });
        }
        
        setFeedbackText(resultText);
        setState('speaking');
        speak(resultText);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-20 right-4 w-80 bg-surface/80 backdrop-blur-xl rounded-lg shadow-2xl border flex flex-col z-[10000]"
                    style={{ borderColor: theme.colors.border }}
                >
                    <header className="flex items-center justify-between p-2 border-b" style={{ borderColor: theme.colors.border }}>
                        <h3 className="text-sm font-semibold text-text">{lang === 'en' ? 'Voice Assistant' : 'المساعد الصوتي'}</h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button>
                    </header>

                    <div className="flex-1 p-4 flex flex-col items-center justify-center text-center min-h-[150px]">
                        <AnimatePresence mode="wait">
                            {state === 'listening' && (
                                <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-12 w-full">
                                    <VoiceWaveform />
                                </motion.div>
                            )}
                            {state === 'processing' && (
                                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Loader className="w-8 h-8 animate-spin text-primary" style={{color: theme.colors.primary}} />
                                </motion.div>
                            )}
                             {(state === 'idle' || state === 'speaking' || state === 'error') && (
                                <motion.p key="text" className="text-sm text-text-secondary">
                                    {feedbackText || (voiceError || (lang === 'en' ? 'Press the mic and speak a command.' : 'اضغط على الميكروفون وتحدث بأمر.'))}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <p className="mt-2 text-text text-sm min-h-[2.5em]">{transcript}</p>
                    </div>

                    <div className="p-4 border-t flex justify-center" style={{ borderColor: theme.colors.border }}>
                        <motion.button
                            onClick={isListening ? stopListening : startListening}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors text-white ${
                                isListening ? 'bg-red-500' : 'bg-primary'
                            }`}
                            style={{ backgroundColor: isListening ? theme.colors.error : theme.colors.primary }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Mic size={24} />
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VoiceAssistant;

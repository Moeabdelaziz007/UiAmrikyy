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
    }, [isVisible]);

    useEffect(() => {
      // Automatically stop listening if there's a pause after final transcript is received.
        if (finalTranscript && isListening) {
            stopListening();
            handleCommand(finalTranscript);
        }
    }, [finalTranscript, isListening]);

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
                    resultText = await handleExecuteWorkflow(result.prompt);
                    break;
                case 'speak':
                    resultText = result.text;
                    break;
                default:
                    throw new Error('Unknown action from voice command processor.');
            }
        } catch (e) {
            const error = e as Error;
            resultText = `An error occurred: ${error.message}`;
            setState('error');
        } finally {
            setState('speaking');
            setFeedbackText(resultText);
            speak(resultText);
        }
    };

    const handleExecuteWorkflow = async (prompt: string): Promise<string> => {
        setFeedbackText(translations.global[lang].aiPlanning);
        let stepOutputs: Record<string, any> = {};
        try {
            const planResponse = await fetch(`http://localhost:3000/api/orchestrator`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
            if (!planResponse.ok) throw new Error('Failed to get workflow plan.');
            const workflow = await planResponse.json();
            addTask({ id: `workflow-${Date.now()}`, agentId: 'orchestrator', agentName: 'Orchestrator', taskType: 'Plan Workflow', taskInput: { prompt }, taskOutput: workflow, timestamp: new Date().toISOString(), status: 'success' });

            for (let i = 0; i < workflow.steps.length; i++) {
                const step = workflow.steps[i];
                setFeedbackText(`${translations.global[lang].workflowStep} ${i + 1}: ${step.agentId}...`);
                const resolvedInput = JSON.parse(JSON.stringify(step.taskInput).replace(/\{\{steps\.([^}]+)\}\}/g, (_, path) => {
                    const value = path.split('.').reduce((acc: any, part: string) => acc && acc[part], stepOutputs);
                    return value;
                }));

                const stepResponse = await fetch(`http://localhost:3000/api/agents/${step.agentId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: step.taskType, ...resolvedInput }) });
                if (!stepResponse.ok) { const err = await stepResponse.json(); throw new Error(`Step ${i + 1} (${step.agentId}) failed: ${err.error}`); }
                const stepResult = await stepResponse.json();
                stepOutputs[step.id] = stepResult;
                addTask({ id: `step-${Date.now()}-${i}`, agentId: step.agentId, agentName: step.agentId.charAt(0).toUpperCase() + step.agentId.slice(1), taskType: step.taskType, taskInput: resolvedInput, taskOutput: stepResult, timestamp: new Date().toISOString(), status: 'success', workflowStep: i + 1 });
            }

            const finalResult = stepOutputs[workflow.steps[workflow.steps.length - 1].id];
            let summary = "I've completed the workflow.";
             if (typeof finalResult === 'object' && finalResult !== null) {
                if (finalResult.summary) summary = finalResult.summary;
                else if (finalResult.text) summary = finalResult.text;
                else if (finalResult.translatedText) summary = `The translation is: ${finalResult.translatedText}`;
                else if (finalResult.message) summary = finalResult.message;
                else if(finalResult.result) summary = finalResult.result;
            } else if (typeof finalResult === 'string') { summary = finalResult; }
            return summary;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addTask({ id: `workflow-error-${Date.now()}`, agentId: 'orchestrator', agentName: 'Orchestrator', taskType: 'Execute Workflow', taskInput: { prompt }, taskOutput: { error: errorMessage }, timestamp: new Date().toISOString(), status: 'error', errorMessage: errorMessage });
            throw new Error(errorMessage);
        }
    };
    
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            setTranscript('');
            setFeedbackText('');
            startListening();
        }
    };
    
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed bottom-20 right-5 z-[10000] w-96 max-w-[calc(100vw-2.5rem)] bg-surface/90 backdrop-blur-md rounded-lg shadow-2xl p-4 flex flex-col text-text border"
                    style={{ borderColor: theme.colors.border }}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">{translations.global[lang].mainAITitle}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
                    </div>

                    <div className="flex-1 text-sm text-text-secondary min-h-[6rem]">
                      {transcript && <p className="font-semibold text-text">{transcript}</p>}
                      {feedbackText && <p className="mt-1">{feedbackText}</p>}
                      {voiceError && <p className="mt-1 text-error">{voiceError}</p>}
                    </div>

                    <div className="flex justify-center items-center mt-2">
                      <motion.button
                          onClick={toggleListening}
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors duration-300 ${isListening ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ backgroundColor: isListening ? theme.colors.error : theme.colors.primary }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                      >
                          {state === 'processing' ? <Loader className="animate-spin" /> : <Mic size={32} />}
                      </motion.button>
                    </div>
                    
                    <div className="h-8 mt-2">
                        {isListening && <VoiceWaveform />}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VoiceAssistant;
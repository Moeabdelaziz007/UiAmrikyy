import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Settings, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../App';
import { translations } from '../../lib/i18n';
import VoiceWaveform from './VoiceWaveform';
import useWindowStore from '../../stores/windowStore';
import { allApps } from '../../lib/apps';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { encode, decode, decodeAudioData } from '../../utils/audio';
import useTaskHistoryStore from '../../stores/taskHistoryStore';
import { TaskHistoryEntry } from '../../types';


type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

// Define a local `LiveSession` interface based on its usage, as it's not exported from the library.
interface LiveSession {
    close(): void;
    sendRealtimeInput(input: { media: Blob }): void;
    sendToolResponse(response: { functionResponses: { id: string; name: string; response: { result: any; }; }; }): void;
}

const VoiceAssistant: React.FC = () => {
    const { theme } = useTheme();
    const { lang } = useContext(LanguageContext);
    const { openWindow } = useWindowStore();
    const { addTask } = useTaskHistoryStore();
    
    const [state, setState] = useState<AssistantState>('idle');
    const [isExpanded, setIsExpanded] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');
    const [modelTranscript, setModelTranscript] = useState('');
    const [feedbackText, setFeedbackText] = useState('');

    const sessionRef = useRef<LiveSession | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const aiRef = useRef<GoogleGenAI | null>(null);

    // Function Declarations for Gemini
    const openAppFunctionDeclaration: FunctionDeclaration = {
      name: 'openApp',
      parameters: {
        type: Type.OBJECT,
        description: 'Opens a specified application on the OS desktop.',
        properties: {
          appName: {
            type: Type.STRING,
            description: 'The name of the application to open, e.g., "File Manager", "Terminal", "Settings", or any of the AI agents like "Navigator" or "Coding Agent".',
          },
        },
        required: ['appName'],
      },
    };

    const executeWorkflowFunctionDeclaration: FunctionDeclaration = {
      name: 'executeWorkflow',
      parameters: {
        type: Type.OBJECT,
        description: 'Executes a complex multi-step workflow by planning and coordinating with various AI agents. Use this for any request that requires more than one action, such as planning a trip, researching a topic and summarizing it, or finding information and then acting on it.',
        properties: {
          prompt: {
            type: Type.STRING,
            description: 'The complex user request. For example: "Plan a 3-day trip to Paris", "Find the best coffee shops near me and then get directions to the top-rated one.", or "What was the weather like in London yesterday and can you email a summary to my friend?".',
          },
        },
        required: ['prompt'],
      },
    };

    const handleOpenApp = (appName: string) => {
        const appToOpen = allApps.find(app => app.name.en.toLowerCase() === appName.toLowerCase() || app.id.toLowerCase() === appName.toLowerCase());
        if (appToOpen) {
            openWindow(appToOpen);
            return `Opening ${appToOpen.name[lang]}.`;
        } else {
            return `Sorry, I couldn't find an app named ${appName}.`;
        }
    };

    const handleExecuteWorkflow = async (prompt: string): Promise<string> => {
        setFeedbackText(lang === 'en' ? `Planning request: "${prompt}"` : `تخطيط الطلب: "${prompt}"`);
        let finalResult: any = `Workflow for "${prompt}" initiated.`;

        try {
            // 1. Get workflow from orchestrator
            const planResponse = await fetch(`http://localhost:3000/api/orchestrator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!planResponse.ok) throw new Error('Failed to get workflow plan.');

            const workflow = await planResponse.json();
            
            // Log the overall plan
            addTask({
                id: `workflow-${Date.now()}`,
                agentId: 'orchestrator',
                agentName: 'Orchestrator',
                taskType: 'Plan Workflow',
                taskInput: { prompt },
                taskOutput: workflow,
                timestamp: new Date().toISOString(),
                status: 'success',
            });

            setFeedbackText(lang === 'en' ? `Executing ${workflow.steps.length}-step plan...` : `تنفيذ خطة من ${workflow.steps.length} خطوات...`);

            let stepInput = workflow.initialInput || {};

            // 2. Execute each step
            for (let i = 0; i < workflow.steps.length; i++) {
                const step = workflow.steps[i];
                setFeedbackText(lang === 'en' ? `Step ${i + 1}: Running ${step.agentId}...` : `الخطوة ${i + 1}: تشغيل ${step.agentId}...`);
                
                const currentStepInput = { ...step.taskInput, ...stepInput };

                const stepResponse = await fetch(`http://localhost:3000/api/agents/${step.agentId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: step.taskType, ...currentStepInput }),
                });

                if (!stepResponse.ok) {
                    const errorData = await stepResponse.json();
                    throw new Error(`Step ${i + 1} (${step.agentId}) failed: ${errorData.error}`);
                }
                
                const stepResult = await stepResponse.json();
                
                // Log individual step
                addTask({
                    id: `step-${Date.now()}-${i}`,
                    agentId: step.agentId,
                    agentName: step.agentId.charAt(0).toUpperCase() + step.agentId.slice(1),
                    taskType: step.taskType,
                    taskInput: currentStepInput,
                    taskOutput: stepResult,
                    timestamp: new Date().toISOString(),
                    status: 'success',
                    workflowStep: i + 1,
                });

                finalResult = stepResult;
                stepInput = stepResult;
            }
            
            setFeedbackText(lang === 'en' ? 'Workflow complete!' : 'اكتمل سير العمل!');
            
            let summary = `I've completed the workflow. The final result is available in the task history.`;
            if (typeof finalResult === 'object' && finalResult !== null) {
                if (finalResult.summary) summary = finalResult.summary;
                else if (finalResult.translatedText) summary = `The translation is: ${finalResult.translatedText}`;
                else if (finalResult.results && finalResult.results.length > 0) summary = `I found ${finalResult.results.length} results. The top one is ${finalResult.results[0].name || finalResult.results[0].title}.`;
                else if (finalResult.message) summary = finalResult.message;
            } else if (typeof finalResult === 'string') {
                summary = finalResult;
            }
            return summary;

        } catch (error) {
            console.error('Workflow execution error:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setFeedbackText(`Error: ${errorMessage}`);
            addTask({
                id: `workflow-error-${Date.now()}`,
                agentId: 'orchestrator',
                agentName: 'Orchestrator',
                taskType: 'Execute Workflow',
                taskInput: { prompt },
                taskOutput: { error: errorMessage },
                timestamp: new Date().toISOString(),
                status: 'error',
                errorMessage: errorMessage,
            });
            return `I encountered an error while executing your request: ${errorMessage}`;
        }
    };


    const startConversation = async () => {
        if (sessionRef.current) return;

        setState('processing');
        setFeedbackText(lang === 'en' ? 'Connecting...' : 'جارٍ الاتصال...');

        try {
            if (!aiRef.current) {
                aiRef.current = new GoogleGenAI({apiKey: process.env.API_KEY});
            }
            const ai = aiRef.current;
            
            const session = await ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ functionDeclarations: [openAppFunctionDeclaration, executeWorkflowFunctionDeclaration] }],
                },
                callbacks: {
                    onopen: async () => {
                        setState('listening');
                        setFeedbackText('');
                        setUserTranscript('');
                        setModelTranscript('');
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        microphoneStreamRef.current = stream;
                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionRef.current?.sendRealtimeInput({ media: pcmBlob });
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setUserTranscript(message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription) {
                            setModelTranscript(message.serverContent.outputTranscription.text);
                        }
                        if(message.toolCall){
                            for(const fc of message.toolCall.functionCalls){
                                if(fc.name === 'openApp'){
                                    // FIX: Cast `fc.args.appName` to string as the API returns it as `unknown`.
                                    const result = handleOpenApp(fc.args.appName as string);
                                    sessionRef.current?.sendToolResponse({functionResponses: {id: fc.id, name: fc.name, response: {result}}});
                                } else if (fc.name === 'executeWorkflow') {
                                    // FIX: Cast `fc.args.prompt` to string as the API returns it as `unknown`.
                                    const result = await handleExecuteWorkflow(fc.args.prompt as string);
                                    sessionRef.current?.sendToolResponse({functionResponses: {id: fc.id, name: fc.name, response: {result}}});
                                }
                            }
                        }
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData) {
                            setState('speaking');
                            if (!outputAudioContextRef.current) {
                                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                            }
                            const outputAudioContext = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            source.addEventListener('ended', () => { audioSourcesRef.current.delete(source); if(audioSourcesRef.current.size === 0) setState('listening');});
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                        if (message.serverContent?.turnComplete) {
                           setUserTranscript('');
                           setModelTranscript('');
                        }
                    },
                    onclose: () => {
                        stopConversation();
                    },
                    onerror: (e) => {
                        console.error('Gemini Live Error:', e);
                        setFeedbackText(lang === 'en' ? 'Connection error.' : 'خطأ في الاتصال.');
                        setState('error');
                        setTimeout(stopConversation, 3000);
                    },
                },
            });
            sessionRef.current = session;

        } catch (err) {
            console.error('Failed to start voice session:', err);
            setFeedbackText(lang === 'en' ? 'Could not start session.' : 'لم يتمكن من بدء الجلسة.');
            setState('error');
        }
    };

    const stopConversation = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setState('idle');
        setFeedbackText('');
        setUserTranscript('');
        setModelTranscript('');
    };
    
    const handleMicClick = () => {
        if (state === 'idle' || state === 'error') {
            startConversation();
        } else {
            stopConversation();
        }
    };

    const openSettings = () => {
        const settingsApp = allApps.find(app => app.id === 'settings');
        if (settingsApp) {
            openWindow(settingsApp);
        }
    };

    const stateConfig = {
        idle: { icon: <Mic size={24} /> },
        listening: { icon: <Mic size={24} /> },
        processing: { icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> },
        speaking: { icon: <Mic size={24} /> },
        error: { icon: <MicOff size={24} /> },
    };

    return (
        <>
            <motion.div
                className="fixed bottom-20 right-5 z-[10000] flex flex-col items-end gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="w-80 h-48 bg-surface/90 backdrop-blur-md rounded-lg shadow-2xl p-4 flex flex-col text-text border"
                            style={{ borderColor: theme.colors.border }}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold">{lang === 'en' ? 'Voice Assistant' : 'المساعد الصوتي'}</h3>
                                <button onClick={openSettings} className="p-1 hover:bg-white/10 rounded-full"><Settings size={16} /></button>
                            </div>
                            <div className="flex-1 text-sm text-text-secondary overflow-y-auto">
                                <p className="text-primary">{userTranscript}</p>
                                <p>{modelTranscript || feedbackText}</p>
                            </div>
                            <div className="h-10">
                               {state === 'listening' || state === 'speaking' ? <VoiceWaveform /> : null}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.button
                    className="relative overflow-hidden w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-primary to-accent"
                    onClick={handleMicClick}
                    onDoubleClick={() => setIsExpanded(prev => !prev)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: state === 'speaking' || state === 'listening' ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                  {(state === 'listening' || state === 'speaking') && (
                    <span className="absolute top-0 left-0 w-full h-1 bg-white/80 filter blur-sm animate-hologram"></span>
                  )}
                  {stateConfig[state].icon}
                </motion.button>
            </motion.div>
        </>
    );
};

export default VoiceAssistant;
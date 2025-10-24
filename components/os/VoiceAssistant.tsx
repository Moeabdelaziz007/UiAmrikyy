import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Settings, X, Loader } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../App';
import { translations } from '../../lib/i18n';
import VoiceWaveform from './VoiceWaveform';
import useWindowStore from '../../stores/windowStore';
import { allApps } from '../../lib/apps';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { encode, decode, decodeAudioData } from '../../utils/audio';
import useTaskHistoryStore from '../../stores/taskHistoryStore';

type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface LiveSession {
    close(): void;
    sendRealtimeInput(input: { media: Blob }): void;
    sendToolResponse(response: { functionResponses: { id: string; name: string; response: { result: any; }; }; }): void;
}

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
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);

    // Function Declarations for Gemini
    const openAppFunctionDeclaration: FunctionDeclaration = {
      name: 'openApp',
      parameters: {
        type: Type.OBJECT,
        description: 'Opens a specified application on the OS desktop.',
        properties: { appName: { type: Type.STRING, description: 'The name of the application to open, e.g., "File Manager", "Terminal", "Settings", or any AI agent like "Navigator" or "Coding Agent".' } },
        required: ['appName'],
      },
    };

    const executeWorkflowFunctionDeclaration: FunctionDeclaration = {
      name: 'executeWorkflow',
      parameters: {
        type: Type.OBJECT,
        description: 'Executes a complex multi-step workflow. Use this for requests requiring multiple actions, like planning a trip, researching and summarizing, or finding information and acting on it.',
        properties: { prompt: { type: Type.STRING, description: 'The complex user request, e.g., "Plan a 3-day trip to Paris", "Find the best coffee shops near me and then get directions to the top-rated one."' } },
        required: ['prompt'],
      },
    };

    const handleOpenApp = (appName: string) => {
        const appToOpen = allApps.find(app => app.name.en.toLowerCase() === appName.toLowerCase() || app.id.toLowerCase() === appName.toLowerCase());
        if (appToOpen) { openWindow(appToOpen); return `Opening ${appToOpen.name[lang]}.`; }
        return `Sorry, I couldn't find an app named ${appName}.`;
    };

    const handleExecuteWorkflow = async (prompt: string): Promise<string> => {
        setFeedbackText(lang === 'en' ? `Planning: "${prompt}"` : `تخطيط: "${prompt}"`);
        let stepOutputs: Record<string, any> = {};
        try {
            const planResponse = await fetch(`http://localhost:3000/api/orchestrator`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
            if (!planResponse.ok) throw new Error('Failed to get workflow plan.');
            const workflow = await planResponse.json();
            addTask({ id: `workflow-${Date.now()}`, agentId: 'orchestrator', agentName: 'Orchestrator', taskType: 'Plan Workflow', taskInput: { prompt }, taskOutput: workflow, timestamp: new Date().toISOString(), status: 'success' });
            setFeedbackText(lang === 'en' ? `Executing ${workflow.steps.length}-step plan...` : `تنفيذ خطة من ${workflow.steps.length} خطوات...`);

            for (let i = 0; i < workflow.steps.length; i++) {
                const step = workflow.steps[i];
                setFeedbackText(lang === 'en' ? `Step ${i + 1}: Running ${step.agentId}...` : `الخطوة ${i + 1}: تشغيل ${step.agentId}...`);
                let resolvedInput = JSON.stringify(step.taskInput).replace(/\{\{steps\.([^}]+)\}\}/g, (_, path) => JSON.stringify(path.split('.output.')[1].split('.').reduce((acc: any, part: string) => acc && acc[part], stepOutputs[path.split('.')[0]])));
                const currentStepInput = JSON.parse(resolvedInput);
                const stepResponse = await fetch(`http://localhost:3000/api/agents/${step.agentId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: step.taskType, ...currentStepInput }) });
                if (!stepResponse.ok) { const err = await stepResponse.json(); throw new Error(`Step ${i + 1} (${step.agentId}) failed: ${err.error}`); }
                const stepResult = await stepResponse.json();
                stepOutputs[step.id] = stepResult;
                addTask({ id: `step-${Date.now()}-${i}`, agentId: step.agentId, agentName: step.agentId.charAt(0).toUpperCase() + step.agentId.slice(1), taskType: step.taskType, taskInput: currentStepInput, taskOutput: stepResult, timestamp: new Date().toISOString(), status: 'success', workflowStep: i + 1 });
            }
            setFeedbackText(lang === 'en' ? 'Workflow complete!' : 'اكتمل سير العمل!');
            const finalResult = stepOutputs[workflow.steps[workflow.steps.length - 1].id];
            let summary = `I've completed the workflow.`;
            if (typeof finalResult === 'object' && finalResult !== null) {
                if (finalResult.summary) summary = finalResult.summary;
                else if (finalResult.translatedText) summary = `The translation is: ${finalResult.translatedText}`;
                else if (finalResult.results?.length > 0) summary = `I found ${finalResult.results.length} results. The top one is ${finalResult.results[0].name || finalResult.results[0].title}.`;
                else if (finalResult.message) summary = finalResult.message;
            } else if (typeof finalResult === 'string') { summary = finalResult; }
            return summary;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setFeedbackText(`Error: ${errorMessage}`);
            addTask({ id: `workflow-error-${Date.now()}`, agentId: 'orchestrator', agentName: 'Orchestrator', taskType: 'Execute Workflow', taskInput: { prompt }, taskOutput: { error: errorMessage }, timestamp: new Date().toISOString(), status: 'error', errorMessage: errorMessage });
            return `I encountered an error: ${errorMessage}`;
        }
    };

    const stopConversation = () => {
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        microphoneStreamRef.current?.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        if (inputAudioContextRef.current?.state !== 'closed') inputAudioContextRef.current?.close();
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setState('idle');
        setFeedbackText(''); setUserTranscript(''); setModelTranscript('');
    };
    
    useEffect(() => {
        if (isVisible && (state === 'idle' || state === 'error')) {
            startConversation();
        } else if (!isVisible && state !== 'idle') {
            stopConversation();
        }
        
        return () => {
            if(state !== 'idle') stopConversation();
        }
    }, [isVisible]);

    const startConversation = async () => {
        if (sessionPromiseRef.current) return;
        setState('processing');
        setFeedbackText(lang === 'en' ? 'Connecting...' : 'جارٍ الاتصال...');
        try {
            if (!aiRef.current) aiRef.current = new GoogleGenAI({apiKey: process.env.API_KEY});
            const sessionPromise = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }, inputAudioTranscription: {}, outputAudioTranscription: {}, tools: [{ functionDeclarations: [openAppFunctionDeclaration, executeWorkflowFunctionDeclaration] }] },
                callbacks: {
                    onopen: async () => {
                        setState('listening'); setFeedbackText(''); setUserTranscript(''); setModelTranscript('');
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        microphoneStreamRef.current = stream;
                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (e) => {
                            const pcmBlob: Blob = { data: encode(new Uint8Array(new Int16Array(e.inputBuffer.getChannelData(0).map(x => x * 32768)).buffer)), mimeType: 'audio/pcm;rate=16000' };
                            sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) setUserTranscript(message.serverContent.inputTranscription.text);
                        if (message.serverContent?.outputTranscription) setModelTranscript(message.serverContent.outputTranscription.text);
                        if(message.toolCall){
                            for(const fc of message.toolCall.functionCalls){
                                let result;
                                if(fc.name === 'openApp') result = handleOpenApp(fc.args.appName as string);
                                else if (fc.name === 'executeWorkflow') result = await handleExecuteWorkflow(fc.args.prompt as string);
                                sessionPromiseRef.current?.then(s => s.sendToolResponse({functionResponses: {id: fc.id, name: fc.name, response: {result}}}));
                            }
                        }
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData) {
                            setState('speaking');
                            if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.onended = () => { audioSourcesRef.current.delete(source); if(audioSourcesRef.current.size === 0) setState('listening'); };
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                        if (message.serverContent?.turnComplete) { setUserTranscript(''); setModelTranscript(''); }
                    },
                    onclose: () => { stopConversation(); onClose(); },
                    onerror: (e) => { setState('error'); setFeedbackText(lang === 'en' ? 'Connection error.' : 'خطأ في الاتصال.'); setTimeout(() => { stopConversation(); onClose(); }, 3000); },
                },
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (err) { setState('error'); setFeedbackText(lang === 'en' ? 'Could not start session.' : 'لم يتمكن من بدء الجلسة.'); }
    };
    
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed bottom-20 right-5 z-[10000] w-96 h-64 bg-surface/90 backdrop-blur-md rounded-lg shadow-2xl p-4 flex flex-col text-text border"
                    style={{ borderColor: theme.colors.border }}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">{lang === 'en' ? 'Voice Assistant' : 'المساعد الصوتي'}</h3>
                        <div className="flex gap-2">
                           <button onClick={() => {openWindow(allApps.find(app => app.id === 'settings')!)}} className="p-1 hover:bg-white/10 rounded-full"><Settings size={16} /></button>
                           <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
                        </div>
                    </div>
                    <div className="flex-1 text-sm text-text-secondary overflow-y-auto custom-scrollbar">
                        <p className="font-semibold" style={{color: theme.colors.primary}}>{userTranscript}</p>
                        <p>{modelTranscript || feedbackText}</p>
                    </div>
                    <div className="h-12 flex justify-center items-center">
                       {state === 'listening' || state === 'speaking' ? <VoiceWaveform /> : null}
                       {state === 'processing' && <Loader className="animate-spin" />}
                       {state === 'error' && <MicOff className="text-error" />}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VoiceAssistant;
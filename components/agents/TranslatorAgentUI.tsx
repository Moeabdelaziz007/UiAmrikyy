import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LanguagesIcon, Mic, Square, Loader } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';
import { decode, decodeAudioData, encode } from '../../utils/audio';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAIAPIBlob } from '@google/genai';

interface TranslatorAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const TranslatorAgentUI: React.FC<TranslatorAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.translator[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [textToTranslate, setTextToTranslate] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [sourceLang, setSourceLang] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  
  // States for live transcription
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const sessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const finalTranscriptionRef = useRef('');

  useEffect(() => {
    return () => {
      stopTranscription(true);
    };
  }, []);

  const toggleTranscription = () => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      startTranscription();
    }
  };

  const startTranscription = async () => {
    setIsTranscribing(true);
    setTranscription('');
    setResult('');
    finalTranscriptionRef.current = '';
    setCurrentTask('voiceToText');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = context;
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const source = context.createMediaStreamSource(stream);
                    sourceNodeRef.current = source;
                    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    source.connect(scriptProcessor);
                    scriptProcessor.connect(context.destination);
                },
                onmessage: (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const transcriptPart = message.serverContent.inputTranscription;
                        if (transcriptPart.isFinal) {
                            finalTranscriptionRef.current += transcriptPart.text + ' ';
                            setTranscription(finalTranscriptionRef.current);
                        } else {
                            setTranscription(finalTranscriptionRef.current + transcriptPart.text);
                        }
                    }
                },
                onerror: (e: any) => {
                    setResult(`Error: ${e.message}`);
                    stopTranscription();
                },
                onclose: () => {
                    stopTranscription(true);
                },
            },
            config: {
                inputAudioTranscription: {},
                responseModalities: [Modality.AUDIO],
            },
        });
        sessionRef.current = await sessionPromise;
    } catch (err: any) {
        setResult(`Error: Could not start transcription. ${err.message}`);
        setIsTranscribing(false);
    }
  };

  const stopTranscription = (calledFromClose = false) => {
    if (!calledFromClose && sessionRef.current) {
        sessionRef.current.close();
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }

    sessionRef.current = null;
    setIsTranscribing(false);
    setCurrentTask(null);

    if (finalTranscriptionRef.current.trim()) {
        onTaskComplete({
            id: Date.now().toString(),
            agentId: 'translator',
            agentName: currentText.name,
            taskType: currentText.tasks.voiceToText,
            taskInput: '[Live Audio Input]',
            taskOutput: finalTranscriptionRef.current.trim(),
            timestamp: new Date().toISOString(),
            status: 'success',
        });
    }
  };

  function createBlob(data: Float32Array): GenAIAPIBlob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
  }

  const handleTranslateText = () => {
    if (!textToTranslate || !targetLang) return;
    mockExecuteTask(
      currentText.tasks.translateText,
      { text: textToTranslate, targetLang, sourceLang },
      currentText.mockResults.translate
    );
  };

  const handleDetectLanguage = () => {
    if (!textToTranslate) return;
    mockExecuteTask(
      currentText.tasks.detectLanguage,
      { text: textToTranslate },
      currentText.mockResults.detect
    );
  };
  
  const mockExecuteTask = async (
    taskType: string,
    taskInput: string | Record<string, any>,
    mockOutput: string | Record<string, any>,
    isError: boolean = false,
    errorMessage: string = ''
  ) => {
    setIsLoading(true);
    setResult('');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setResult(isError ? errorMessage : (typeof mockOutput === 'string' ? mockOutput : JSON.stringify(mockOutput)));

    onTaskComplete({
      id: Date.now().toString(),
      agentId: 'translator',
      agentName: currentText.name,
      taskType: taskType,
      taskInput: taskInput,
      taskOutput: isError ? errorMessage : (typeof mockOutput === 'string' ? mockOutput : JSON.stringify(mockOutput)),
      timestamp: new Date().toISOString(),
      status: isError ? 'error' : 'success',
      errorMessage: isError ? errorMessage : undefined,
    });
  };

  const handleTextToVoice = async () => {
    if (!textToTranslate) return;
    setIsLoading(true);
    setCurrentTask('textToVoice');
    setResult('');
    try {
        const response = await fetch('http://localhost:3000/api/agents/translator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'textToVoice',
                text: textToTranslate,
                language: targetLang,
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to generate speech');
        }
        const data = await response.json();

        if (data.audioContent) {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(data.audioContent), audioCtx, 24000, 1);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();
            setResult(currentText.mockResults.textToVoice as string);
        } else {
            throw new Error('No audio content received.');
        }
        
        onTaskComplete({
          id: Date.now().toString(),
          agentId: 'translator',
          agentName: currentText.name,
          taskType: currentText.tasks.textToVoice,
          taskInput: { text: textToTranslate, language: targetLang },
          taskOutput: 'Audio generated and played.',
          timestamp: new Date().toISOString(),
          status: 'success',
        });
    } catch (error: any) {
        setResult(`Error: ${error.message}`);
        onTaskComplete({
          id: Date.now().toString(),
          agentId: 'translator',
          agentName: currentText.name,
          taskType: currentText.tasks.textToVoice,
          taskInput: { text: textToTranslate, language: targetLang },
          taskOutput: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
          status: 'error',
          errorMessage: error.message,
        });
    } finally {
        setIsLoading(false);
        setCurrentTask(null);
    }
  };

  const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;
  const buttonClass = `w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 space-y-6 ${currentThemeColors.background}`}
      style={{ fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
    >
      <h3 className={`text-2xl font-bold flex items-center gap-2 text-text`} style={{color: currentThemeColors.primary}}>
        <LanguagesIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Voice to Text - LIVE */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.voiceToText}</h4>
        <p className="text-sm text-text-secondary mb-3">{lang === 'en' ? 'Click to start/stop live transcription.' : 'انقر لبدء/إيقاف النسخ المباشر.'}</p>
        <button 
          onClick={toggleTranscription}
          className={`${buttonClass} flex items-center justify-center gap-2`}
          style={{backgroundColor: isTranscribing ? theme.colors.error : theme.colors.primary}}
          disabled={isLoading && currentTask !== 'voiceToText'}
        >
          {isTranscribing ? <Loader className="animate-spin"/> : (
            isTranscribing ? <><Square size={16}/> {lang === 'en' ? 'Stop Transcribing' : 'إيقاف النسخ'}</> : <><Mic size={16}/> {lang === 'en' ? 'Start Transcribing' : 'بدء النسخ'}</>
          )}
        </button>
        {(transcription || result) && (
            <div className="mt-4 p-3 bg-background rounded-md border" style={{ borderColor: currentThemeColors.border }}>
                <p className="whitespace-pre-wrap text-sm">{transcription || result}</p>
            </div>
        )}
      </div>

      {/* Text to Voice */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.textToVoice}</h4>
        <textarea
          placeholder={currentText.placeholders.text}
          value={textToTranslate}
          onChange={(e) => setTextToTranslate(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.targetLang}
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleTextToVoice} disabled={isLoading || !textToTranslate} className={buttonClass}>
          {isLoading && currentTask === 'textToVoice' ? globalText.loading : currentText.tasks.textToVoice}
        </button>
      </div>

      {/* Translate Text */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.translateText}</h4>
        <textarea
          placeholder={currentText.placeholders.text}
          value={textToTranslate}
          onChange={(e) => setTextToTranslate(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.targetLang}
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.sourceLang}
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleTranslateText} disabled={isLoading || !textToTranslate || !targetLang} className={buttonClass}>
          {isLoading && currentTask === 'translateText' ? globalText.loading : currentText.tasks.translateText}
        </button>
      </div>

      {/* Detect Language */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.detectLanguage}</h4>
        <textarea
          placeholder={currentText.placeholders.text}
          value={textToTranslate}
          onChange={(e) => setTextToTranslate(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <button onClick={handleDetectLanguage} disabled={isLoading || !textToTranslate} className={buttonClass}>
          {isLoading && currentTask === 'detectLanguage' ? globalText.loading : currentText.tasks.detectLanguage}
        </button>
      </div>


      {result && currentTask !== 'voiceToText' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mt-4 shadow`}
          style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border, color: currentThemeColors.text }}
        >
          <h4 className="font-semibold mb-2">{globalText.output}:</h4>
          <p>{result}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TranslatorAgentUI;
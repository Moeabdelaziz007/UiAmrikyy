import React, { useState, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { LanguagesIcon, MessageSquare, Mic, Volume2, Square, Loader } from 'lucide-react'; // Using Lucide-React icons
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';
import { decode, decodeAudioData } from '../../utils/audio';

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

  const audioContextRef = useRef<AudioContext | null>(null);
  
  // States for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            const base64Audio = await (window as any).fileToBase64(audioBlob);
            handleVoiceToText(base64Audio, mimeType);
            // Stop media stream tracks
            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Microphone access error:", err);
        setResult("Error: Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };
  
  const handleVoiceToText = async (base64Audio: string, mimeType: string) => {
    setIsLoading(true);
    setCurrentTask('voiceToText');
    setResult('');
    try {
        const response = await fetch('http://localhost:3000/api/agents/translator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'voiceToText',
                audio: { data: base64Audio, mimeType }
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to transcribe audio');
        }
        const data = await response.json();
        setResult(data.transcription);
        onTaskComplete({
          id: Date.now().toString(),
          agentId: 'translator',
          agentName: currentText.name,
          taskType: currentText.tasks.voiceToText,
          taskInput: { audio: `[${mimeType}]` },
          taskOutput: data.transcription,
          timestamp: new Date().toISOString(),
          status: 'success',
        });
    } catch (error: any) {
        setResult(`Error: ${error.message}`);
        onTaskComplete({
          id: Date.now().toString(),
          agentId: 'translator',
          agentName: currentText.name,
          taskType: currentText.tasks.voiceToText,
          taskInput: { audio: `[${mimeType}]` },
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
  
  // FIX: Update mockOutput parameter type to allow Record<string, any>
  const mockExecuteTask = async (
    taskType: string,
    taskInput: string | Record<string, any>,
    mockOutput: string | Record<string, any>,
    isError: boolean = false,
    errorMessage: string = ''
  ) => {
    setIsLoading(true);
    setResult('');
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
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
    if (!textToTranslate || !targetLang) return;
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
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioCtx = audioContextRef.current;
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

      {/* Voice to Text */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.voiceToText}</h4>
        <p className="text-sm text-text-secondary mb-3">{lang === 'en' ? 'Click the button to start/stop recording.' : 'انقر على الزر لبدء/إيقاف التسجيل.'}</p>
        <button 
          onClick={isRecording ? stopRecording : startRecording} 
          disabled={isLoading && currentTask === 'voiceToText'}
          className={`${buttonClass} flex items-center justify-center gap-2 ${isRecording ? 'bg-red-500' : ''}`}
          style={{backgroundColor: isRecording ? theme.colors.error : theme.colors.primary}}
        >
          {isLoading && currentTask === 'voiceToText' ? <Loader className="animate-spin"/> : (
            isRecording ? <><Square size={16}/> {lang === 'en' ? 'Stop Recording' : 'إيقاف التسجيل'}</> : <><Mic size={16}/> {lang === 'en' ? 'Start Recording' : 'بدء التسجيل'}</>
          )}
        </button>
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
        <button onClick={handleTextToVoice} disabled={isLoading || !textToTranslate || !targetLang} className={buttonClass}>
          {isLoading && currentTask === 'textToVoice' ? globalText.loading : currentText.tasks.textToVoice}
        </button>
      </div>


      {result && (
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
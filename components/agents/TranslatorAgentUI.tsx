import React, { useState, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { LanguagesIcon, MessageSquare, Mic, Volume2 } from 'lucide-react'; // Using Lucide-React icons
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
  const [audioInput, setAudioInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

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

  const handleVoiceToText = () => {
    if (!audioInput) return;
    mockExecuteTask(
      currentText.tasks.voiceToText,
      { audioFile: audioInput },
      currentText.mockResults.voiceToText
    );
  };

  const handleTextToVoice = async () => {
    if (!textToTranslate || !targetLang) return;
    setIsLoading(true);
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
          {isLoading ? globalText.loading : currentText.tasks.translateText}
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
          {isLoading ? globalText.loading : currentText.tasks.detectLanguage}
        </button>
      </div>

      {/* Voice to Text */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.voiceToText}</h4>
        <input
          type="text" // Mocking audio input as text for simplicity
          placeholder={currentText.placeholders.audioInput}
          value={audioInput}
          onChange={(e) => setAudioInput(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleVoiceToText} disabled={isLoading || !audioInput} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.voiceToText}
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
          {isLoading ? globalText.loading : currentText.tasks.textToVoice}
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
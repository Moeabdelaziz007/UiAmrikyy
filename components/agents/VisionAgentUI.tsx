import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, Upload, Text, Landmark } from 'lucide-react'; // Using Lucide-React icons
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface VisionAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const VisionAgentUI: React.FC<VisionAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.vision[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      agentId: 'vision',
      agentName: currentText.name,
      taskType: taskType,
      taskInput: taskInput,
      taskOutput: isError ? errorMessage : (typeof mockOutput === 'string' ? mockOutput : JSON.stringify(mockOutput)),
      timestamp: new Date().toISOString(),
      status: isError ? 'error' : 'success',
      errorMessage: isError ? errorMessage : undefined,
    });
  };

  const handleAnalyzeImage = () => {
    if (!imageUrl) return;
    mockExecuteTask(
      currentText.tasks.analyzeImage,
      { imageUrl, prompt },
      currentText.mockResults.analyze
    );
  };

  const handleExtractText = () => {
    if (!imageUrl) return;
    mockExecuteTask(
      currentText.tasks.extractText,
      { imageUrl },
      currentText.mockResults.extract
    );
  };

  const handleIdentifyLandmark = () => {
    if (!imageUrl) return;
    mockExecuteTask(
      currentText.tasks.identifyLandmark,
      { imageUrl },
      currentText.mockResults.landmark
    );
  };

  const handleDetectObjects = () => {
    if (!imageUrl) return;
    mockExecuteTask(
      currentText.tasks.detectObjects,
      { imageUrl },
      currentText.mockResults.objects
    );
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
        <EyeIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Image URL Input (for mock) */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{lang === 'en' ? 'Image Source' : 'مصدر الصورة'}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.imageUrl}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.prompt}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
      </div>

      {/* Tasks */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{lang === 'en' ? 'Tasks' : 'المهام'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={handleAnalyzeImage} disabled={isLoading || !imageUrl} className={buttonClass}>
            {isLoading ? globalText.loading : currentText.tasks.analyzeImage}
          </button>
          <button onClick={handleExtractText} disabled={isLoading || !imageUrl} className={buttonClass}>
            {isLoading ? globalText.loading : currentText.tasks.extractText}
          </button>
          <button onClick={handleIdentifyLandmark} disabled={isLoading || !imageUrl} className={buttonClass}>
            {isLoading ? globalText.loading : currentText.tasks.identifyLandmark}
          </button>
          <button onClick={handleDetectObjects} disabled={isLoading || !imageUrl} className={buttonClass}>
            {isLoading ? globalText.loading : currentText.tasks.detectObjects}
          </button>
        </div>
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

export default VisionAgentUI;
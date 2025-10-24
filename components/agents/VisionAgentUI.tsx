import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, Upload, Text, Landmark, Search, Loader } from 'lucide-react';
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a URL for preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clean up the old preview URL if one exists
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  const executeTask = async (taskType: string, taskKey: keyof typeof currentText.tasks) => {
    if (!imageFile) return;

    setIsLoading(true);
    setResult('');
    setCurrentTask(taskType);

    try {
      const imageDataUri = await fileToDataUri(imageFile);

      const taskInput: { imageUrl: string; prompt?: string } = { imageUrl: imageDataUri };
      if (taskType === 'analyzeImage' && prompt) {
        taskInput.prompt = prompt;
      }

      const response = await fetch(`http://localhost:3000/api/agents/vision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: taskType, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      // Prettify JSON output for better readability
      const output = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
      setResult(output);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'vision',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput: { prompt, fileName: imageFile.name },
        taskOutput: data,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'vision',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput: { prompt, fileName: imageFile.name },
        taskOutput: { error: err.message },
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: err.message,
      });
    } finally {
      setIsLoading(false);
      setCurrentTask(null);
    }
  };

  const handleAnalyzeImage = () => executeTask('analyzeImage', 'analyzeImage');
  const handleExtractText = () => executeTask('extractText', 'extractText');
  const handleIdentifyLandmark = () => executeTask('identifyLandmark', 'identifyLandmark');
  const handleDetectObjects = () => executeTask('detectObjects', 'detectObjects');

  const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;
  const buttonClass = (taskName: string) => `w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 space-y-6 h-full overflow-y-auto custom-scrollbar`}
      style={{ background: currentThemeColors.background, fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
    >
      <header className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: theme.colors.border }}>
        <EyeIcon className="w-8 h-8" style={{ color: currentThemeColors.primary }} />
        <div>
            <h3 className={`text-2xl font-bold text-text`}>{currentText.name}</h3>
            <p className={`text-sm text-text-secondary`}>{currentText.description}</p>
        </div>
      </header>


      {/* Image Upload and Prompt Input */}
      <div className={`p-4 rounded-lg`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{lang === 'en' ? 'Image Source' : 'مصدر الصورة'}</h4>
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg mb-3" style={{ borderColor: currentThemeColors.border }}>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="image-upload" />
          <label htmlFor="image-upload" className="cursor-pointer text-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
            ) : (
              <div className="flex flex-col items-center text-text-secondary p-4">
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-sm">{lang === 'en' ? 'Click to upload an image' : 'انقر لتحميل صورة'}</p>
              </div>
            )}
          </label>
        </div>
        <input
          type="text"
          placeholder={currentText.placeholders.prompt}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={`${inputClass}`}
          style={{ borderColor: currentThemeColors.border }}
        />
      </div>

      {/* Tasks */}
      <div className={`p-4 rounded-lg`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{lang === 'en' ? 'Tasks' : 'المهام'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={handleAnalyzeImage} disabled={isLoading || !imageFile} className={buttonClass('analyzeImage')}>
            {isLoading && currentTask === 'analyzeImage' ? <Loader className="animate-spin" /> : <EyeIcon size={16} />}
            {currentText.tasks.analyzeImage}
          </button>
          <button onClick={handleExtractText} disabled={isLoading || !imageFile} className={buttonClass('extractText')}>
            {isLoading && currentTask === 'extractText' ? <Loader className="animate-spin" /> : <Text size={16} />}
            {currentText.tasks.extractText}
          </button>
          <button onClick={handleIdentifyLandmark} disabled={isLoading || !imageFile} className={buttonClass('identifyLandmark')}>
            {isLoading && currentTask === 'identifyLandmark' ? <Loader className="animate-spin" /> : <Landmark size={16} />}
            {currentText.tasks.identifyLandmark}
          </button>
          <button onClick={handleDetectObjects} disabled={isLoading || !imageFile} className={buttonClass('detectObjects')}>
            {isLoading && currentTask === 'detectObjects' ? <Loader className="animate-spin" /> : <Search size={16} />}
            {currentText.tasks.detectObjects}
          </button>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mt-4`}
          style={{ background: currentThemeColors.surface, color: currentThemeColors.text }}
        >
          <h4 className="font-semibold mb-2">{globalText.output}:</h4>
          <pre className="whitespace-pre-wrap text-sm bg-background p-2 rounded-md max-h-60 overflow-auto custom-scrollbar">{result}</pre>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VisionAgentUI;

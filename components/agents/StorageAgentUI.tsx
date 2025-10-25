import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { HardDriveIcon, Save, FolderPlus, Upload, Share2 } from 'lucide-react'; // Using Lucide-React icons
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface StorageAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const StorageAgentUI: React.FC<StorageAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.storage[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [documentContent, setDocumentContent] = useState('');
  const [filename, setFilename] = useState('');
  const [tripData, setTripData] = useState(''); // Mock for JSON input
  const [fileInput, setFileInput] = useState(''); // Mock for Base64 input
  const [fileId, setFileId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState('');

  const executeTask = async (
    taskKey: keyof typeof currentText.tasks,
    taskInput: Record<string, any>
  ) => {
    setIsLoading(true);
    setCurrentTask(taskKey);
    setResult('');
    try {
      const response = await fetch(`/api/agents/storage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: taskKey, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const data = await response.json();
      const formattedResult = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
      setResult(formattedResult);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'storage',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput: taskInput,
        taskOutput: data,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'storage',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput: taskInput,
        taskOutput: { error: err.message },
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: err.message,
      });
    } finally {
      setIsLoading(false);
      setCurrentTask('');
    }
  };


  const handleSaveDocument = () => {
    if (!documentContent || !filename) return;
    executeTask('saveDocument', { content: documentContent, filename });
  };

  const handleCreateItinerary = () => {
    if (!tripData) return;
    executeTask('createItinerary', { tripData });
  };

  const handleUploadFile = () => {
    if (!fileInput || !filename) return;
    executeTask('uploadFile', { fileInput, filename });
  };

  const handleShareFile = () => {
    if (!fileId || !email) return;
    executeTask('shareFile', { fileId, email });
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
        <HardDriveIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Save Document */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.saveDocument}</h4>
        <textarea
          placeholder={currentText.placeholders.content}
          value={documentContent}
          onChange={(e) => setDocumentContent(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={4}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.filename}
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleSaveDocument} disabled={isLoading || !documentContent || !filename} className={buttonClass}>
          {isLoading && currentTask === 'saveDocument' ? globalText.loading : currentText.tasks.saveDocument}
        </button>
      </div>

      {/* Create Itinerary */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.createItinerary}</h4>
        <textarea
          placeholder={currentText.placeholders.tripData}
          value={tripData}
          onChange={(e) => setTripData(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <button onClick={handleCreateItinerary} disabled={isLoading || !tripData} className={buttonClass}>
          {isLoading && currentTask === 'createItinerary' ? globalText.loading : currentText.tasks.createItinerary}
        </button>
      </div>

      {/* Upload File */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.uploadFile}</h4>
        <input
          type="text" // Mocking file input as text (Base64)
          placeholder={currentText.placeholders.fileInput}
          value={fileInput}
          onChange={(e) => setFileInput(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.filename}
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleUploadFile} disabled={isLoading || !fileInput || !filename} className={buttonClass}>
          {isLoading && currentTask === 'uploadFile' ? globalText.loading : currentText.tasks.uploadFile}
        </button>
      </div>

      {/* Share File */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.shareFile}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.fileId}
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="email"
          placeholder={currentText.placeholders.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleShareFile} disabled={isLoading || !fileId || !email} className={buttonClass}>
          {isLoading && currentTask === 'shareFile' ? globalText.loading : currentText.tasks.shareFile}
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
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StorageAgentUI;
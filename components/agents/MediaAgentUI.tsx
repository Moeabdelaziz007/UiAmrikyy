import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { VideoIcon, Youtube, Film, Image } from 'lucide-react'; // Using Lucide-React icons
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface MediaAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const MediaAgentUI: React.FC<MediaAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.media[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [videoId, setVideoId] = useState('');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
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
      agentId: 'media',
      agentName: currentText.name,
      taskType: taskType,
      taskInput: taskInput,
      taskOutput: isError ? errorMessage : (typeof mockOutput === 'string' ? mockOutput : JSON.stringify(mockOutput)),
      timestamp: new Date().toISOString(),
      status: isError ? 'error' : 'success',
      errorMessage: isError ? errorMessage : undefined,
    });
  };

  const handleSearchVideos = () => {
    if (!searchQuery) return;
    mockExecuteTask(
      currentText.tasks.searchVideos,
      { query: searchQuery },
      currentText.mockResults.search
    );
  };

  const handleGetVideoDetails = () => {
    if (!videoId) return;
    mockExecuteTask(
      currentText.tasks.getVideoDetails,
      { videoId },
      currentText.mockResults.details
    );
  };

  const handleGenerateVideo = () => {
    if (!generatePrompt) return;
    mockExecuteTask(
      currentText.tasks.generateVideo,
      { prompt: generatePrompt },
      currentText.mockResults.generate
    );
  };

  const handleCreateThumbnail = () => {
    if (!thumbnailPrompt) return;
    mockExecuteTask(
      currentText.tasks.createThumbnail,
      { prompt: thumbnailPrompt },
      currentText.mockResults.thumbnail
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
        <VideoIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Search Videos */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.searchVideos}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.query}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleSearchVideos} disabled={isLoading || !searchQuery} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.searchVideos}
        </button>
      </div>

      {/* Get Video Details */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.getVideoDetails}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.videoId}
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleGetVideoDetails} disabled={isLoading || !videoId} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.getVideoDetails}
        </button>
      </div>

      {/* Generate Video (Veo 3) */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.generateVideo}</h4>
        <textarea
          placeholder={currentText.placeholders.prompt}
          value={generatePrompt}
          onChange={(e) => setGeneratePrompt(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <button onClick={handleGenerateVideo} disabled={isLoading || !generatePrompt} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.generateVideo}
        </button>
      </div>

      {/* Create Thumbnail (Imagen 3) */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.createThumbnail}</h4>
        <textarea
          placeholder={currentText.placeholders.prompt}
          value={thumbnailPrompt}
          onChange={(e) => setThumbnailPrompt(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <button onClick={handleCreateThumbnail} disabled={isLoading || !thumbnailPrompt} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.createThumbnail}
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

export default MediaAgentUI;
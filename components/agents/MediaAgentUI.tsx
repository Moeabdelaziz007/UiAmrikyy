import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { VideoIcon, Film, Image, Wand2, Upload, Loader, Youtube, Search } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

type GenerationState = 'idle' | 'generating' | 'polling' | 'success' | 'error';

interface MediaAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

interface YouTubeVideo {
    videoId: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
}

const MediaAgentUI: React.FC<MediaAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.media[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoImageFile, setVideoImageFile] = useState<File | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  const [videoState, setVideoState] = useState<GenerationState>('idle');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [videoError, setVideoError] = useState('');
  const [hasVeoApiKey, setHasVeoApiKey] = useState(false);
  const pollingIntervalRef = useRef<number | null>(null);

  // Image Editing State
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [originalEditImage, setOriginalEditImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  
  // Video Analysis State (Generic URL)
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAnalysisPrompt, setVideoAnalysisPrompt] = useState('');
  const [videoAnalysisResult, setVideoAnalysisResult] = useState('');

  // YouTube Tools State
  const [youtubeQuery, setYoutubeQuery] = useState('');
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideo[]>([]);
  const [youtubeSummary, setYoutubeSummary] = useState('');
  const [analyzingVideoId, setAnalyzingVideoId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refiningField, setRefiningField] = useState<string | null>(null);

  const handleRefinePrompt = async (
    prompt: string,
    context: string,
    setter: (value: string) => void,
    field: string
  ) => {
    if (!prompt) return;
    setIsRefining(true);
    setRefiningField(field);
    try {
      const response = await fetch(`/api/agents/prompt-engineer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });
      if (!response.ok) throw new Error('Failed to refine prompt');
      const data = await response.json();
      setter(data.refinedPrompt);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'promptEngineer',
        agentName: translations.agents.promptEngineer[lang].name,
        taskType: translations.agents.promptEngineer[lang].tasks.refinePrompt,
        taskInput: { prompt, context },
        taskOutput: data.refinedPrompt,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (error: any) {
      console.error('Prompt refinement failed:', error);
       onTaskComplete({
        id: Date.now().toString(),
        agentId: 'promptEngineer',
        agentName: translations.agents.promptEngineer[lang].name,
        taskType: translations.agents.promptEngineer[lang].tasks.refinePrompt,
        taskInput: { prompt, context },
        taskOutput: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
    } finally {
      setIsRefining(false);
      setRefiningField(null);
    }
  };


  useEffect(() => {
    // Check for Veo API key on mount
    const checkKey = async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setHasVeoApiKey(hasKey);
        }
    };
    checkKey();
    
    // Cleanup polling on unmount
    return () => {
        if(pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    }
  }, []);

  const handleSelectVeoKey = async () => {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
          // Assume success and update UI to allow generation
          setHasVeoApiKey(true);
      }
  };
  
  const executeTask = async (
    taskType: string,
    taskInput: Record<string, any>,
    taskKey: keyof typeof currentText.tasks
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: taskKey, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'media',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput,
        taskOutput: data,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
      return data;
    } catch (error: any) {
      console.error(`Media Agent task ${taskKey} failed:`, error);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'media',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput,
        taskOutput: { error: error.message },
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setGeneratedImage(null);
    try {
      const data = await executeTask(currentText.tasks.generateImage, { prompt: imagePrompt, aspectRatio: imageAspectRatio }, 'generateImage');
      setGeneratedImage(`data:${data.mimeType};base64,${data.image}`);
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    setVideoState('generating');
    setVideoResult(null);
    setVideoError('');
    let imagePayload: { imageBytes: string; mimeType: string } | undefined = undefined;
    if (videoImageFile) {
        const base64Data = await (window as any).fileToBase64(videoImageFile);
        imagePayload = { imageBytes: base64Data, mimeType: videoImageFile.type };
    }
    
    try {
      const operation = await executeTask(currentText.tasks.generateVideo, { prompt: videoPrompt, image: imagePayload, aspectRatio: videoAspectRatio }, 'generateVideo');
      setVideoState('polling');
      pollVideoStatus(operation);
    } catch(error: any) {
        setVideoState('error');
        setVideoError(error.message);
    }
  };
  
  const pollVideoStatus = (operation: any) => {
      pollingIntervalRef.current = window.setInterval(async () => {
          try {
              const response = await fetch(`/api/agents/media/video-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation }),
              });
              if (!response.ok) {
                  const err = await response.json();
                  throw new Error(err.error || 'Polling failed');
              }
              const updatedOperation = await response.json();
              if (updatedOperation.done) {
                  if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                  if (updatedOperation.response?.generatedVideos?.[0]?.video?.uri) {
                      setVideoState('success');
                      setVideoResult(updatedOperation.response.generatedVideos[0].video.uri);
                  } else {
                      setVideoState('error');
                      setVideoError('Video generation finished but no video was returned.');
                  }
              }
          } catch(error: any) {
              if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
              setVideoState('error');
              setVideoError(error.message);
              // If key is invalid, reset key state to prompt user again
              if (error.message.includes('API Key mismatch')) {
                  setHasVeoApiKey(false);
              }
          }
      }, 10000);
  };
  
  const handleEditImage = async () => {
      if (!editImageFile || !editPrompt) return;
      setEditedImage(null);
      const originalImageUrl = URL.createObjectURL(editImageFile);
      setOriginalEditImage(originalImageUrl);

      const base64Data = await (window as any).fileToBase64(editImageFile);
      const imagePayload = { imageBytes: base64Data, mimeType: editImageFile.type };

      try {
        const data = await executeTask(currentText.tasks.editImage, { image: imagePayload, prompt: editPrompt }, 'editImage');
        setEditedImage(`data:${data.mimeType};base64,${data.image}`);
      } catch (error) {
        console.error(error);
      }
  };

  const handleAnalyzeVideo = async () => {
    if (!videoUrl || !videoAnalysisPrompt) return;
    setVideoAnalysisResult('');
    try {
        const data = await executeTask(
            currentText.tasks.analyzeVideo,
            { videoUrl, prompt: videoAnalysisPrompt },
            'analyzeVideo'
        );
        setVideoAnalysisResult(data.result);
    } catch (error) {
        setVideoAnalysisResult(`Error: ${(error as Error).message}`);
    }
  };

  const handleSearchYouTube = async () => {
    if (!youtubeQuery) return;
    setYoutubeResults([]);
    setYoutubeSummary('');
    try {
      const data = await executeTask(currentText.tasks.searchVideos, { query: youtubeQuery }, 'searchVideos');
      setYoutubeResults(data.videos || []);
    } catch(error) {
      console.error(error);
    }
  };

  const handleSummarizeYouTube = async (title: string) => {
    setYoutubeSummary('');
    setAnalyzingVideoId(title); // Use title as a temporary ID for loading state
    try {
      const data = await executeTask('Summarize Video', { title }, 'summarizeVideo');
      setYoutubeSummary(data.result);
    } catch(error) {
      setYoutubeSummary(`Error summarizing video: ${(error as Error).message}`);
    } finally {
      setAnalyzingVideoId(null);
    }
  };


  const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;
  const buttonClass = (taskLoading: boolean) => `w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 space-y-6 ${currentThemeColors.background}`}
    >
      <h3 className={`text-2xl font-bold flex items-center gap-2 text-text`} style={{ color: currentThemeColors.primary }}>
        <VideoIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* YouTube Tools */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}><Youtube className="w-5 h-5" /> YouTube Tools</h4>
        <div className="flex gap-2 mb-3">
            <input
                type="text"
                placeholder={currentText.placeholders.query}
                value={youtubeQuery}
                onChange={(e) => setYoutubeQuery(e.target.value)}
                className={inputClass}
            />
            <button onClick={handleSearchYouTube} disabled={isLoading || !youtubeQuery} className="px-4 py-2 rounded-md text-white bg-primary hover:opacity-90 disabled:opacity-50">
              {isLoading ? <Loader className="animate-spin" /> : <Search />}
            </button>
        </div>
        {youtubeResults.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {youtubeResults.map(video => (
              <div key={video.videoId} className="flex items-start gap-2 p-2 bg-background rounded-md">
                <img src={video.thumbnail} alt={video.title} className="w-20 h-14 object-cover rounded" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-text truncate">{video.title}</p>
                  <p className="text-xs text-text-secondary">{video.channelTitle}</p>
                  <button onClick={() => handleSummarizeYouTube(video.title)} disabled={!!analyzingVideoId} className="mt-1 text-xs text-primary disabled:opacity-50">
                    {analyzingVideoId === video.title ? 'Summarizing...' : 'Summarize with AI'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {youtubeSummary && <p className="mt-4 p-2 bg-background rounded-md whitespace-pre-wrap text-sm">{youtubeSummary}</p>}
      </div>


      {/* Analyze Video (Gemini Pro) */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}><Youtube className="w-5 h-5" />{currentText.tasks.analyzeVideo}</h4>
        <input
            type="text"
            placeholder={currentText.placeholders.videoUrl}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={`${inputClass} mb-3`}
        />
        <div className="relative">
            <textarea
                placeholder={currentText.placeholders.videoPrompt}
                value={videoAnalysisPrompt}
                onChange={(e) => setVideoAnalysisPrompt(e.target.value)}
                className={`${inputClass} mb-3`}
                rows={2}
            />
            <button
                onClick={() => handleRefinePrompt(videoAnalysisPrompt, 'AI video analysis', setVideoAnalysisPrompt, 'videoAnalysisPrompt')}
                disabled={isRefining || !videoAnalysisPrompt}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-surface hover:bg-background transition-colors disabled:opacity-50"
                title="Refine with AI"
            >
                {isRefining && refiningField === 'videoAnalysisPrompt' ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}
            </button>
        </div>
        <button onClick={handleAnalyzeVideo} disabled={isLoading || !videoUrl || !videoAnalysisPrompt} className={buttonClass(isLoading)}>
            {isLoading ? <Loader className="mx-auto animate-spin" /> : currentText.tasks.analyzeVideo}
        </button>
        {videoAnalysisResult && <p className="mt-4 p-2 bg-background rounded-md whitespace-pre-wrap">{videoAnalysisResult}</p>}
      </div>

      {/* Generate Image (Imagen) */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}><Image className="w-5 h-5" />{currentText.tasks.generateImage}</h4>
        <div className="relative">
            <textarea
              placeholder={currentText.placeholders.prompt}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className={`${inputClass} mb-3`}
              rows={2}
            />
            <button
                onClick={() => handleRefinePrompt(imagePrompt, 'AI image generation (Imagen)', setImagePrompt, 'imagePrompt')}
                disabled={isRefining || !imagePrompt}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-surface hover:bg-background transition-colors disabled:opacity-50"
                title="Refine with AI"
            >
                {isRefining && refiningField === 'imagePrompt' ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}
            </button>
        </div>
        <select value={imageAspectRatio} onChange={e => setImageAspectRatio(e.target.value)} className={`${inputClass} mb-3`}>
            <option value="1:1">1:1 (Square)</option>
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="4:3">4:3 (Standard)</option>
            <option value="3:4">3:4 (Tall)</option>
        </select>
        <button onClick={handleGenerateImage} disabled={isLoading || !imagePrompt} className={buttonClass(isLoading)}>
          {isLoading ? <Loader className="mx-auto animate-spin" /> : currentText.tasks.generateImage}
        </button>
        {generatedImage && <img src={generatedImage} alt="Generated" className="mt-4 rounded-lg w-full" />}
      </div>

      {/* Edit Image (Gemini) */}
       <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}><Wand2 className="w-5 h-5" />{currentText.tasks.editImage}</h4>
        <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files ? e.target.files[0] : null)} className={`${inputClass} mb-3`} />
        <div className="relative">
            <textarea
              placeholder={currentText.placeholders.editPrompt}
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
              rows={2}
            />
            <button
                onClick={() => handleRefinePrompt(editPrompt, 'AI image editing', setEditPrompt, 'editPrompt')}
                disabled={isRefining || !editPrompt}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-surface hover:bg-background transition-colors disabled:opacity-50"
                title="Refine with AI"
            >
                {isRefining && refiningField === 'editPrompt' ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}
            </button>
        </div>
        <button onClick={handleEditImage} disabled={isLoading || !editImageFile || !editPrompt} className={buttonClass(isLoading)}>
          {isLoading ? <Loader className="mx-auto animate-spin" /> : currentText.tasks.editImage}
        </button>
        <div className="flex gap-4 mt-4">
            {originalEditImage && <div className="w-1/2"><p className="text-sm text-center mb-1">Original</p><img src={originalEditImage} alt="Original for editing" className="rounded-lg w-full" /></div>}
            {editedImage && <div className="w-1/2"><p className="text-sm text-center mb-1">Edited</p><img src={editedImage} alt="Edited" className="rounded-lg w-full" /></div>}
        </div>
      </div>


      {/* Generate Video (Veo) */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}><Film className="w-5 h-5" />{currentText.tasks.generateVideo}</h4>
        {!hasVeoApiKey ? (
            <div>
                 <p className="text-sm text-text-secondary mb-2">Video generation requires selecting a Google Cloud API key with the Veo API enabled. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-primary underline">Learn about billing</a>.</p>
                 <button onClick={handleSelectVeoKey} className={buttonClass(false)}>Select API Key</button>
            </div>
        ) : (
            <>
            <input type="file" accept="image/*" onChange={e => setVideoImageFile(e.target.files ? e.target.files[0] : null)} className={`${inputClass} mb-3`} />
            <div className="relative">
                <textarea
                  placeholder={currentText.placeholders.prompt}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className={`${inputClass} mb-3`}
                  rows={2}
                />
                <button
                    onClick={() => handleRefinePrompt(videoPrompt, 'AI video generation (Veo)', setVideoPrompt, 'videoPrompt')}
                    disabled={isRefining || !videoPrompt}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-surface hover:bg-background transition-colors disabled:opacity-50"
                    title="Refine with AI"
                >
                    {isRefining && refiningField === 'videoPrompt' ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}
                </button>
            </div>
             <select value={videoAspectRatio} onChange={e => setVideoAspectRatio(e.target.value)} className={`${inputClass} mb-3`}>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
            </select>
            <button onClick={handleGenerateVideo} disabled={isLoading || videoState === 'generating' || videoState === 'polling' || !videoPrompt} className={buttonClass(isLoading || videoState !== 'idle')}>
              {videoState === 'generating' || videoState === 'polling' ? <Loader className="mx-auto animate-spin" /> : currentText.tasks.generateVideo}
            </button>
            </>
        )}
        
        {(videoState === 'generating' || videoState === 'polling') && <p className="text-center text-sm text-text-secondary mt-2">Generating video... This can take several minutes. Please wait.</p>}
        {videoState === 'error' && <p className="text-center text-sm text-error mt-2">{videoError}</p>}
        {videoState === 'success' && videoResult && <video src={videoResult} controls className="mt-4 rounded-lg w-full" />}
      </div>

    </motion.div>
  );
};

export default MediaAgentUI;
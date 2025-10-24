import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  MegaphoneIcon, BarChartBigIcon, LineChartIcon, PencilLineIcon, Share2Icon, RocketIcon, PieChartIcon
} from '../IconComponents';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface MarketingAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

// Helper to check if the result is an object with text and optional groundingChunks
interface MarketingResult {
  text?: string;
  groundingChunks?: { web: { uri: string; title: string } }[];
}

const MarketingAgentUI: React.FC<MarketingAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.marketing[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  // States for Market Research
  const [targetAudience, setTargetAudience] = useState('');
  const [productService, setProductService] = useState('');
  const [competitors, setCompetitors] = useState('');

  // States for SEO Specialist
  const [productServiceSeo, setProductServiceSeo] = useState('');
  const [keywords, setKeywords] = useState('');

  // States for Content Strategist
  const [topic, setTopic] = useState('');
  const [targetAudienceContent, setTargetAudienceContent] = useState('');

  // States for Social Media Manager
  const [platform, setPlatform] = useState('');
  const [productServiceSocial, setProductServiceSocial] = useState('');

  // States for Campaign Manager
  const [campaignGoal, setCampaignGoal] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');

  // States for Analytics Expert
  const [dataToAnalyze, setDataToAnalyze] = useState('');
  const [metrics, setMetrics] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyticsFile, setAnalyticsFile] = useState<File | null>(null);


  const [result, setResult] = useState<MarketingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeTask = async (
    taskKey: string,
    taskInput: Record<string, any>,
  ) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch(`http://localhost:3000/api/agents/marketing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: taskKey, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      const formattedOutput: MarketingResult = data.result || { text: JSON.stringify(data) };
      setResult(formattedOutput);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'marketing',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey as keyof typeof currentText.tasks],
        taskInput: taskInput,
        taskOutput: formattedOutput,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (error: any) {
      console.error('Marketing Agent task failed:', error);
      setResult({ text: `Error: ${error.message}` });
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'marketing',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey as keyof typeof currentText.tasks],
        taskInput: taskInput,
        taskOutput: { text: `Error: ${error.message}` },
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarketResearch = () => {
    if (!targetAudience || !productService) return;
    executeTask('marketResearch', { targetAudience, productService, competitors });
  };

  const handleSeoSpecialist = () => {
    if (!productServiceSeo || !keywords) return;
    executeTask('seoSpecialist', { productService: productServiceSeo, keywords });
  };

  const handleContentStrategist = () => {
    if (!topic || !targetAudienceContent) return;
    executeTask('contentStrategist', { topic, targetAudience: targetAudienceContent });
  };

  const handleSocialMediaManager = () => {
    if (!platform || !productServiceSocial) return;
    executeTask('socialMediaManager', { platform, productService: productServiceSocial });
  };

  const handleCampaignManager = () => {
    if (!campaignGoal || !budget || !duration) return;
    executeTask('campaignManager', { campaignGoal, budget, duration });
  };

  const handleAnalyticsExpert = async () => {
    if (!dataToAnalyze && !analyticsFile) return;

    let fileDataPayload: { data: string, mimeType: string } | undefined = undefined;

    if (analyticsFile) {
        try {
            const base64Data = await (window as any).fileToBase64(analyticsFile);
            fileDataPayload = { data: base64Data, mimeType: analyticsFile.type };
        } catch (error) {
            console.error("Error converting file to base64", error);
            setResult({ text: `Error: Failed to read file.`});
            return;
        }
    }

    executeTask('analyticsExpert', { dataToAnalyze, metrics, searchQuery, fileData: fileDataPayload });
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
      <h3 className={`text-2xl font-bold flex items-center gap-2 text-text`} style={{ color: currentThemeColors.primary }}>
        <MegaphoneIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Market Research Analyst */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <BarChartBigIcon className="w-5 h-5" /> {currentText.tasks.marketResearch}
        </h4>
        <textarea
          placeholder={currentText.placeholders.targetAudience}
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.productService}
          value={productService}
          onChange={(e) => setProductService(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.competitors}
          value={competitors}
          onChange={(e) => setCompetitors(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleMarketResearch} disabled={isLoading || !targetAudience || !productService} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.marketResearch}
        </button>
      </div>

      {/* SEO Specialist */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <LineChartIcon className="w-5 h-5" /> {currentText.tasks.seoSpecialist}
        </h4>
        <input
          type="text"
          placeholder={currentText.placeholders.productService}
          value={productServiceSeo}
          onChange={(e) => setProductServiceSeo(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <textarea
          placeholder={currentText.placeholders.keywords}
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <button onClick={handleSeoSpecialist} disabled={isLoading || !productServiceSeo || !keywords} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.seoSpecialist}
        </button>
      </div>

      {/* Content Strategist */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <PencilLineIcon className="w-5 h-5" /> {currentText.tasks.contentStrategist}
        </h4>
        <input
          type="text"
          placeholder={currentText.placeholders.topic}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <textarea
          placeholder={currentText.placeholders.targetAudience}
          value={targetAudienceContent}
          onChange={(e) => setTargetAudienceContent(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <button onClick={handleContentStrategist} disabled={isLoading || !topic || !targetAudienceContent} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.contentStrategist}
        </button>
      </div>

      {/* Social Media Manager */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
          <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
              <Share2Icon className="w-5 h-5" /> {currentText.tasks.socialMediaManager}
          </h4>
          <input
              type="text"
              placeholder={currentText.placeholders.platform}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
          />
          <input
              type="text"
              placeholder={currentText.placeholders.productService}
              value={productServiceSocial}
              onChange={(e) => setProductServiceSocial(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
          />
          <button onClick={handleSocialMediaManager} disabled={isLoading || !platform || !productServiceSocial} className={buttonClass}>
              {isLoading ? globalText.loading : currentText.tasks.socialMediaManager}
          </button>
      </div>

      {/* Campaign Manager */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
          <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
              <RocketIcon className="w-5 h-5" /> {currentText.tasks.campaignManager}
          </h4>
          <input
              type="text"
              placeholder={currentText.placeholders.campaignGoal}
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
          />
          <input
              type="text"
              placeholder={currentText.placeholders.budget}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
          />
          <input
              type="text"
              placeholder={currentText.placeholders.duration}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
          />
          <button onClick={handleCampaignManager} disabled={isLoading || !campaignGoal || !budget || !duration} className={buttonClass}>
              {isLoading ? globalText.loading : currentText.tasks.campaignManager}
          </button>
      </div>

      {/* Analytics Expert */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
          <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
              <PieChartIcon className="w-5 h-5" /> {currentText.tasks.analyticsExpert}
          </h4>
          <textarea
              placeholder={currentText.placeholders.dataToAnalyze}
              value={dataToAnalyze}
              onChange={(e) => setDataToAnalyze(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
              rows={3}
          />
          <input
              type="text"
              placeholder={currentText.placeholders.metrics}
              value={metrics}
              onChange={(e) => setMetrics(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
          />
          <input
              type="text"
              placeholder={currentText.placeholders.searchQuery}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} mb-3`}
              style={{ borderColor: currentThemeColors.border }}
          />
          <input 
            type="file"
            accept=".csv,.json,.txt"
            onChange={(e) => setAnalyticsFile(e.target.files ? e.target.files[0] : null)}
            className={`${inputClass} mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20`}
          />
          {analyticsFile && <p className="text-xs text-text-secondary mb-2">Selected: {analyticsFile.name}</p>}
          <button onClick={handleAnalyticsExpert} disabled={isLoading || (!dataToAnalyze && !analyticsFile)} className={buttonClass}>
              {isLoading ? globalText.loading : currentText.tasks.analyticsExpert}
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
          <p className="whitespace-pre-wrap">{result.text}</p>
          {result.groundingChunks && result.groundingChunks.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
              <h5 className="text-sm font-semibold text-text-secondary">{globalText.sources}</h5>
              <ul className="list-disc list-inside text-sm mt-1">
                {result.groundingChunks.map((chunk, index) => (
                  <li key={index}>
                    <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" style={{ color: theme.colors.primary }}>
                      {chunk.web.title || chunk.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MarketingAgentUI;
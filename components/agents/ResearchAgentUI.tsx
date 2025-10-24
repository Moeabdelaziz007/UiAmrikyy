import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, MapPin } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

interface ResearchResult {
  text: string;
  groundingChunks: GroundingChunk[];
}

interface ResearchAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const ResearchAgentUI: React.FC<ResearchAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.research[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [webQuery, setWebQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const executeTask = async (
    taskType: 'webSearch' | 'locationQuery',
    taskInput: Record<string, any>,
  ) => {
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/agents/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: taskType, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      setResult(data);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'research',
        agentName: currentText.name,
        taskType: currentText.tasks[taskType],
        taskInput,
        taskOutput: data,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

    } catch (err: any) {
      setError(err.message);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'research',
        agentName: currentText.name,
        taskType: currentText.tasks[taskType],
        taskInput,
        taskOutput: { error: err.message },
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebSearch = () => {
    if (!webQuery) return;
    executeTask('webSearch', { query: webQuery });
  };

  const handleLocationQuery = (userLocation: GeolocationCoordinates | null) => {
    if (!locationQuery) return;
    const taskInput: { query: string; userLocation?: { latitude: number; longitude: number } } = { query: locationQuery };
    if (userLocation) {
      taskInput.userLocation = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }
    executeTask('locationQuery', taskInput);
  };
  
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationQuery(position.coords);
        },
        (error) => {
          setError(`Geolocation error: ${error.message}`);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };


  const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;
  const buttonClass = `w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 space-y-6 ${currentThemeColors.background}`}
    >
      <h3 className={`text-2xl font-bold flex items-center gap-2 text-text`} style={{ color: currentThemeColors.primary }}>
        <SearchIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Web Search */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.webSearch}</h4>
        <textarea
          placeholder={currentText.placeholders.query}
          value={webQuery}
          onChange={(e) => setWebQuery(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <button onClick={handleWebSearch} disabled={isLoading || !webQuery} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.webSearch}
        </button>
      </div>

      {/* Location Query */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.locationQuery}</h4>
        <textarea
          placeholder={currentText.placeholders.locationQuery}
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => handleLocationQuery(null)} disabled={isLoading || !locationQuery} className={buttonClass}>
            {isLoading ? globalText.loading : globalText.search || 'Search'}
          </button>
          <button onClick={handleUseMyLocation} disabled={isLoading || !locationQuery} className="w-full py-2 px-4 rounded-md text-white font-semibold bg-secondary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{backgroundColor: theme.colors.secondary}}>
            <MapPin size={16} /> {lang === 'ar' ? 'استخدام موقعي' : 'Use My Location'}
          </button>
        </div>
      </div>

      {isLoading && <p className="text-center text-text-secondary">{globalText.loading}</p>}
      {error && <p className="text-center text-error">{error}</p>}

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
                {result.groundingChunks.map((chunk, index) => {
                    const source = chunk.web || chunk.maps;
                    if (!source) return null;
                    return (
                      <li key={index}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" style={{ color: theme.colors.primary }}>
                          {source.title || source.uri}
                        </a>
                      </li>
                    );
                })}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResearchAgentUI;
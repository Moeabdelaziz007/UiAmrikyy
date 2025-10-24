import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, Hotel, Star, DollarSign } from 'lucide-react'; // Using Lucide-React icons
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface ResearchAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const ResearchAgentUI: React.FC<ResearchAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.research[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState('');
  const [itemName, setItemName] = useState('');
  const [placeName, setPlaceName] = useState('');
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
      agentId: 'research',
      agentName: currentText.name,
      taskType: taskType,
      taskInput: taskInput,
      taskOutput: isError ? errorMessage : (typeof mockOutput === 'string' ? mockOutput : JSON.stringify(mockOutput)),
      timestamp: new Date().toISOString(),
      status: isError ? 'error' : 'success',
      errorMessage: isError ? errorMessage : undefined,
    });
  };

  const handleWebSearch = () => {
    if (!query) return;
    mockExecuteTask(
      currentText.tasks.webSearch,
      { query },
      currentText.mockResults.webSearch
    );
  };

  const handleFindHotels = () => {
    if (!location) return;
    mockExecuteTask(
      currentText.tasks.findHotels,
      { location, filters },
      currentText.mockResults.hotels
    );
  };

  const handleGetReviews = () => {
    if (!placeName) return;
    mockExecuteTask(
      currentText.tasks.getReviews,
      { placeName },
      currentText.mockResults.reviews
    );
  };

  const handleComparePrices = () => {
    if (!itemName) return;
    mockExecuteTask(
      currentText.tasks.comparePrices,
      { itemName },
      currentText.mockResults.prices
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
        <SearchIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Web Search */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.webSearch}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.query}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleWebSearch} disabled={isLoading || !query} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.webSearch}
        </button>
      </div>

      {/* Find Hotels */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.findHotels}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.location}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.filters}
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleFindHotels} disabled={isLoading || !location} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.findHotels}
        </button>
      </div>

      {/* Get Reviews */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.getReviews}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.itemName}
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleGetReviews} disabled={isLoading || !placeName} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.getReviews}
        </button>
      </div>
      
      {/* Compare Prices */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.comparePrices}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.itemName}
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleComparePrices} disabled={isLoading || !itemName} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.comparePrices}
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

export default ResearchAgentUI;
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon } from '../IconComponents'; // Using Lucide-React icons
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface NavigatorAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const NavigatorAgentUI: React.FC<NavigatorAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.navigator[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [location, setLocation] = useState('');
  const [placeType, setPlaceType] = useState('');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const executeTask = async (
    taskType: string,
    taskInput: Record<string, any>,
  ) => {
    setIsLoading(true);
    setResult('');
    try {
      const response = await fetch(`http://localhost:3000/api/agents/navigator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: taskType, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      let formattedOutput = '';
      // Custom formatting for NavigatorAgent's real output
      switch (taskType) {
        case 'getDirections':
          formattedOutput = `Route: ${data.summary || currentText.mockResults.directions}`;
          break;
        case 'findNearby':
          formattedOutput = `Found ${data.results?.length || 0} places. Top: ${data.results?.[0]?.name || currentText.mockResults.nearby}`;
          break;
        case 'geocode':
          formattedOutput = `Geocoded: ${data.location?.lat}, ${data.location?.lng || currentText.mockResults.geocode}`;
          break;
        default:
          formattedOutput = JSON.stringify(data); // Fallback for unexpected task types
      }

      setResult(formattedOutput);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'navigator',
        agentName: currentText.name,
        taskType: currentText.tasks[taskType as keyof typeof currentText.tasks],
        taskInput: taskInput,
        taskOutput: formattedOutput,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (error: any) {
      console.error('Navigator Agent task failed:', error);
      setResult(`Error: ${error.message}`);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'navigator',
        agentName: currentText.name,
        taskType: currentText.tasks[taskType as keyof typeof currentText.tasks],
        taskInput: taskInput,
        taskOutput: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDirections = () => {
    if (!origin || !destination) return;
    executeTask(
      'getDirections',
      { origin, destination },
    );
  };

  const handleFindNearby = () => {
    if (!location || !placeType) return;
    // Assume location is lat,lng string, convert to object if needed for API
    const [lat, lng] = location.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) {
      setResult("Error: Invalid location format. Use 'lat,lng'.");
      return;
    }
    executeTask(
      'findNearby',
      { location: { lat, lng }, placeType },
    );
  };

  const handleGeocode = () => {
    if (!address) return;
    executeTask(
      'geocode',
      { address },
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
        <MapPinIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Get Directions */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.getDirections}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.origin}
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.destination}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleGetDirections} disabled={isLoading || !origin || !destination} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.getDirections}
        </button>
      </div>

      {/* Find Nearby */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.findNearby}</h4>
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
          placeholder={currentText.placeholders.placeType}
          value={placeType}
          onChange={(e) => setPlaceType(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleFindNearby} disabled={isLoading || !location || !placeType} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.findNearby}
        </button>
      </div>

      {/* Geocode Address */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.geocode}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.address}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleGeocode} disabled={isLoading || !address} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.geocode}
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

export default NavigatorAgentUI;
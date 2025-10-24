import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { PlaneTakeoffIcon, Calendar, Hotel, Plane, MapPin, Search } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface TravelResult {
  text: string;
  groundingChunks?: { web?: { uri: string; title: string }; maps?: { uri: string; title: string } }[];
  directions?: any; // For direct API response
}

interface TravelAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

type Tab = 'itinerary' | 'flights' | 'hotels' | 'places' | 'directions';

const TravelAgentUI: React.FC<TravelAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.travel[lang];
  const globalText = translations.global[lang];

  const [activeTab, setActiveTab] = useState<Tab>('itinerary');

  // State for inputs
  const [itineraryPrompt, setItineraryPrompt] = useState('');
  const [flightOrigin, setFlightOrigin] = useState('');
  const [flightDestination, setFlightDestination] = useState('');
  const [flightDates, setFlightDates] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelDates, setHotelDates] = useState('');
  const [hotelCriteria, setHotelCriteria] = useState('');
  const [placesLocation, setPlacesLocation] = useState('');
  const [placesType, setPlacesType] = useState('');
  const [directionsOrigin, setDirectionsOrigin] = useState('');
  const [directionsDestination, setDirectionsDestination] = useState('');

  const [result, setResult] = useState<TravelResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const executeTask = async (taskKey: keyof typeof currentText.tasks, taskInput: Record<string, any>) => {
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/agents/travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: taskKey, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      setResult(data);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'travel',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput,
        taskOutput: data,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (err: any) {
      setError(err.message);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'travel',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
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

  const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;
  const buttonClass = `w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`;
  
  const tabs: { id: Tab; icon: React.FC<any>; label: string }[] = [
    { id: 'itinerary', icon: Calendar, label: currentText.tasks.createItinerary },
    { id: 'flights', icon: Plane, label: currentText.tasks.findFlights },
    { id: 'hotels', icon: Hotel, label: currentText.tasks.findHotels },
    { id: 'places', icon: Search, label: currentText.tasks.findPlaces },
    { id: 'directions', icon: MapPin, label: currentText.tasks.getDirections },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 h-full flex flex-col`} style={{ background: theme.colors.background }}>
      <header className="flex items-center gap-2 pb-4 border-b flex-shrink-0" style={{ borderColor: theme.colors.border }}>
        <PlaneTakeoffIcon className="w-8 h-8" style={{ color: theme.colors.primary }} />
        <div>
          <h3 className={`text-2xl font-bold text-text`}>{currentText.name}</h3>
          <p className={`text-sm text-text-secondary`}>{currentText.description}</p>
        </div>
      </header>

      <div className="flex border-b overflow-x-auto custom-scrollbar" style={{ borderColor: theme.colors.border }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-primary border-b-2' : 'text-text-secondary hover:bg-white/5'}`}
            style={{ borderColor: activeTab === tab.id ? theme.colors.primary : 'transparent' }}
          >
            <tab.icon size={16} />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'itinerary' && (
          <div className="space-y-3">
            <textarea placeholder={currentText.placeholders.itineraryPrompt} value={itineraryPrompt} onChange={e => setItineraryPrompt(e.target.value)} className={`${inputClass}`} rows={4} />
            <button onClick={() => executeTask('createItinerary', { prompt: itineraryPrompt })} disabled={isLoading || !itineraryPrompt} className={buttonClass}>{isLoading ? globalText.loading : currentText.tasks.createItinerary}</button>
          </div>
        )}
        {activeTab === 'flights' && (
          <div className="space-y-3">
            <input type="text" placeholder={currentText.placeholders.flightOrigin} value={flightOrigin} onChange={e => setFlightOrigin(e.target.value)} className={inputClass} />
            <input type="text" placeholder={currentText.placeholders.flightDestination} value={flightDestination} onChange={e => setFlightDestination(e.target.value)} className={inputClass} />
            <input type="text" placeholder={currentText.placeholders.flightDates} value={flightDates} onChange={e => setFlightDates(e.target.value)} className={inputClass} />
            <button onClick={() => executeTask('findFlights', { origin: flightOrigin, destination: flightDestination, dates: flightDates })} disabled={isLoading || !flightOrigin || !flightDestination} className={buttonClass}>{isLoading ? globalText.loading : currentText.tasks.findFlights}</button>
          </div>
        )}
        {activeTab === 'hotels' && (
          <div className="space-y-3">
            <input type="text" placeholder={currentText.placeholders.hotelLocation} value={hotelLocation} onChange={e => setHotelLocation(e.target.value)} className={inputClass} />
            <input type="text" placeholder={currentText.placeholders.hotelDates} value={hotelDates} onChange={e => setHotelDates(e.target.value)} className={inputClass} />
            <input type="text" placeholder={currentText.placeholders.hotelCriteria} value={hotelCriteria} onChange={e => setHotelCriteria(e.target.value)} className={inputClass} />
            <button onClick={() => executeTask('findHotels', { location: hotelLocation, dates: hotelDates, criteria: hotelCriteria })} disabled={isLoading || !hotelLocation} className={buttonClass}>{isLoading ? globalText.loading : currentText.tasks.findHotels}</button>
          </div>
        )}
        {activeTab === 'places' && (
            <div className="space-y-3">
            <input type="text" placeholder={currentText.placeholders.placesLocation} value={placesLocation} onChange={e => setPlacesLocation(e.target.value)} className={inputClass} />
            <input type="text" placeholder={currentText.placeholders.placesType} value={placesType} onChange={e => setPlacesType(e.target.value)} className={inputClass} />
            <button onClick={() => executeTask('findPlacesOfInterest', { location: placesLocation, placeType: placesType })} disabled={isLoading || !placesLocation || !placesType} className={buttonClass}>{isLoading ? globalText.loading : currentText.tasks.findPlaces}</button>
            </div>
        )}
        {activeTab === 'directions' && (
            <div className="space-y-3">
            <input type="text" placeholder={currentText.placeholders.directionsOrigin} value={directionsOrigin} onChange={e => setDirectionsOrigin(e.target.value)} className={inputClass} />
            <input type="text" placeholder={currentText.placeholders.directionsDestination} value={directionsDestination} onChange={e => setDirectionsDestination(e.target.value)} className={inputClass} />
            <button onClick={() => executeTask('getDirections', { origin: directionsOrigin, destination: directionsDestination })} disabled={isLoading || !directionsOrigin || !directionsDestination} className={buttonClass}>{isLoading ? globalText.loading : currentText.tasks.getDirections}</button>
            </div>
        )}

        {error && <p className="text-center text-error">{error}</p>}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-lg bg-surface">
            <h4 className="font-semibold mb-2">{globalText.output}:</h4>
            <div className="whitespace-pre-wrap text-sm">{result.directions ? `Route: ${result.directions.summary} (${result.directions.distance}, ${result.directions.duration})` : result.text}</div>
             {result.groundingChunks && result.groundingChunks.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
                <h5 className="text-xs font-semibold text-text-secondary">{globalText.sources}</h5>
                <ul className="list-disc list-inside text-xs mt-1">
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
      </div>
    </motion.div>
  );
};

export default TravelAgentUI;
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, Plus, CheckCircle, Bell, Clock } from 'lucide-react'; // Using Lucide-React icons
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface SchedulerAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const SchedulerAgentUI: React.FC<SchedulerAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.scheduler[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [eventId, setEventId] = useState('');
  const [reminder, setReminder] = useState('');
  const [itineraryData, setItineraryData] = useState(''); // Mock for JSON input
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
      const response = await fetch(`/api/agents/scheduler`, {
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
        agentId: 'scheduler',
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
        agentId: 'scheduler',
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


  const handleCreateEvent = () => {
    if (!eventTitle || !startTime || !endTime) return;
    executeTask('createEvent', { title: eventTitle, location: eventLocation, startTime, endTime });
  };

  const handleCheckAvailability = () => {
    if (!timeRange) return;
    executeTask('checkAvailability', { timeRange });
  };

  const handleSetReminder = () => {
    if (!eventId || !reminder) return;
    executeTask('setReminder', { eventId, reminder });
  };

  const handleSyncItinerary = () => {
    if (!itineraryData) return;
    executeTask('syncItinerary', { itineraryData });
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
        <CalendarIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Create Event */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.createEvent}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.title}
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.location}
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="datetime-local"
          placeholder={currentText.placeholders.startTime}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="datetime-local"
          placeholder={currentText.placeholders.endTime}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleCreateEvent} disabled={isLoading || !eventTitle || !startTime || !endTime} className={buttonClass}>
          {isLoading && currentTask === 'createEvent' ? globalText.loading : currentText.tasks.createEvent}
        </button>
      </div>

      {/* Check Availability */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.checkAvailability}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.timeRange}
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleCheckAvailability} disabled={isLoading || !timeRange} className={buttonClass}>
          {isLoading && currentTask === 'checkAvailability' ? globalText.loading : currentText.tasks.checkAvailability}
        </button>
      </div>

      {/* Set Reminder */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.setReminder}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.eventId}
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.reminder}
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleSetReminder} disabled={isLoading || !eventId || !reminder} className={buttonClass}>
          {isLoading && currentTask === 'setReminder' ? globalText.loading : currentText.tasks.setReminder}
        </button>
      </div>

      {/* Sync Itinerary */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.syncItinerary}</h4>
        <textarea
          placeholder={currentText.placeholders.itineraryData}
          value={itineraryData}
          onChange={(e) => setItineraryData(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <button onClick={handleSyncItinerary} disabled={isLoading || !itineraryData} className={buttonClass}>
          {isLoading && currentTask === 'syncItinerary' ? globalText.loading : currentText.tasks.syncItinerary}
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

export default SchedulerAgentUI;
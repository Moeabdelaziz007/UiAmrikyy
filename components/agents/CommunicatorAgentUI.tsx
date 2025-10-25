import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { MailIcon, Send, Bell } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface CommunicatorAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const CommunicatorAgentUI: React.FC<CommunicatorAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.communicator[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [itineraryData, setItineraryData] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramMessage, setTelegramMessage] = useState('');
  
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
      const response = await fetch(`/api/agents/communicator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: taskKey, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      const formattedOutput = data.message || (typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
      setResult(formattedOutput);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'communicator',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput,
        taskOutput: data,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (error: any) {
      const errorMessage = `Error: ${error.message}`;
      setResult(errorMessage);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'communicator',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey],
        taskInput,
        taskOutput: { error: errorMessage },
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
    } finally {
      setIsLoading(false);
      setCurrentTask('');
    }
  };

  const handleSendEmail = () => {
    if (!recipient || !subject || !body) return;
    executeTask('sendEmail', { recipient, subject, body });
  };

  const handleEmailItinerary = () => {
    if (!recipient || !itineraryData) return;
    executeTask('emailItinerary', { recipient, itineraryData });
  };
  
  const handleSendTelegramMessage = () => {
    if (!telegramChatId || !telegramMessage) return;
    executeTask('sendTelegramMessage', { chatId: telegramChatId, message: telegramMessage });
  };

  const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;
  const buttonClass = `w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 space-y-6 h-full overflow-y-auto custom-scrollbar`}
      style={{ background: currentThemeColors.background }}
    >
      <header className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: theme.colors.border }}>
        <MailIcon className="w-8 h-8" style={{ color: currentThemeColors.primary }} />
        <div>
            <h3 className={`text-2xl font-bold text-text`}>{currentText.name}</h3>
            <p className={`text-sm text-text-secondary`}>{currentText.description}</p>
        </div>
      </header>

      {/* Send Telegram Message */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <Send className="w-5 h-5" /> {currentText.tasks.sendTelegramMessage}
        </h4>
        <input
          type="text"
          placeholder={currentText.placeholders.telegramChatId}
          value={telegramChatId}
          onChange={(e) => setTelegramChatId(e.target.value)}
          className={`${inputClass} mb-3`}
        />
        <textarea
          placeholder={currentText.placeholders.telegramMessage}
          value={telegramMessage}
          onChange={(e) => setTelegramMessage(e.target.value)}
          className={`${inputClass} mb-3`}
          rows={3}
        />
        <button onClick={handleSendTelegramMessage} disabled={isLoading || !telegramChatId || !telegramMessage} className={buttonClass}>
          {isLoading && currentTask === 'sendTelegramMessage' ? globalText.loading : currentText.tasks.sendTelegramMessage}
        </button>
      </div>

      {/* Send Email */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
            <MailIcon className="w-5 h-5" /> {currentText.tasks.sendEmail}
        </h4>
        <input
          type="email"
          placeholder={currentText.placeholders.to}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className={`${inputClass} mb-3`}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.subject}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`${inputClass} mb-3`}
        />
        <textarea
          placeholder={currentText.placeholders.body}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} mb-3`}
          rows={4}
        />
        <button onClick={handleSendEmail} disabled={isLoading || !recipient || !subject || !body} className={buttonClass}>
          {isLoading && currentTask === 'sendEmail' ? globalText.loading : currentText.tasks.sendEmail}
        </button>
      </div>

      {/* Email Itinerary */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.emailItinerary}</h4>
        <input
          type="email"
          placeholder={currentText.placeholders.to}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className={`${inputClass} mb-3`}
        />
        <textarea
          placeholder={currentText.placeholders.itineraryData}
          value={itineraryData}
          onChange={(e) => setItineraryData(e.target.value)}
          className={`${inputClass} mb-3`}
          rows={3}
        />
        <button onClick={handleEmailItinerary} disabled={isLoading || !recipient || !itineraryData} className={buttonClass}>
          {isLoading && currentTask === 'emailItinerary' ? globalText.loading : currentText.tasks.emailItinerary}
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

export default CommunicatorAgentUI;
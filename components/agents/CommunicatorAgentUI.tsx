import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { MailIcon, Send, Mail, Bell } from 'lucide-react'; // Using Lucide-React icons
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
  const [itineraryData, setItineraryData] = useState(''); // Mock for JSON input
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // New states for Telegram
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramMessage, setTelegramMessage] = useState('');
  
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState('');


  const executeTask = async (
    taskType: string,
    taskInput: Record<string, any>,
    taskKey: keyof typeof currentText.tasks
  ) => {
    setIsLoading(true);
    setCurrentTask(taskKey);
    setResult('');
    try {
      const response = await fetch(`http://localhost:3000/api/agents/communicator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: taskKey, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      const formattedOutput = data.message || JSON.stringify(data);
      setResult(formattedOutput);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'communicator',
        agentName: currentText.name,
        taskType,
        taskInput,
        taskOutput: formattedOutput,
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
        taskType,
        taskInput,
        taskOutput: errorMessage,
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
    executeTask(
      currentText.tasks.sendEmail,
      { to: recipient, subject, body },
      'sendEmail'
    );
  };

  const handleEmailItinerary = () => {
    if (!recipient || !itineraryData) return;
    executeTask(
      currentText.tasks.emailItinerary,
      { to: recipient, itineraryData },
      'emailItinerary'
    );
  };

  const handleSendNotification = () => {
    if (!notificationMessage) return;
    executeTask(
      currentText.tasks.sendNotification,
      { message: notificationMessage },
      'sendNotification'
    );
  };
  
  const handleSendTelegramMessage = () => {
    if (!telegramChatId || !telegramMessage) return;
    executeTask(
      currentText.tasks.sendTelegramMessage,
      { chatId: telegramChatId, message: telegramMessage },
      'sendTelegramMessage'
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
        <MailIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>
      
      {/* Send Telegram Message */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.sendTelegramMessage}</h4>
        <input
          type="text"
          placeholder={currentText.placeholders.telegramChatId}
          value={telegramChatId}
          onChange={(e) => setTelegramChatId(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <textarea
          placeholder={currentText.placeholders.telegramMessage}
          value={telegramMessage}
          onChange={(e) => setTelegramMessage(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <button onClick={handleSendTelegramMessage} disabled={isLoading || !telegramChatId || !telegramMessage} className={buttonClass}>
          {isLoading && currentTask === 'sendTelegramMessage' ? globalText.loading : currentText.tasks.sendTelegramMessage}
        </button>
      </div>


      {/* Send Email */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.sendEmail}</h4>
        <input
          type="email"
          placeholder={currentText.placeholders.to}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.subject}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <textarea
          placeholder={currentText.placeholders.body}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
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
          style={{ borderColor: currentThemeColors.border }}
        />
        <textarea
          placeholder={currentText.placeholders.itineraryData}
          value={itineraryData}
          onChange={(e) => setItineraryData(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <button onClick={handleEmailItinerary} disabled={isLoading || !recipient || !itineraryData} className={buttonClass}>
          {isLoading && currentTask === 'emailItinerary' ? globalText.loading : currentText.tasks.emailItinerary}
        </button>
      </div>

      {/* Send Notification */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text`}>{currentText.tasks.sendNotification}</h4>
        <textarea
          placeholder={currentText.placeholders.message}
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={2}
        />
        <button onClick={handleSendNotification} disabled={isLoading || !notificationMessage} className={buttonClass}>
          {isLoading && currentTask === 'sendNotification' ? globalText.loading : currentText.tasks.sendNotification}
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

export default CommunicatorAgentUI;
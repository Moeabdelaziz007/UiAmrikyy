import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import useTaskHistoryStore from '../../stores/taskHistoryStore';
import { TaskHistoryEntry } from '../../types';

const TaskEntry: React.FC<{ entry: TaskHistoryEntry }> = ({ entry }) => {
  const { theme } = useTheme();
  const { lang } = useContext(LanguageContext);
  const globalText = translations.global[lang];
  const [isExpanded, setIsExpanded] = React.useState(false);

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString(lang, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  };

  const renderData = (data: string | Record<string, any>) => {
    if (typeof data === 'string') {
      return <p className="whitespace-pre-wrap">{data}</p>;
    }
    // Pretty print JSON for objects
    return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-3 rounded-lg border"
      style={{ background: theme.colors.surface, borderColor: theme.colors.border }}
    >
      <div className="flex items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-1 flex items-center gap-3">
          {entry.status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <XCircle className="w-5 h-5 text-error" />
          )}
          <div>
            <p className="font-semibold text-text">{entry.agentName}: <span className="font-normal text-text-secondary">{entry.taskType}</span></p>
            <p className="text-xs text-text-secondary">{formatTimestamp(entry.timestamp)}</p>
          </div>
        </div>
        <button className="p-1">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '12px' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-3 border-t" style={{ borderColor: theme.colors.border }}>
              <div>
                <strong className="text-text-secondary">{globalText.input}:</strong>
                <div className="mt-1 p-2 bg-background rounded max-h-40 overflow-auto">{renderData(entry.taskInput)}</div>
              </div>
              <div>
                <strong className="text-text-secondary">{globalText.output}:</strong>
                <div className="mt-1 p-2 bg-background rounded max-h-40 overflow-auto">{renderData(entry.taskOutput)}</div>
              </div>
              {entry.status === 'error' && entry.errorMessage && (
                <div className="md:col-span-2">
                  <strong className="text-error">{globalText.errorMessage}:</strong>
                  <div className="mt-1 p-2 bg-error/10 text-error rounded">{entry.errorMessage}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const TaskHistoryApp: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.global[lang];
  const { history, clearHistory } = useTaskHistoryStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(entry => {
    if (!searchQuery) return true;
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    // Safely stringify and lowercase inputs/outputs
    const inputString = (typeof entry.taskInput === 'string' ? entry.taskInput : JSON.stringify(entry.taskInput)).toLowerCase();
    const outputString = (typeof entry.taskOutput === 'string' ? entry.taskOutput : JSON.stringify(entry.taskOutput)).toLowerCase();

    return (
      entry.agentName.toLowerCase().includes(lowerCaseQuery) ||
      entry.taskType.toLowerCase().includes(lowerCaseQuery) ||
      inputString.includes(lowerCaseQuery) ||
      outputString.includes(lowerCaseQuery)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
      style={{ background: theme.colors.background, color: theme.colors.text }}
    >
      <header className="flex items-center justify-between p-4 border-b flex-shrink-0 gap-4 flex-wrap sm:flex-nowrap" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <History className="w-6 h-6 text-primary" style={{color: theme.colors.primary}} />
          <h1 className="text-xl font-bold">{currentText.taskHistory}</h1>
        </div>

        <div className="flex-1 min-w-0 order-3 sm:order-2 w-full sm:w-auto">
            <input 
              type="text"
              placeholder={currentText.searchHistory}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/50 border rounded-lg px-3 py-1.5 text-sm text-text focus:ring-2 focus:ring-primary focus:border-transparent"
              style={{ background: theme.colors.background, borderColor: theme.colors.border }}
            />
        </div>

        <button
          onClick={clearHistory}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-surface hover:bg-background transition-colors disabled:opacity-50 flex-shrink-0 order-2 sm:order-3"
          style={{ borderColor: theme.colors.border }}
          disabled={history.length === 0}
        >
          <Trash2 size={14} />
          {currentText.clearHistory}
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-secondary">
            {history.length > 0 ? currentText.noResultsFound : currentText.noTasksYet}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredHistory.map((entry) => (
                <TaskEntry key={entry.id} entry={entry} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default TaskHistoryApp;
import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, AlertTriangle, Loader } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import useTaskHistoryStore from '../../stores/taskHistoryStore';
import useSystemStore from '../../stores/systemStore';
import { TaskHistoryEntry, GuardianAnalysis } from '../../types';

const TaskEntry: React.FC<{ entry: TaskHistoryEntry }> = ({ entry }) => {
  const { theme } = useTheme();
  const { lang } = useContext(LanguageContext);
  const globalText = translations.global[lang];
  const { addTask } = useTaskHistoryStore();
  const { incrementSuccessfulDebugs } = useSystemStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [analysis, setAnalysis] = useState<GuardianAnalysis | null>(null);

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
    return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(data, null, 2)}</pre>;
  };
  
  const handleDebug = async () => {
    if (isDebugging) return;
    setIsDebugging(true);
    setAnalysis(null);
    try {
      const response = await fetch('http://localhost:3000/api/agents/guardian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failedTask: entry }),
      });
      if (!response.ok) throw new Error('Guardian Agent failed to respond.');
      const data: GuardianAnalysis = await response.json();
      setAnalysis(data);
    } catch (error) {
      setAnalysis({
        diagnosis: 'Failed to communicate with Guardian Agent.',
        suggestion: (error as Error).message,
      });
    } finally {
      setIsDebugging(false);
    }
  };
  
  const handleRetry = async () => {
    if (!analysis?.retryInput) return;
    setIsRetrying(true);

    try {
        const response = await fetch(`http://localhost:3000/api/agents/${entry.agentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: entry.taskType, ...analysis.retryInput }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Retry attempt failed.');
        }

        addTask({
            id: Date.now().toString(),
            agentId: entry.agentId,
            agentName: entry.agentName,
            taskType: entry.taskType,
            taskInput: analysis.retryInput,
            taskOutput: data,
            timestamp: new Date().toISOString(),
            status: 'success',
        });
        incrementSuccessfulDebugs(); // Reward!

    } catch (error: any) {
        addTask({
            id: Date.now().toString(),
            agentId: entry.agentId,
            agentName: entry.agentName,
            taskType: entry.taskType,
            taskInput: analysis.retryInput,
            taskOutput: { error: error.message },
            timestamp: new Date().toISOString(),
            status: 'error',
            errorMessage: error.message,
        });
    } finally {
        setIsRetrying(false);
    }
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
            <div className="space-y-3 pt-3 border-t text-sm" style={{ borderColor: theme.colors.border }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <strong className="text-text-secondary">{globalText.input}:</strong>
                        <div className="mt-1 p-2 bg-background rounded max-h-40 overflow-auto">{renderData(entry.taskInput)}</div>
                    </div>
                    <div>
                        <strong className="text-text-secondary">{globalText.output}:</strong>
                        <div className="mt-1 p-2 bg-background rounded max-h-40 overflow-auto">{renderData(entry.taskOutput)}</div>
                    </div>
                </div>

                {entry.status === 'error' && (
                    <div className="p-3 bg-error/10 rounded-lg space-y-3">
                        <div className="flex items-start gap-2 text-error">
                            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="block">{globalText.errorMessage}:</strong>
                                <p>{entry.errorMessage}</p>
                            </div>
                        </div>
                        
                        {!analysis && (
                            <button onClick={handleDebug} disabled={isDebugging} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-surface hover:bg-background transition-colors text-primary" style={{borderColor: theme.colors.primary}}>
                                {isDebugging ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isDebugging ? globalText.debugging : globalText.askGuardian}
                            </button>
                        )}
                    </div>
                )}
                 
                {analysis && (
                    <div className="p-3 bg-primary/10 rounded-lg space-y-3">
                        <div>
                            <strong className="text-primary">{globalText.guardianDiagnosis}:</strong>
                            <p className="mt-1 text-text-secondary">{analysis.diagnosis}</p>
                        </div>
                        <div>
                            <strong className="text-primary">{globalText.guardianSuggestion}:</strong>
                            <p className="mt-1 text-text-secondary">{analysis.suggestion}</p>
                        </div>
                         {analysis.retryInput && (
                            <button onClick={handleRetry} disabled={isRetrying} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-surface hover:bg-background transition-colors text-primary" style={{borderColor: theme.colors.primary}}>
                                {isRetrying ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                {globalText.retryWithSuggestion}
                            </button>
                        )}
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
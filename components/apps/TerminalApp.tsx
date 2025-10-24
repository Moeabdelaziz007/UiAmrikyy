import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TerminalIcon, Send } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface TerminalAppProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
  // appId is passed by WindowManager, but not directly used here for mock content
}

interface TerminalOutput {
  id: number;
  type: 'command' | 'response' | 'error';
  text: string;
}

// FIX: Update mockCommands type definition to correctly include a function for 'echo'
const mockCommands: Record<string, string | ((message: string) => string)> = {
  'help': 'Available commands: help, ls, pwd, echo [message], clear',
  'ls': `file1.txt   folder/   image.png   project.js`,
  'pwd': `/home/user`,
  'echo': (message: string) => message,
  'clear': '', // Handled specially
  'whoami': 'Amrikyyy AI OS User',
  'date': new Date().toLocaleString(),
};

const TerminalApp: React.FC<TerminalAppProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.global[lang]; // Use global translations for Terminal
  const currentThemeColors = theme.colors;

  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const processCommand = (cmd: string) => {
    const newOutput: TerminalOutput[] = [];
    newOutput.push({ id: Date.now() + Math.random(), type: 'command', text: `> ${cmd}` });

    const parts = cmd.trim().split(' ');
    const mainCommand = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let responseText: string;
    let responseType: 'response' | 'error' = 'response';

    switch (mainCommand) {
      case 'help':
        responseText = mockCommands['help'] as string;
        break;
      case 'ls':
        responseText = mockCommands['ls'] as string;
        break;
      case 'pwd':
        responseText = mockCommands['pwd'] as string;
        break;
      case 'echo':
        // FIX: Ensure 'echo' command is called as a function.
        responseText = (mockCommands['echo'] as (message: string) => string)(args || '');
        break;
      case 'clear':
        setOutput([]); // Clear output directly
        setCommand('');
        onTaskComplete({
          id: Date.now().toString(),
          agentId: 'terminal',
          agentName: currentText.terminal,
          taskType: 'Clear Console',
          taskInput: cmd,
          taskOutput: 'Console cleared',
          timestamp: new Date().toISOString(),
          status: 'success',
        });
        return; // Exit early to avoid adding clear command to output
      case 'whoami':
        responseText = mockCommands['whoami'] as string;
        break;
      case 'date':
        responseText = mockCommands['date'] as string;
        break;
      default:
        responseText = `Error: Command not found: ${mainCommand}`;
        responseType = 'error';
    }

    newOutput.push({ id: Date.now() + Math.random() + 1, type: responseType, text: responseText });
    
    setOutput((prev) => [...prev, ...newOutput]);
    setCommand('');
    setHistoryIndex(-1); // Reset history index

    // Log to task history
    onTaskComplete({
      id: Date.now().toString(),
      agentId: 'terminal',
      agentName: currentText.terminal,
      taskType: `Execute Command: ${mainCommand}`,
      taskInput: cmd,
      taskOutput: responseText,
      timestamp: new Date().toISOString(),
      status: responseType === 'error' ? 'error' : 'success',
      errorMessage: responseType === 'error' ? responseText : undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      processCommand(command.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const commandHistory = output.filter(entry => entry.type === 'command').map(entry => entry.text.substring(2)); // Remove '> ' prefix

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length -1) {
        setHistoryIndex(prev => prev + 1);
        setCommand(commandHistory[commandHistory.length - 1 - (historyIndex + 1)]);
      } else if (historyIndex === -1 && commandHistory.length > 0) {
        setHistoryIndex(0);
        setCommand(commandHistory[commandHistory.length - 1]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex(prev => prev - 1);
        setCommand(commandHistory[commandHistory.length - 1 - (historyIndex - 1)]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };


  const inputClass = `w-full p-2 bg-transparent focus:outline-none font-mono text-sm`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 h-full flex flex-col font-mono text-sm`}
      style={{ background: currentThemeColors.background, color: currentThemeColors.text }}
    >
      <div className={`flex items-center mb-4 p-2 rounded-lg border`} style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border }}>
        <TerminalIcon className="w-6 h-6 mr-2 text-primary" style={{color: currentThemeColors.primary}} />
        <span className="font-semibold text-lg">{currentText.terminal}</span>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 rounded-md mb-4" style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border, border: '1px solid' }}>
        {output.map((entry) => (
          <p
            key={entry.id}
            className={`${entry.type === 'command' ? 'text-text' : entry.type === 'error' ? 'text-error' : 'text-text-secondary'} mb-1`}
          >
            {entry.text}
          </p>
        ))}
        <div ref={outputEndRef} /> {/* Scroll target */}
      </div>

      {/* Command Input */}
      <form onSubmit={handleSubmit} className="flex">
        <span className={`text-text mr-2`}>$</span>
        <input
          ref={inputRef}
          type="text"
          placeholder={currentText.commandPrompt}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className={inputClass}
          style={{ color: currentThemeColors.text }}
          autoFocus
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`ml-2 p-2 rounded-md bg-primary hover:opacity-90 transition-opacity text-white`}
          style={{ background: currentThemeColors.primary }}
          aria-label="Execute command"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TerminalApp;
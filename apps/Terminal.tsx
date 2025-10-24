import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { TaskHistoryEntry } from '../types';

interface TerminalOutput {
  id: number;
  type: 'command' | 'response' | 'error';
  text: string;
}

const TerminalApp: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const endOfOutputRef = useRef<HTMLDivElement>(null);

  const mockCommands: Record<string, (args: string[]) => string> = {
    help: () => 'Available: help, clear, ls, echo, date, whoami',
    clear: () => { setOutput([]); return ''; },
    ls: () => 'Documents  Pictures  Projects  README.md',
    echo: (args) => args.join(' '),
    date: () => new Date().toString(),
    whoami: () => 'guest',
  };

  useEffect(() => {
    endOfOutputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;
    
    const newHistory = [trimmedCommand, ...history];
    setHistory(newHistory);
    setHistoryIndex(-1);

    const [cmd, ...args] = trimmedCommand.split(' ');
    let responseText: string;
    let responseType: 'response' | 'error' = 'response';

    if (mockCommands[cmd]) {
      responseText = mockCommands[cmd](args);
    } else {
      responseText = `command not found: ${cmd}`;
      responseType = 'error';
    }

    const newOutput: TerminalOutput[] = [{ id: Date.now(), type: 'command', text: `$ ${trimmedCommand}` }];
    if (responseText) {
      newOutput.push({ id: Date.now() + 1, type: responseType, text: responseText });
    }
    
    setOutput(prev => [...prev, ...newOutput]);
    setCommand('');
    
    onTaskComplete({
        id: Date.now().toString(),
        agentId: 'terminal',
        agentName: 'Terminal',
        taskType: `Exec: ${cmd}`,
        taskInput: trimmedCommand,
        taskOutput: responseText,
        timestamp: new Date().toISOString(),
        status: responseType === 'error' ? 'error' : 'success',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setCommand(history[newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setCommand(history[newIndex] || '');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-mono p-2" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {output.map(line => (
          <div key={line.id} className={line.type === 'error' ? 'text-red-400' : 'text-gray-300'}>
            <span className={line.type === 'command' ? 'text-green-400' : ''}>{line.text}</span>
          </div>
        ))}
        <div ref={endOfOutputRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-green-400 mr-2">$</span>
        <input
          type="text"
          value={command}
          onChange={e => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none focus:ring-0 w-full text-white"
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalApp;
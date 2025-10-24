import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../../../App';
import { useTheme } from '../../../contexts/ThemeContext';
import { translations } from '../../../lib/i18n';
import { TaskHistoryEntry } from '../../../types';
import { nexusEvents } from '../../../services/mockSocketService';
import CodingCoPilot from './CodingCoPilot';

interface TerminalLine {
    type: 'command' | 'output';
    text: string;
}

const VibeCodingSpace: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const currentText = translations.agents.nexus[lang];

    const [codeContent, setCodeContent] = useState('// Welcome to the Vibe Coding Space!\n// Code you write here is shared in real-time.');
    const [selectedCode, setSelectedCode] = useState('');
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([]);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleCodeChange = (newCode: string) => setCodeContent(newCode);
        const handleTerminalUpdate = (history: TerminalLine[]) => setTerminalHistory(history);

        nexusEvents.on('coding:code_change', handleCodeChange);
        nexusEvents.on('coding:terminal_update', handleTerminalUpdate);

        return () => {
            nexusEvents.off('coding:code_change', handleCodeChange);
            nexusEvents.off('coding:terminal_update', handleTerminalUpdate);
        };
    }, []);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalHistory]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newCode = e.target.value;
        setCodeContent(newCode);
        nexusEvents.emit('coding:code_change', newCode);
    };

    const handleCodeSelect = () => {
        if (editorRef.current) {
            const { selectionStart, selectionEnd } = editorRef.current;
            setSelectedCode(codeContent.substring(selectionStart, selectionEnd));
        }
    };

    const handleTerminalSubmit = () => {
        if (!terminalInput.trim()) return;
        const newHistory = [...terminalHistory, { type: 'command' as const, text: `> ${terminalInput}` }];
        let outputText: string;
        const [command, ...args] = terminalInput.split(' ');
        switch(command) {
            case 'help': outputText = 'Available: help, ls, whoami, date, echo [text]'; break;
            case 'ls': outputText = 'index.js   styles.css   README.md'; break;
            case 'whoami': outputText = 'GuestCoder'; break;
            case 'date': outputText = new Date().toLocaleString(); break;
            case 'echo': outputText = args.join(' '); break;
            default: outputText = `command not found: ${command}`;
        }
        newHistory.push({ type: 'output' as const, text: outputText });
        setTerminalInput('');
        nexusEvents.emit('coding:terminal_update', newHistory);
    };

    return (
        <div className="h-full w-full flex gap-2 p-2">
            {/* Main Coding Area */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <textarea
                    ref={editorRef}
                    value={codeContent}
                    onChange={handleCodeChange}
                    onSelect={handleCodeSelect}
                    placeholder={currentText.placeholders.codeEditorPlaceholder}
                    className="flex-1 w-full p-3 font-mono text-sm bg-surface border rounded-lg resize-none focus:ring-2 focus:ring-primary custom-scrollbar"
                    style={{ borderColor: theme.colors.border }}
                />
                <div className="h-1/3 flex flex-col bg-surface border rounded-lg p-2" style={{ borderColor: theme.colors.border }}>
                    <div className="flex-1 overflow-y-auto font-mono text-xs pr-2 custom-scrollbar">
                        {terminalHistory.map((line, index) => (
                            <div key={index} className={line.type === 'command' ? 'text-text' : 'text-text-secondary'}>{line.text}</div>
                        ))}
                        <div ref={terminalEndRef}></div>
                    </div>
                    <div className="flex items-center mt-1">
                        <span className="font-mono text-sm mr-2">&gt;</span>
                        <input
                            type="text" value={terminalInput} onChange={e => setTerminalInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleTerminalSubmit()}
                            placeholder={currentText.placeholders.terminalPlaceholder}
                            className="flex-1 bg-transparent font-mono text-sm focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* AI Co-pilot Panel */}
            <div className="w-72 flex-shrink-0">
                <CodingCoPilot selectedCode={selectedCode} onTaskComplete={onTaskComplete} />
            </div>
        </div>
    );
};

export default VibeCodingSpace;
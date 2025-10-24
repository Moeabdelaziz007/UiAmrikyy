import React, { useState, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollTextIcon, Upload, FileText, X, Send, Loader } from 'lucide-react';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import { TaskHistoryEntry } from '../types';

interface SourceFile {
    file: File;
    id: string;
}

const ContentCreatorApp: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const currentText = translations.agents.contentCreator[lang];
    const globalText = translations.global[lang];

    const [sources, setSources] = useState<SourceFile[]>([]);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files).map(file => ({
                file,
                id: `${file.name}-${file.lastModified}`
            }));
            setSources(prev => [...prev, ...newFiles]);
        }
    };

    const removeSource = (id: string) => {
        setSources(prev => prev.filter(source => source.id !== id));
    };

    const handleGenerate = async () => {
        if (!query.trim() || sources.length === 0) return;

        setIsLoading(true);
        setResult('');

        try {
            const sourcesPayload = await Promise.all(
                sources.map(async (sourceFile) => {
                    const base64Data = await (window as any).fileToBase64(sourceFile.file);
                    return {
                        name: sourceFile.file.name,
                        mimeType: sourceFile.file.type || 'text/plain',
                        data: base64Data,
                    };
                })
            );

            const response = await fetch('http://localhost:3000/api/agents/content-creator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'generateFromSources',
                    prompt: query,
                    sources: sourcesPayload,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response');
            }

            const data = await response.json();
            setResult(data.result);
            onTaskComplete({
                id: Date.now().toString(),
                agentId: 'contentCreator',
                agentName: currentText.name,
                taskType: currentText.tasks.generateFromSources,
                taskInput: { query, files: sources.map(s => s.file.name) },
                taskOutput: data.result,
                timestamp: new Date().toISOString(),
                status: 'success',
            });
        } catch (error: any) {
            const errorMessage = `Error: ${error.message}`;
            setResult(errorMessage);
            onTaskComplete({
                id: Date.now().toString(),
                agentId: 'contentCreator',
                agentName: currentText.name,
                taskType: currentText.tasks.generateFromSources,
                taskInput: { query, files: sources.map(s => s.file.name) },
                taskOutput: { error: errorMessage },
                timestamp: new Date().toISOString(),
                status: 'error',
                errorMessage: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col" style={{ background: theme.colors.background }}>
            <header className="flex items-center gap-2 p-4 border-b flex-shrink-0" style={{ borderColor: theme.colors.border }}>
                <ScrollTextIcon className="w-6 h-6 text-primary" style={{ color: theme.colors.primary }} />
                <h1 className="text-xl font-bold text-text">{currentText.name}</h1>
            </header>
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Sources Panel */}
                <aside className="w-full md:w-1/3 lg:w-1/4 p-4 border-b md:border-b-0 md:border-r flex flex-col" style={{ borderColor: theme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-3">{currentText.placeholders.yourSources}</h2>
                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                        {sources.length === 0 ? (
                            <p className="text-sm text-text-secondary italic">{currentText.placeholders.noSources}</p>
                        ) : (
                            sources.map(source => (
                                <div key={source.id} className="flex items-center justify-between p-2 bg-surface rounded-md text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText size={16} className="text-text-secondary flex-shrink-0" />
                                        <span className="truncate" title={source.file.name}>{source.file.name}</span>
                                    </div>
                                    <button onClick={() => removeSource(source.id)} className="p-1 rounded-full hover:bg-background"><X size={14} /></button>
                                </div>
                            ))
                        )}
                    </div>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".txt,.md,text/plain,text/markdown"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 w-full flex items-center justify-center gap-2 p-2 rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
                    >
                        <Upload size={18} />
                        {currentText.placeholders.addSources}
                    </button>
                </aside>

                {/* Main Content Panel */}
                <main className="flex-1 flex flex-col p-4 min-h-0">
                    <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar pr-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                            >
                                {result || <p className="text-text-secondary">{currentText.placeholders.queryPrompt}</p>}
                            </motion.div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <textarea
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
                            placeholder={currentText.placeholders.queryPrompt}
                            className="flex-1 p-2 bg-surface border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows={2}
                            disabled={isLoading || sources.length === 0}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || sources.length === 0 || !query.trim()}
                            className="p-3 self-stretch rounded-lg bg-primary text-white disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ContentCreatorApp;
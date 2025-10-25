import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Bot, Download, FileText, Loader, Send, Sparkles } from 'lucide-react';
import { LanguageContext } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

const DnaMakerAgentUI: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const currentText = translations.agents.dnaMaker[lang];
    const globalText = translations.global[lang];

    const [skillName, setSkillName] = useState('');
    const [skillDescription, setSkillDescription] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!skillDescription.trim()) return;
        setIsLoading(true);
        setResult('');

        try {
            const response = await fetch('http://localhost:3000/api/agents/dna-maker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'createAixSkill',
                    description: skillDescription,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate AIX file');
            }

            const data = await response.json();
            setResult(data.aixContent);

            onTaskComplete({
                id: Date.now().toString(),
                agentId: 'dnaMaker',
                agentName: currentText.name,
                taskType: currentText.tasks.createAixSkill,
                taskInput: { description: skillDescription },
                taskOutput: { fileName: `${skillName || 'skill'}.aix`, content: data.aixContent },
                timestamp: new Date().toISOString(),
                status: 'success',
            });
        } catch (error: any) {
            setResult(`Error: ${error.message}`);
            onTaskComplete({
                id: Date.now().toString(),
                agentId: 'dnaMaker',
                agentName: currentText.name,
                taskType: currentText.tasks.createAixSkill,
                taskInput: { description: skillDescription },
                taskOutput: `Error: ${error.message}`,
                timestamp: new Date().toISOString(),
                status: 'error',
                errorMessage: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result || result.startsWith('Error:')) return;
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${skillName.trim().replace(/\s+/g, '_') || 'generated_skill'}.aix`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;

    return (
        <div className="h-full flex flex-col p-4" style={{ background: theme.colors.background }}>
            <header className="flex items-center gap-2 pb-4 border-b flex-shrink-0" style={{ borderColor: theme.colors.border }}>
                <Bot className="w-8 h-8" style={{ color: theme.colors.primary }} />
                <div>
                    <h3 className="text-2xl font-bold text-text">{currentText.name}</h3>
                    <p className="text-sm text-text-secondary">{currentText.description}</p>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-4 py-4 min-h-0">
                {/* Input Panel */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold">{currentText.placeholders.describeSkill}</h2>
                    <div>
                        <label className="text-sm font-medium text-text-secondary">{currentText.placeholders.skillName}</label>
                        <input
                            type="text"
                            value={skillName}
                            onChange={(e) => setSkillName(e.target.value)}
                            placeholder={currentText.placeholders.skillNamePlaceholder}
                            className={inputClass}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary">{currentText.placeholders.skillDescription}</label>
                        <textarea
                            value={skillDescription}
                            onChange={(e) => setSkillDescription(e.target.value)}
                            placeholder={currentText.placeholders.skillDescriptionPlaceholder}
                            className={`${inputClass} min-h-[150px]`}
                            rows={8}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !skillDescription.trim()}
                        className="w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader className="animate-spin" /> : <Sparkles size={18} />}
                        {currentText.tasks.createAixSkill}
                    </button>
                </div>

                {/* Output Panel */}
                <div className="flex-1 flex flex-col min-h-0">
                     <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">{currentText.placeholders.generatedAix}</h2>
                        <button
                            onClick={handleDownload}
                            disabled={!result || result.startsWith('Error:')}
                            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-surface hover:bg-background transition-colors disabled:opacity-50"
                        >
                            <Download size={14} />
                            {currentText.placeholders.downloadAix}
                        </button>
                    </div>
                    <div className="flex-1 p-3 bg-surface border rounded-lg overflow-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-text-secondary">
                                <Loader className="animate-spin" />
                            </div>
                        ) : (
                            <pre className="whitespace-pre-wrap text-sm font-mono">{result || currentText.placeholders.outputPlaceholder}</pre>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DnaMakerAgentUI;

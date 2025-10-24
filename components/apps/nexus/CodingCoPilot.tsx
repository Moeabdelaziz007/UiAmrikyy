import React, { useState, useContext } from 'react';
import { LanguageContext } from '../../../App';
import { useTheme } from '../../../contexts/ThemeContext';
import { translations } from '../../../lib/i18n';
import { TaskHistoryEntry } from '../../../types';
import { nexusEvents } from '../../../services/mockSocketService';
import { Code, BookOpen, MonitorCheck, Sparkles, Loader } from 'lucide-react';
import { playBase64Audio } from '../../../utils/audio';

interface CodingCoPilotProps {
    selectedCode: string;
    onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const CodingCoPilot: React.FC<CodingCoPilotProps> = ({ selectedCode, onTaskComplete }) => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const currentText = translations.agents.nexus[lang];

    const [refactorInstruction, setRefactorInstruction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTask, setActiveTask] = useState<string | null>(null);

    const speakText = async (text: string) => {
        try {
            const response = await fetch('http://localhost:3000/api/agents/translator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'textToVoice', text, language: lang })
            });
            if (!response.ok) throw new Error('Failed to generate audio');
            const data = await response.json();
            if (data.audioContent) {
                playBase64Audio(data.audioContent);
            }
        } catch (error) {
            console.error('TTS Error:', error);
        }
    };

    const handleAction = async (taskType: 'generateDocumentation' | 'reviewCode' | 'refactorCode') => {
        if (!selectedCode) return;
        if (taskType === 'refactorCode' && !refactorInstruction) return;

        setIsLoading(true);
        setActiveTask(taskType);

        let taskInput: Record<string, any> = { code: selectedCode };
        // Use a more specific task for explaining code, mapping to 'generateDocumentation' on the backend
        let apiTaskType = taskType;
        if (taskType === 'generateDocumentation') { // This is our 'Explain' task
            apiTaskType = 'generateDocumentation';
            taskInput = { codeDescription: selectedCode, docType: 'a clear, concise explanation of the code' };
        } else if (taskType === 'refactorCode') {
            apiTaskType = 'refactorCode';
            taskInput = { code: selectedCode, instructions: refactorInstruction };
        }

        try {
            const response = await fetch('http://localhost:3000/api/agents/coding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: apiTaskType, ...taskInput }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to get AI response');
            }
            const data = await response.json();
            
            const aiResponse = `**${lang === 'ar' ? 'المساعد البرمجي' : 'AI Co-pilot'} (${currentText.tasks[taskType as keyof typeof currentText.tasks]}):**\n\n${data.result}`;
            nexusEvents.emit('chat:message', { user: 'AI Co-pilot', text: aiResponse });
            speakText(data.result); // Speak the result

            onTaskComplete({
                id: Date.now().toString(), agentId: 'coding', agentName: 'Coding Co-pilot',
                taskType, taskInput, taskOutput: data.result,
                timestamp: new Date().toISOString(), status: 'success',
            });
        } catch (error: any) {
            const errorMessage = `**AI Co-pilot Error:**\n${error.message}`;
            nexusEvents.emit('chat:message', { user: 'AI Co-pilot', text: errorMessage });
            onTaskComplete({
                id: Date.now().toString(), agentId: 'coding', agentName: 'Coding Co-pilot',
                taskType, taskInput, taskOutput: { error: error.message },
                timestamp: new Date().toISOString(), status: 'error', errorMessage: error.message
            });
        } finally {
            setIsLoading(false);
            setActiveTask(null);
        }
    };

    return (
        <div className="h-full bg-surface rounded-lg p-3 flex flex-col">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 border-b pb-2" style={{ borderColor: theme.colors.border }}>
                <Code size={18} className="text-primary" style={{ color: theme.colors.primary }} />
                {currentText.tasks.aiCopilot}
            </h3>
            
            <div className="text-xs text-text-secondary mb-2 p-2 bg-background rounded">
                {selectedCode 
                    ? `${lang === 'ar' ? 'الكود المحدد' : 'Selected Code'}: \n\`\`\`\n${selectedCode.substring(0, 100)}${selectedCode.length > 100 ? '...' : ''}\n\`\`\`` 
                    : currentText.placeholders.selectCode
                }
            </div>

            <div className="space-y-2">
                <button onClick={() => handleAction('generateDocumentation')} disabled={isLoading || !selectedCode} className="w-full flex items-center gap-2 text-sm p-2 rounded-md bg-background border hover:bg-white/5 disabled:opacity-50">
                    {isLoading && activeTask === 'generateDocumentation' ? <Loader size={16} className="animate-spin" /> : <BookOpen size={16} />}
                    {currentText.tasks.explainCode}
                </button>
                <button onClick={() => handleAction('reviewCode')} disabled={isLoading || !selectedCode} className="w-full flex items-center gap-2 text-sm p-2 rounded-md bg-background border hover:bg-white/5 disabled:opacity-50">
                    {isLoading && activeTask === 'reviewCode' ? <Loader size={16} className="animate-spin" /> : <MonitorCheck size={16} />}
                    {currentText.tasks.reviewCode}
                </button>
            </div>

            <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
                <textarea
                    value={refactorInstruction}
                    onChange={(e) => setRefactorInstruction(e.target.value)}
                    placeholder={currentText.placeholders.refactorInstructions}
                    className="w-full text-sm p-2 bg-background border rounded-md resize-none mb-2 focus:ring-1 focus:ring-primary"
                    rows={2}
                    disabled={isLoading}
                />
                <button onClick={() => handleAction('refactorCode')} disabled={isLoading || !selectedCode || !refactorInstruction} className="w-full flex items-center justify-center gap-2 text-sm p-2 rounded-md bg-background border hover:bg-white/5 disabled:opacity-50">
                    {isLoading && activeTask === 'refactorCode' ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {currentText.tasks.refactorCode}
                </button>
            </div>
        </div>
    );
};

export default CodingCoPilot;
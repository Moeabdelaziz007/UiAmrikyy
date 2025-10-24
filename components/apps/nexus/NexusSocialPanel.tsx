import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../../../App';
import { useTheme } from '../../../contexts/ThemeContext';
import { translations } from '../../../lib/i18n';
import { nexusEvents } from '../../../services/mockSocketService';
import { Send, User } from 'lucide-react';

interface ChatMessage {
    user: string;
    text: string;
}

const NexusSocialPanel: React.FC = () => {
    const { lang } = useContext(LanguageContext);
    const { theme } = useTheme();
    const currentText = translations.agents.nexus[lang];

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [participants] = useState(['You', 'Friend 1', 'Friend 2']); // Mock participants

    useEffect(() => {
        const handleNewMessage = (msg: ChatMessage) => {
            setChatMessages(prev => [...prev, msg]);
        };

        nexusEvents.on('chat:message', handleNewMessage);
        return () => {
            nexusEvents.off('chat:message', handleNewMessage);
        };
    }, []);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const newMessage: ChatMessage = { user: 'You', text: chatInput };
        nexusEvents.emit('chat:message', newMessage); // Broadcast the message
        setChatInput('');
    };

    return (
        <div className="w-full md:w-80 h-1/2 md:h-full flex flex-col bg-surface rounded-lg p-2 flex-shrink-0">
            {/* Participants List */}
            <div className="mb-2">
                <h3 className="font-bold border-b pb-2 mb-2" style={{ borderColor: theme.colors.border }}>{currentText.placeholders.participants} ({participants.length})</h3>
                <div className="space-y-1">
                    {participants.map(p => (
                        <div key={p} className="flex items-center gap-2 text-sm">
                            <User size={14} className="text-text-secondary" />
                            <span>{p}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Live Chat */}
            <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-bold border-b pb-2 mb-2" style={{ borderColor: theme.colors.border }}>{lang === 'en' ? 'Live Chat' : 'دردشة مباشرة'}</h3>
                <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1 custom-scrollbar">
                    {chatMessages.map((msg, i) => (
                        <div key={i} className="text-sm break-words">
                            <span className="font-semibold" style={{ color: theme.colors.primary }}>{msg.user}: </span>
                            <span>{msg.text}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder={currentText.placeholders.chatMessage}
                        className="flex-1 p-2 bg-background border rounded-md focus:ring-2 focus:ring-primary"
                        style={{ borderColor: theme.colors.border }}
                    />
                    <button onClick={handleSendMessage} className="p-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"><Send size={20} /></button>
                </div>
            </div>
        </div>
    );
};

export default NexusSocialPanel;
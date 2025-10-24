import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareIcon, Send, Loader } from 'lucide-react';
import { LanguageContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import { TaskHistoryEntry } from '../types';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const ChatbotApp: React.FC<{ onTaskComplete: (entry: TaskHistoryEntry) => void }> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.chatbot[lang];
  const globalText = translations.global[lang];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/agents/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sendMessage',
          prompt: input,
          history: messages // Send previous messages for context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const data = await response.json();
      const modelMessage: ChatMessage = { role: 'model', text: data.response };
      setMessages([...newMessages, modelMessage]);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'chatbot',
        agentName: currentText.name,
        taskType: currentText.tasks.sendMessage,
        taskInput: input,
        taskOutput: data.response,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

    } catch (error: any) {
      const errorMessage = `Error: ${error.message}`;
      const errorResponse: ChatMessage = { role: 'model', text: errorMessage };
      setMessages([...newMessages, errorResponse]);
       onTaskComplete({
        id: Date.now().toString(),
        agentId: 'chatbot',
        agentName: currentText.name,
        taskType: currentText.tasks.sendMessage,
        taskInput: input,
        taskOutput: errorMessage,
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: theme.colors.background }}>
      <header className="flex items-center gap-2 p-4 border-b" style={{ borderColor: theme.colors.border }}>
        <MessageSquareIcon className="w-6 h-6 text-primary" style={{ color: theme.colors.primary }} />
        <h1 className="text-xl font-bold text-text">{currentText.name}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-lg'
                    : 'bg-surface text-text rounded-bl-lg'
                }`}
                style={{
                    backgroundColor: msg.role === 'user' ? theme.colors.primary : theme.colors.surface,
                    color: msg.role === 'user' ? '#fff' : theme.colors.text
                }}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
            <div className="flex justify-start">
                 <div className="p-3 rounded-2xl rounded-bl-lg" style={{backgroundColor: theme.colors.surface}}>
                     <Loader className="w-5 h-5 animate-spin" style={{ color: theme.colors.text }}/>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={currentText.placeholders.prompt}
            className="flex-1 p-2 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{ borderColor: theme.colors.border, color: theme.colors.text }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-lg bg-primary text-white disabled:opacity-50"
             style={{ backgroundColor: theme.colors.primary }}
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotApp;
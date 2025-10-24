// backend/agents/ChatAgent.js
const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger');

class ChatAgent {
  constructor() {
    this.name = 'Chat Agent';
    this.description = 'Handles conversational chat with Gemini.';
    this.modelName = 'gemini-2.5-flash'; 
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    if (task.type !== 'sendMessage') {
      throw new Error(`Unknown task type for Chat Agent: ${task.type}`);
    }

    if (!task.prompt) {
      throw new Error('Prompt is required for sendMessage task.');
    }

    try {
      const ai = getAi();
      
      // The history from the frontend is an array of { role, text }.
      // We need to format it into { role, parts: [{ text }] }.
      const formattedHistory = (task.history || []).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const chat = ai.chats.create({
        model: this.modelName,
        history: formattedHistory,
      });

      const result = await chat.sendMessage({ message: task.prompt });
      
      return { response: result.text };

    } catch (error) {
      logger.error(`[${this.name}] Error during chat execution:`, error.message);
      throw new Error('Failed to get a response from the Gemini API.');
    }
  }
}

module.exports = ChatAgent;
// backend/src/agents/mini/CommunicatorAgent.js
const TelegramService = require('../../services/TelegramService');
const { getAi } = require('../services/geminiService');
const { Type } = require('@google/genai');
const logger = require('../../utils/logger');

// Function declaration for Gemini to structure email data
const sendEmailFunction = {
  name: 'send_email',
  description: 'Sends an email to a recipient with a subject and body.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      recipient: { type: Type.STRING, description: 'The email address of the recipient.' },
      subject: { type: Type.STRING, description: 'The subject line of the email.' },
      body: { type: Type.STRING, description: 'The content of the email body.' },
    },
    required: ['recipient', 'subject', 'body'],
  },
};


class CommunicatorAgent {
  constructor() {
    this.name = 'Communicator Agent';
    this.description = 'Handles sending messages via Telegram and other communication tasks.';
    this.telegramService = new TelegramService();
    this.model = 'gemini-2.5-pro';
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    try {
        switch (task.type) {
            case 'sendTelegramMessage':
                if (!task.chatId || !task.message) throw new Error('Chat ID and message are required.');
                return await this.telegramService.sendMessage(task.chatId, task.message);

            case 'sendEmail':
            case 'emailItinerary':
                 if (!process.env.API_KEY) throw new Error('Gemini API is not configured for email tasks.');
                return await this.processEmailTask(task);
            
            case 'sendNotification':
                 logger.info(`[${this.name}] Mocking 'sendNotification' as it's a platform-specific feature.`);
                 return { status: "Notification acknowledged (mocked)." };

            default:
                throw new Error(`Unknown task type for Communicator Agent: ${task.type}`);
        }
    } catch (error) {
        logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
        throw error;
    }
  }

  async processEmailTask(task) {
    const ai = getAi();
    let prompt;

    if (task.type === 'sendEmail') {
        prompt = `Send an email to "${task.recipient}" with the subject "${task.subject}" and the body: "${task.body}".`;
    } else { // emailItinerary
        prompt = `Send an itinerary email to "${task.recipient}". The itinerary data is: ${JSON.stringify(task.itineraryData)}. The subject should be "Your Trip Itinerary". Format the body nicely.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: this.model,
            contents: prompt,
            config: { tools: [{ functionDeclarations: [sendEmailFunction] }] }
        });
        
        const call = response.functionCalls?.[0];
        if (call) {
            logger.info(`[${this.name}] Gemini suggested function call: ${call.name}`, call.args);
            return {
                message: `Successfully structured the email to be sent.`,
                emailDetails: call.args
            };
        } else {
            return {
                message: response.text || "Could not structure the email from the provided details."
            };
        }

    } catch (error) {
        logger.error(`[${this.name}] Error processing email task with Gemini:`, error);
        throw new Error('AI processing failed for email task.');
    }
  }
}

module.exports = CommunicatorAgent;
// backend/src/agents/mini/CommunicatorAgent.js
const TelegramService = require('../../services/TelegramService');
const logger = require('../../utils/logger');

class CommunicatorAgent {
  constructor() {
    this.name = 'Communicator Agent';
    this.description = 'Handles sending messages via Telegram and other communication tasks.';
    this.telegramService = new TelegramService();
    
    // Mock responses for email tasks remain
    this.mockSendEmailResult = { messageId: "mock_email_id_123", status: "sent" };
    this.mockEmailItineraryResult = { messageId: "mock_email_id_456", status: "sent" };
    this.mockSendNotificationResult = { status: "Notification sent" };
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    try {
        switch (task.type) {
            case 'sendTelegramMessage':
                if (!task.chatId || !task.message) throw new Error('Chat ID and message are required.');
                return await this.telegramService.sendMessage(task.chatId, task.message);

            // --- Email tasks remain mocked ---
            case 'sendEmail':
                logger.info(`[${this.name}] Using mock for sendEmail task.`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.mockSendEmailResult;

            case 'emailItinerary':
                logger.info(`[${this.name}] Using mock for emailItinerary task.`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.mockEmailItineraryResult;
            
            case 'sendNotification':
                logger.info(`[${this.name}] Using mock for sendNotification task.`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.mockSendNotificationResult;

            default:
                throw new Error(`Unknown task type for Communicator Agent: ${task.type}`);
        }
    } catch (error) {
        logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
        throw error;
    }
  }
}

module.exports = CommunicatorAgent;
// backend/src/services/TelegramService.js
const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');

class TelegramService {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    if (!this.token) {
      logger.warn('[TelegramService] TELEGRAM_BOT_TOKEN is not set. Telegram features will be disabled.');
      this.bot = null;
    } else {
      // Using polling: false as we are only sending messages, not listening for them.
      this.bot = new TelegramBot(this.token, { polling: false });
      logger.info('[TelegramService] Initialized successfully.');
    }
  }

  _checkClient() {
    if (!this.bot) {
      throw new Error('Telegram Service is not configured. Please provide TELEGRAM_BOT_TOKEN.');
    }
  }

  async sendMessage(chatId, message) {
    this._checkClient();
    try {
      await this.bot.sendMessage(chatId, message);
      logger.info(`[TelegramService] Message sent to chat ID: ${chatId}`);
      return { success: true, message: 'Telegram message sent successfully.' };
    } catch (error) {
      logger.error(`[TelegramService] Failed to send message to ${chatId}:`, error.message);
      throw new Error(`Failed to send Telegram message: ${error.message}`);
    }
  }
}

module.exports = TelegramService;
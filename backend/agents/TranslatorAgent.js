// backend/src/agents/mini/TranslatorAgent.js
const TranslateService = require('../../services/TranslateService');
const logger = require('../../utils/logger');

class TranslatorAgent {
  constructor() {
    this.name = 'Translator Agent';
    this.description = 'Handles text translation and language detection via Google Translate API.';
    this.translateService = new TranslateService();

    // Voice-related mocks remain as they use separate APIs (Speech-to-Text, Text-to-Speech)
    this.mockVoiceToTextResult = { transcription: "Hello, how are you today?" };
    this.mockTextToVoiceResult = { audioContent: "mock_base64_audio_data" };
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    try {
      switch (task.type) {
        case 'translateText':
          if (!task.text || !task.targetLang) throw new Error('Text and target language are required for translateText.');
          return await this.translateService.translateText(task.text, task.targetLang, task.sourceLang);

        case 'detectLanguage':
          if (!task.text) throw new Error('Text is required for detectLanguage.');
          return await this.translateService.detectLanguage(task.text);

        // --- Voice tasks remain mocked ---
        case 'voiceToText':
          logger.info(`[${this.name}] Using mock for voiceToText task.`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
          return this.mockVoiceToTextResult;

        case 'textToVoice':
          logger.info(`[${this.name}] Using mock for textToVoice task.`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
          return this.mockTextToVoiceResult;

        default:
          throw new Error(`Unknown task type for Translator Agent: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
      throw error;
    }
  }
}

module.exports = TranslatorAgent;
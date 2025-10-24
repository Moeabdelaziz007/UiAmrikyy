// backend/src/services/TranslateService.js
const { Translate } = require('@google-cloud/translate').v2;
const logger = require('../utils/logger');

class TranslateService {
  constructor() {
    try {
      // GOOGLE_APPLICATION_CREDENTIALS environment variable must be set
      this.translateClient = new Translate();
      logger.info('[TranslateService] Initialized successfully.');
    } catch (error) {
      logger.warn('[TranslateService] Failed to initialize. GOOGLE_APPLICATION_CREDENTIALS might be missing or invalid.', error.message);
      this.translateClient = null;
    }
  }

  _checkClient() {
    if (!this.translateClient) {
      throw new Error('Google Translate Service is not configured. Check application credentials.');
    }
  }

  async translateText(text, target, source = null) {
    this._checkClient();
    try {
      const options = { to: target };
      if (source) {
        options.from = source;
      }
      const [translation] = await this.translateClient.translate(text, options);
      return {
        originalText: text,
        translatedText: translation,
      };
    } catch (error) {
      logger.error('[TranslateService] Error translating text:', error.message);
      throw new Error('Failed to translate text with Google Translate API.');
    }
  }

  async detectLanguage(text) {
    this._checkClient();
    try {
      const [detection] = await this.translateClient.detect(text);
      return {
        language: detection.language,
        confidence: detection.confidence,
      };
    } catch (error) {
      logger.error('[TranslateService] Error detecting language:', error.message);
      throw new Error('Failed to detect language with Google Translate API.');
    }
  }
}

module.exports = TranslateService;
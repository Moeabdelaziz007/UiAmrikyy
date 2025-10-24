// backend/src/agents/mini/TranslatorAgent.js
const TranslateService = require('../../services/TranslateService');
const { getAi } = require('../services/geminiService');
const { Modality } = require('@google/genai');
const logger = require('../../utils/logger');

class TranslatorAgent {
  constructor() {
    this.name = 'Translator Agent';
    this.description = 'Handles text translation, language detection, and text-to-speech.';
    this.translateService = new TranslateService();
    this.ttsModel = 'gemini-2.5-flash-preview-tts';
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

        case 'voiceToText':
          if (!task.audio || !task.audio.data || !task.audio.mimeType) {
            throw new Error('Audio data and mimeType are required for voiceToText.');
          }
          return await this.voiceToText(task.audio);

        case 'textToVoice':
          if (!task.text) throw new Error('Text is required for textToVoice.');
          return await this.textToVoice(task.text, task.language);

        default:
          throw new Error(`Unknown task type for Translator Agent: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
      throw error;
    }
  }
  
  async voiceToText(audio) {
    const ai = getAi();
    logger.info(`[${this.name}] Transcribing audio with mime type: ${audio.mimeType}`);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
            parts: [
                { inlineData: { data: audio.data, mimeType: audio.mimeType } },
                { text: 'Transcribe this audio accurately.' }
            ]
        }]
    });
    return { transcription: response.text };
  }

  async textToVoice(text, language) {
    const ai = getAi();
    // A simple mapping, can be expanded with more voices.
    const voiceName = language === 'ar' ? 'Puck' : 'Kore';

    logger.info(`[${this.name}] Generating speech for text: "${text.substring(0, 30)}..." with voice: ${voiceName}`);

    const response = await ai.models.generateContent({
        model: this.ttsModel,
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const audioContent = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioContent) {
        throw new Error('Text-to-speech generation failed to produce audio.');
    }
    return { audioContent };
  }
}

module.exports = TranslatorAgent;
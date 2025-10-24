// backend/services/geminiService.js
const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

let ai;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    logger.info('[geminiService] GoogleGenAI client initialized successfully.');
  } else {
    logger.warn('[geminiService] API_KEY is not set. Gemini functions will be disabled.');
  }
} catch (error) {
  logger.error('[geminiService] Failed to initialize GoogleGenAI client:', error);
}

/**
 * Returns the initialized GoogleGenAI client instance.
 * Throws an error if the client is not initialized.
 * @returns {GoogleGenAI} The GoogleGenAI client instance.
 */
function getAi() {
  if (!ai) {
    throw new Error('GoogleGenAI client is not initialized. Please set the API_KEY environment variable.');
  }
  return ai;
}

module.exports = { getAi };

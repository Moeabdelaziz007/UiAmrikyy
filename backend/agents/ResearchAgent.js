const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger');

class ResearchAgent {
  constructor() {
    this.name = "Research Agent";
    this.description = "Handles web and map search and information retrieval using Gemini with grounding.";
    this.modelName = 'gemini-2.5-flash';

    if (!process.env.API_KEY) {
      logger.warn(`[${this.name}] Gemini API Key is not configured. Real API calls will fail.`);
    }
  }

  _checkConfig() {
    if (!process.env.API_KEY) {
      throw new Error('Gemini API Key is not configured.');
    }
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);
    this._checkConfig();

    switch (task.type) {
      case 'webSearch':
        if (!task.query) throw new Error('Query is required for webSearch.');
        return await this.webSearch(task.query);
      
      case 'locationQuery':
        if (!task.query) throw new Error('Query is required for locationQuery.');
        return await this.locationQuery(task.query, task.userLocation);

      default:
        // The old tasks like findHotels, getReviews are now handled by the more powerful webSearch.
        // We can route them to webSearch for backward compatibility if needed, or just throw an error.
        throw new Error(`Unknown or deprecated task type for Research Agent: ${task.type}`);
    }
  }

  async webSearch(query) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return {
        text: response.text,
        groundingChunks: groundingChunks,
      };

    } catch (error) {
      logger.error(`[${this.name}] Error during web search for query "${query}":`, error.message);
      throw new Error(`Failed to perform web search with Gemini: ${error.message}`);
    }
  }
  
  async locationQuery(query, userLocation) {
    try {
      const ai = getAi();
      const config = {
        tools: [{ googleMaps: {} }],
      };
      
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            }
          }
        };
      }
      
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: query,
        config: config,
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return {
        text: response.text,
        groundingChunks: groundingChunks,
      };

    } catch (error) {
      logger.error(`[${this.name}] Error during location query for query "${query}":`, error.message);
      throw new Error(`Failed to perform location query with Gemini: ${error.message}`);
    }
  }

}

module.exports = ResearchAgent;


// New function to run AIX tasks, as requested for testing.
const fs = require('fs/promises');
const path = require('path');
const { parseAixFile } = require('../services/aixParser');
const { executeAixTask } = require('../services/aixExecutor');
const loggerForAix = require('../utils/logger');

async function runAixTask(fileName) {
  try {
    // Construct an absolute path from the project root. Assumes process is started from project root.
    const filePath = path.join(process.cwd(), 'backend', 'aix_tasks', fileName);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsedAix = parseAixFile(fileContent);

    if (!parsedAix.PROMPT) {
        throw new Error("AIX file is missing a [PROMPT] section.");
    }

    const result = await executeAixTask(parsedAix);
    return result;
  } catch (error) {
    loggerForAix.error(`Error running AIX task ${fileName}:`, error);
    return { success: false, error: 'Could not read or execute the AIX file.' };
  }
}

module.exports.runAixTask = runAixTask;
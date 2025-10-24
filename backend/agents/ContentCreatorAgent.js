// backend/agents/ContentCreatorAgent.js
const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger');
const { Buffer } = require('buffer');

class ContentCreatorAgent {
  constructor() {
    this.name = 'Content Creator Agent';
    this.description = 'Generates content grounded in user-provided source documents.';
    this.modelName = 'gemini-2.5-pro';
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    if (task.type !== 'generateFromSources') {
      throw new Error(`Unknown task type for Content Creator Agent: ${task.type}`);
    }

    if (!task.prompt || !task.sources || task.sources.length === 0) {
      throw new Error('A prompt and at least one source document are required.');
    }

    try {
      const ai = getAi();
      
      const systemInstruction = `You are a research assistant. Your task is to answer the user's query based ONLY on the provided source documents.
- Do not use any external knowledge.
- If the answer is not found in the sources, state that clearly.
- Quote or reference the source document when possible.
- Your response should be comprehensive and directly address the user's query.`;

      let sourcesText = '';
      for (const source of task.sources) {
        // Only process text-based files
        if (source.mimeType.startsWith('text/')) {
            const content = Buffer.from(source.data, 'base64').toString('utf-8');
            sourcesText += `\n\n--- [Source: ${source.name}] ---\n${content}`;
        } else {
            logger.warn(`[${this.name}] Skipping non-text source: ${source.name} (${source.mimeType})`);
        }
      }
      
      if (!sourcesText.trim()) {
        throw new Error('No valid text-based source documents were provided.');
      }

      const userPrompt = `
        **Sources:**
        ${sourcesText}

        ---

        **User Query:**
        ${task.prompt}
      `;

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingBudget: 32768 }, // Use max thinking for deep analysis
        },
      });
      
      return { result: response.text };

    } catch (error) {
      logger.error(`[${this.name}] Error during content generation:`, error.message);
      throw new Error('Failed to generate content from sources.');
    }
  }
}

module.exports = ContentCreatorAgent;
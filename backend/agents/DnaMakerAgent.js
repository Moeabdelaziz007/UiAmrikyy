// backend/agents/DnaMakerAgent.js
const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger');

class DnaMakerAgent {
  constructor() {
    this.name = 'DNA Maker Agent';
    this.description = 'Creates new skills and personas for other agents by generating .aix files.';
    this.model = 'gemini-2.5-pro';
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: createAixSkill`);

    if (task.type !== 'createAixSkill') {
      throw new Error(`Unknown task type for DNA Maker Agent: ${task.type}`);
    }
    if (!task.description) {
      throw new Error('A skill description is required.');
    }

    const { description } = task;

    const systemInstruction = `You are an expert AI agent architect specializing in the .aix file format.
Your task is to generate the complete text content for an .aix file based on a user's description of a new skill.
The .aix file must contain the following sections: [PROMPT], [RULES], and [DATA].

- **[PROMPT]**: Write a clear, concise system prompt that instructs another AI on how to perform the skill. This is the core "personality" or "DNA".
- **[RULES]**: Define a set of rules and constraints for the AI to follow. Be specific about output format, what to do, and what not to do.
- **[DATA]**: Provide example data or a schema for the data the AI will work with. This could be JSON, CSV, or plain text examples.

Your output must be ONLY the raw text content of the .aix file, starting with [PROMPT]. Do not add any extra explanation, formatting like markdown code blocks, or conversational text.`;

    const userPrompt = `Generate an .aix file for the following skill description:\n\n"${description}"`;

    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: this.model,
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });

      const aixContent = response.text.trim();
      return { aixContent };

    } catch (error) {
      logger.error(`[${this.name}] Error generating AIX file:`, error.message);
      throw new Error('Failed to generate AIX file from the Gemini API.');
    }
  }
}

module.exports = DnaMakerAgent;

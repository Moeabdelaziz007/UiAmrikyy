// backend/services/aixExecutor.js
const { getAi } = require('./geminiService');
const logger = require('../utils/logger');

/**
 * Executes a parsed AIX task using the Gemini API.
 * @param {{PROMPT: string, DATA: string, RULES: string}} parsedAix The parsed sections of an AIX file.
 * @returns {Promise<{success: boolean, output?: string, error?: string}>} The result from the Gemini API.
 */
async function executeAixTask(parsedAix) {
  try {
    const ai = getAi();
    const modelName = 'gemini-2.5-pro';

    // Construct a detailed prompt for Gemini, telling it how to use the parsed sections
    const fullPrompt = `
      You are an AI task executor. You have been given a task structured in the AIX format.
      Your goal is to follow the instructions in the PROMPT section, using the provided DATA and adhering to the RULES.

      **PROMPT (Your main objective):**
      ${parsedAix.PROMPT}

      **DATA (The information to process):**
      ${parsedAix.DATA}

      **RULES (Constraints and logic to apply):**
      ${parsedAix.RULES}

      Please provide the final output based on these instructions. Do not add any extra commentary or explanation outside of the requested output format.
    `;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });
    
    return { success: true, output: response.text };
  } catch (error) {
    logger.error("Error executing AIX task with Gemini:", error);
    return { success: false, error: "Failed to get response from Gemini." };
  }
}

module.exports = { executeAixTask };

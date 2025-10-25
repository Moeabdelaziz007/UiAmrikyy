// backend/agents/StorageAgent.js
const { getAi } = require('../services/geminiService');
const { Type } = require('@google/genai');
const logger = require('../utils/logger');

// Function declarations for Gemini
const saveDocumentFunction = {
  name: 'save_document',
  description: 'Saves a text document to a file storage service.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filename: { type: Type.STRING, description: 'The name of the file, including extension.' },
      content: { type: Type.STRING, description: 'The text content of the document.' },
    },
    required: ['filename', 'content'],
  },
};

const shareFileFunction = {
  name: 'share_file',
  description: 'Shares a file with another user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fileId: { type: Type.STRING, description: 'The ID of the file to share.' },
      email: { type: Type.STRING, description: 'The email address of the recipient.' },
    },
    required: ['fileId', 'email'],
  },
};

class StorageAgent {
  constructor() {
    this.name = 'Storage Agent';
    this.model = 'gemini-2.5-pro';
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);
    if (!process.env.API_KEY) throw new Error('Gemini API is not configured.');

    const ai = getAi();
    const prompt = this._constructPrompt(task);
    const tools = this._getToolsForTask(task.type);

    if (!prompt || !tools) {
      throw new Error(`Unsupported or unimplemented task type for Storage Agent: ${task.type}`);
    }

    try {
        const response = await ai.models.generateContent({
            model: this.model,
            contents: prompt,
            config: { tools }
        });

        const call = response.functionCalls?.[0];
        if (call) {
            logger.info(`[${this.name}] Gemini suggested function call: ${call.name}`, call.args);
            return {
                message: `Successfully structured the file operation. In a real integration, this action would now be performed.`,
                operationDetails: call.args
            };
        } else {
            return {
                message: response.text || "Could not determine the file action to take."
            };
        }
    } catch (error) {
        logger.error(`[${this.name}] Error during Gemini call for task ${task.type}:`, error);
        throw new Error(`AI processing failed for storage task: ${error.message}`);
    }
  }

  _constructPrompt(task) {
    switch (task.type) {
      case 'saveDocument':
        return `Save a document named "${task.filename}" with the following content: "${task.content}"`;
      case 'shareFile':
        return `Share the file with ID "${task.fileId}" with the user at email "${task.email}".`;
      // 'uploadFile' and 'createItinerary' are more complex; we focus on these two for now.
      default:
        return null;
    }
  }

  _getToolsForTask(taskType) {
    switch (taskType) {
      case 'saveDocument':
        return [{ functionDeclarations: [saveDocumentFunction] }];
      case 'shareFile':
        return [{ functionDeclarations: [shareFileFunction] }];
      default:
        return null;
    }
  }
}

module.exports = StorageAgent;
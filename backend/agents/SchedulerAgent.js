// backend/agents/SchedulerAgent.js
const { getAi } = require('../services/geminiService');
const { Type } = require('@google/genai');
const logger = require('../utils/logger');

// Function declaration for Gemini to structure the event data
const createEventFunction = {
  name: 'create_calendar_event',
  description: 'Creates a calendar event with the given details.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the event.' },
      location: { type: Type.STRING, description: 'The location of the event.' },
      startTime: { type: Type.STRING, description: 'The start time in ISO 8601 format.' },
      endTime: { type: Type.STRING, description: 'The end time in ISO 8601 format.' },
    },
    required: ['title', 'startTime', 'endTime'],
  },
};

class SchedulerAgent {
  constructor() {
    this.name = 'Scheduler Agent';
    this.model = 'gemini-2.5-pro';
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);
    if (!process.env.API_KEY) {
      throw new Error('Gemini API is not configured.');
    }

    const ai = getAi();
    const prompt = this._constructPrompt(task);
    const tools = this._getToolsForTask(task.type);

    if (!prompt || !tools) {
      throw new Error(`Unsupported or unimplemented task type for Scheduler Agent: ${task.type}`);
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
        // Instead of executing, we return the structured data to confirm the action.
        // This makes it a production-ready AI simulation without needing OAuth.
        return {
          message: `Successfully structured the event to be created. In a real integration, this would now be sent to the Google Calendar API.`,
          structuredEvent: call.args
        };
      } else {
        // If Gemini doesn't call a function, return its text response.
        return {
          message: response.text || "Could not determine the specific action to take from the provided details."
        };
      }
    } catch (error) {
        logger.error(`[${this.name}] Error during Gemini call for task ${task.type}:`, error);
        throw new Error(`AI processing failed for scheduling task: ${error.message}`);
    }
  }

  _constructPrompt(task) {
    switch (task.type) {
      case 'createEvent':
        return `Create a calendar event with the title "${task.title}", starting at "${task.startTime}", and ending at "${task.endTime}". The location is "${task.location || 'not specified'}".`;
      // Other tasks like 'checkAvailability' can be implemented here.
      default:
        return null;
    }
  }

  _getToolsForTask(taskType) {
    switch (taskType) {
      case 'createEvent':
        return [{ functionDeclarations: [createEventFunction] }];
      // Other tasks would have their own function declarations.
      default:
        return null;
    }
  }
}

module.exports = SchedulerAgent;
// backend/src/agents/OrchestratorAgent.js
const { getAi } = require('../services/geminiService');
const { Type } = require('@google/genai');
const logger = require('../utils/logger');

// Define the capabilities of all Mini Agents for the Orchestrator's context
const AGENT_TOOLBELT = `
- **navigator**: 
  - getDirections(origin, destination): Gets driving directions.
  - findNearby(location, placeType): Finds nearby places like 'restaurants' or 'hotels'.
  - geocode(address): Converts an address to coordinates.
- **vision**:
  - analyzeImage(imageUrl, prompt): Describes an image.
  - extractText(imageUrl): Performs OCR on an image.
  - identifyLandmark(imageUrl): Identifies landmarks.
  - detectObjects(imageUrl): Detects objects in an image.
- **research**:
  - webSearch(query): Performs a web search.
  - findHotels(location, filters): Searches for hotels.
  - getReviews(placeName): Gets reviews for a place.
  - comparePrices(itemName): Compares prices for an item.
- **translator**:
  - translateText(text, targetLang, sourceLang): Translates text.
  - detectLanguage(text): Detects the language of a text.
- **scheduler**:
  - createEvent(title, location, startTime, endTime): Creates a calendar event.
  - checkAvailability(timeRange): Checks for free time slots.
  - setReminder(eventId, reminder): Sets a reminder for an event.
- **storage**:
  - saveDocument(content, filename): Saves text content to a file.
  - uploadFile(fileInput, filename): Uploads a file.
  - shareFile(fileId, email): Shares a file.
- **media**:
  - searchVideos(query): Searches for videos on YouTube.
  - getVideoDetails(videoId): Gets details for a specific video.
- **communicator**:
  - sendEmail(to, subject, body): Sends an email.
  - sendTelegramMessage(chatId, message): Sends a Telegram message.
- **coding**: 
  - various code generation tasks (e.g., generateUI, designAPI). Treat as a single tool for high-level planning.
- **marketing**:
  - various marketing analysis tasks (e.g., marketResearch, seoSpecialist). Treat as a single tool for high-level planning.
`;

const WORKFLOW_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: 'A short, descriptive name for the generated workflow (e.g., "Trip Planning", "Code Generation").'
    },
    steps: {
      type: Type.ARRAY,
      description: 'An array of steps to be executed in sequence.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'A unique identifier for the step (e.g., "step-1", "step-2").'
          },
          agentId: {
            type: Type.STRING,
            description: 'The ID of the agent to execute this step (e.g., "navigator", "research").'
          },
          taskType: {
            type: Type.STRING,
            description: 'The specific task for the agent to perform (e.g., "getDirections", "webSearch").'
          },
          taskInput: {
            type: Type.OBJECT,
            description: 'An object containing the parameters for the task. Use placeholders like {{steps.step-1.output.results[0].name}} to reference outputs from previous steps.'
          }
        },
        required: ['id', 'agentId', 'taskType', 'taskInput']
      }
    }
  },
  required: ['name', 'steps']
};


class OrchestratorAgent {
  constructor() {
    this.name = 'Orchestrator Agent';
    this.description = 'Understands user intent, generates dynamic workflows, and assigns tasks to Mini Agents using Gemini Pro.';
    this.model = 'gemini-2.5-pro'; // Use a powerful model for planning
  }

  /**
   * Plans the execution workflow based on the user's prompt using Gemini Pro.
   * @param {string} prompt - The natural language prompt from the user.
   * @returns {Promise<object>} A structured workflow plan.
   */
  async planExecution(prompt) {
    logger.info(`[${this.name}] Received prompt for planning: "${prompt}"`);

    if (!process.env.API_KEY) {
      logger.warn(`[${this.name}] Gemini not configured. Using fallback mock logic.`);
      return this.mockPlanExecution(prompt);
    }
    
    const systemInstruction = `You are an expert AI orchestrator for a multi-agent operating system. Your role is to understand a user's request and decompose it into a structured JSON workflow of executable steps.
    
Available Agents and their tasks:
${AGENT_TOOLBELT}

Your sole output must be a single JSON object that conforms to the provided schema.
- For simple, direct queries (e.g., 'what is the capital of France?'), create a single-step workflow using the 'research' agent's 'webSearch' task.
- For complex, multi-step tasks, chain the agents together.
- Use the placeholder syntax '{{steps.step-id.output.path}}' to pass data between steps. For example, to use the name of a hotel found in step-1 as the location for a calendar event in step-2, the 'location' in step-2's taskInput should be '{{steps.step-1.output.results[0].name}}'.
- Ensure the 'id' for each step is unique and sequential (e.g., 'step-1', 'step-2').
- Do not add any commentary or explanation outside of the JSON object.`;

    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: WORKFLOW_SCHEMA,
            thinkingConfig: { thinkingBudget: 8192 }, // Allocate significant thinking budget for planning
        }
      });
      
      const workflowJson = response.text.trim();
      const workflow = JSON.parse(workflowJson);

      logger.info(`[${this.name}] Generated workflow for execution:`, JSON.stringify(workflow, null, 2));
      return workflow;

    } catch (error) {
      logger.error(`[${this.name}] Error planning execution with Gemini:`, error);
      // Fallback to mock logic on API failure
      return this.mockPlanExecution(prompt);
    }
  }

  /**
   * A fallback mock planner that uses simple keyword matching.
   * This is used if the Gemini API is not configured or fails.
   * @param {string} prompt - The natural language prompt from the user.
   * @returns {object} A structured workflow plan.
   */
  mockPlanExecution(prompt) {
    const lowerCasePrompt = prompt.toLowerCase();
    
    if (lowerCasePrompt.includes('plan a trip') || lowerCasePrompt.includes('travel to')) {
      return {
        name: 'Trip Planning (Mock)',
        steps: [
          {
            id: 'step-1',
            agentId: 'navigator',
            taskType: 'findNearby',
            taskInput: { location: 'Paris, France', placeType: 'hotel' },
          },
          {
            id: 'step-2',
            agentId: 'scheduler',
            taskType: 'createEvent',
            taskInput: { title: 'Check-in at {{steps.step-1.output.results[0].name}}', location: '{{steps.step-1.output.results[0].vicinity}}', startTime: '2025-10-26T15:00:00', endTime: '2025-10-26T16:00:00' },
          }
        ],
      };
    } else {
      return {
        name: 'Simple Web Search (Mock)',
        steps: [
          {
            id: 'step-1',
            agentId: 'research',
            taskType: 'webSearch',
            taskInput: { query: prompt },
          },
        ],
      };
    }
  }
}

module.exports = OrchestratorAgent;

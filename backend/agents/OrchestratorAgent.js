// backend/src/agents/OrchestratorAgent.js
const logger = require('../utils/logger');

// Pre-defined workflow templates. In a real system, these would be loaded from a file or database.
const WORKFLOW_TEMPLATES = {
  TRIP_PLANNING: {
    id: 'trip-planning-v1',
    name: 'Trip Planning',
    steps: [
      {
        id: 'step-1',
        agentId: 'research',
        taskType: 'webSearch',
        taskInput: { query: 'top attractions in {{destination}}' },
      },
      {
        id: 'step-2',
        agentId: 'navigator',
        taskType: 'findNearby',
        taskInput: { location: '{{destination}}', placeType: 'hotel' },
      },
      {
        id: 'step-3',
        agentId: 'scheduler',
        taskType: 'createEvent',
        taskInput: {
          title: 'Trip to {{destination}}',
          startTime: '{{startDate}}', // These would be dynamically calculated
          endTime: '{{endDate}}',
        },
      },
    ],
  },
  SIMPLE_SEARCH: {
    id: 'simple-search-v1',
    name: 'Simple Web Search',
    steps: [
      {
        id: 'step-1',
        agentId: 'research',
        taskType: 'webSearch',
        taskInput: { query: '{{query}}' },
      },
    ],
  },
};

class OrchestratorAgent {
  constructor() {
    this.name = 'Orchestrator Agent';
    this.description = 'Understands user intent, selects workflows, and assigns tasks to Mini Agents.';
    // In a real implementation, Gemini Pro client would be initialized here.
    // this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Parses a prompt to extract simple trip details.
   * @param {string} prompt - The user's prompt.
   * @returns {{destination: string|null, days: number|null}}
   */
  _extractTripDetails(prompt) {
    const destinationMatch = prompt.match(/to\s+([A-Za-z\s]+)/i);
    const daysMatch = prompt.match(/(\d+)\s*-\s*day/i);
    
    return {
      destination: destinationMatch ? destinationMatch[1].trim() : 'the requested location',
      days: daysMatch ? parseInt(daysMatch[1], 10) : 7, // Default to 7 days
    };
  }

  /**
   * Replaces placeholders in a workflow template with dynamic values.
   * @param {object} workflow - The workflow template.
   * @param {Record<string, string>} params - The parameters to inject.
   * @returns {object} The populated workflow.
   */
  _populateWorkflow(workflow, params) {
    // Deep clone the template to avoid modifying the original
    let populatedWorkflow = JSON.parse(JSON.stringify(workflow));
    
    // Convert the workflow to a string to replace all placeholders
    let workflowString = JSON.stringify(populatedWorkflow);
    
    for (const key in params) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      workflowString = workflowString.replace(placeholder, params[key]);
    }
    
    return JSON.parse(workflowString);
  }

  /**
   * Plans the execution workflow based on the user's prompt.
   * This method mocks the behavior of Gemini Pro by using keyword matching.
   * @param {string} prompt - The natural language prompt from the user.
   * @returns {Promise<object>} A structured workflow plan.
   */
  async planExecution(prompt) {
    logger.info(`[${this.name}] Received prompt for planning: "${prompt}"`);
    
    const lowerCasePrompt = prompt.toLowerCase();
    
    if (lowerCasePrompt.includes('plan a trip') || lowerCasePrompt.includes('travel to')) {
      logger.info(`[${this.name}] Intent recognized: Trip Planning. Selecting workflow.`);
      
      const details = this._extractTripDetails(prompt);
      const params = {
        destination: details.destination,
        days: details.days.toString(),
        // Mock start/end dates for now
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + details.days * 86400000).toISOString().split('T')[0],
      };

      const workflow = this._populateWorkflow(WORKFLOW_TEMPLATES.TRIP_PLANNING, params);
      logger.info(`[${this.name}] Populated workflow for execution:`, JSON.stringify(workflow, null, 2));
      return workflow;

    } else {
      logger.info(`[${this.name}] Default intent: Simple Search. Selecting workflow.`);
      const params = { query: prompt };
      const workflow = this._populateWorkflow(WORKFLOW_TEMPLATES.SIMPLE_SEARCH, params);
      logger.info(`[${this.name}] Populated workflow for execution:`, JSON.stringify(workflow, null, 2));
      return workflow;
    }
  }
}

module.exports = OrchestratorAgent;
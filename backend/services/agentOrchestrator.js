// backend/src/services/agentOrchestrator.js
const OrchestratorAgent = require('../agents/OrchestratorAgent'); // Import the new agent
const logger = require('../utils/logger');

/**
 * This service acts as a bridge between the API routes and the core OrchestratorAgent.
 * It initializes the agent and exposes its planning capabilities.
 */
class AgentOrchestratorService {
  constructor() {
    this.orchestratorAgent = new OrchestratorAgent();
    logger.info('[AgentOrchestratorService] Initialized and ready to orchestrate.');
  }

  /**
   * Delegates the planning task to the OrchestratorAgent.
   * @param {string} userPrompt - The natural language prompt from the user.
   * @param {string} lang - The language of the prompt.
   * @returns {Promise<object>} A structured workflow plan.
   */
  async planExecution(userPrompt, lang = 'en') {
    // The new agent handles all the complex logic.
    return this.orchestratorAgent.planExecution(userPrompt);
  }

  // The Telegram logic has been removed from here as it's now conceptually
  // part of the CommunicatorAgent. This service's sole responsibility is orchestration planning.
}

// Export a single instance of the service
module.exports = new AgentOrchestratorService();
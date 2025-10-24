// backend/src/agents/mini/NavigatorAgent.js
const GoogleMapsService = require('../../services/GoogleMapsService');
const logger = require('../../utils/logger');

class NavigatorAgent {
  constructor() {
    this.name = 'Navigator Agent';
    this.description = 'Handles tasks related to maps, directions, and places using Google Maps API.';
    this.googleMapsService = new GoogleMapsService();
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);
    try {
      switch (task.type) {
        case 'getDirections':
          if (!task.origin || !task.destination) throw new Error('Origin and destination are required for getDirections.');
          return await this.googleMapsService.getDirections(task.origin, task.destination);
        
        case 'findNearby':
          if (!task.location || !task.placeType) throw new Error('Location and placeType are required for findNearby.');
          return await this.googleMapsService.findNearby(task.location, task.placeType);

        case 'geocode':
          if (!task.address) throw new Error('Address is required for geocode.');
          return await this.googleMapsService.geocode(task.address);

        default:
          throw new Error(`Unknown task type for Navigator Agent: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
      // Re-throw the error to be caught by the API route handler
      throw error;
    }
  }
}

module.exports = NavigatorAgent;
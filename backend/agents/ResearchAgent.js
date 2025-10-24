const axios = require('axios');
const logger = require('../../utils/logger');


class ResearchAgent {
  constructor() {
    this.name = "Research Agent";
    this.description = "Handles web search and information retrieval using Google Custom Search API.";
    this.searchApiKey = process.env.GOOGLE_SEARCH_API_KEY; 
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!this.searchApiKey || !this.searchEngineId) {
      logger.warn(`[${this.name}] Google Search API Key or Engine ID is not configured. Real API calls will fail.`);
    }
  }

  _checkConfig() {
    if (!this.searchApiKey || !this.searchEngineId) {
      throw new Error('Google Custom Search API Key or Engine ID is not configured.');
    }
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);
    this._checkConfig(); // Check for API keys before executing any task

    switch (task.type) {
      case 'webSearch':
        return await this.webSearch(task.query);
      case 'findHotels':
        const hotelQuery = `hotels in ${task.location} ${task.filters || ''}`;
        return await this.webSearch(hotelQuery);
      case 'getReviews':
        const reviewQuery = `reviews for ${task.placeName}`;
        return await this.webSearch(reviewQuery);
      case 'comparePrices':
         const priceQuery = `price comparison for ${task.itemName}`;
        return await this.webSearch(priceQuery);
      default:
        throw new Error(`Unknown task type for Research Agent: ${task.type}`);
    }
  }

  async webSearch(query, options = {}) {
    const { num = 10 } = options;
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.searchApiKey,
          cx: this.searchEngineId,
          q: query,
          num,
        }
      });
      const results = response.data.items?.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      })) || [];
      return { results };

    } catch (error) {
      logger.error(`[${this.name}] Error during web search for query "${query}":`, error.response?.data?.error || error.message);
      throw new Error(`Failed to perform web search: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = ResearchAgent;
// backend/src/agents/mini/MediaAgent.js
const YouTubeService = require('../../services/YouTubeService');
const logger = require('../../utils/logger');

class MediaAgent {
  constructor() {
    this.name = 'Media Agent';
    this.description = 'Handles video search via YouTube and conceptual media generation.';
    this.youTubeService = new YouTubeService();
    
    // Generative mocks remain as they are separate from YouTube Data API
    this.mockGenerateVideoResult = { videoUrl: "https://mock-veo-video.com/generated.mp4", duration: "30s" };
    this.mockCreateThumbnailResult = { thumbnailUrl: "https://mock-imagen-thumbnail.com/generated.jpg" };
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    try {
      switch (task.type) {
        case 'searchVideos':
          if (!task.query) throw new Error('Search query is required for searchVideos.');
          return await this.youTubeService.searchVideos(task.query);

        case 'getVideoDetails':
          if (!task.videoId) throw new Error('Video ID is required for getVideoDetails.');
          return await this.youTubeService.getVideoDetails(task.videoId);

        // --- Generative tasks remain mocked ---
        case 'generateVideo':
          logger.info(`[${this.name}] Using mock for generateVideo task.`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
          return this.mockGenerateVideoResult;

        case 'createThumbnail':
          logger.info(`[${this.name}] Using mock for createThumbnail task.`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
          return this.mockCreateThumbnailResult;

        default:
          throw new Error(`Unknown task type for Media Agent: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
      throw error;
    }
  }
}

module.exports = MediaAgent;
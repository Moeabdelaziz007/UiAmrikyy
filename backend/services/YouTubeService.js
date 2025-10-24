// backend/src/services/YouTubeService.js
const { google } = require('googleapis');
const logger = require('../utils/logger');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    if (!this.apiKey) {
      logger.warn('[YouTubeService] YOUTUBE_API_KEY is not set. Real API calls will fail.');
      this.youtube = null;
    } else {
      this.youtube = google.youtube({
        version: 'v3',
        auth: this.apiKey,
      });
      logger.info('[YouTubeService] Initialized successfully.');
    }
  }

  _checkClient() {
    if (!this.youtube) {
      throw new Error('YouTube Service is not configured. Please provide YOUTUBE_API_KEY.');
    }
  }

  async searchVideos(query, maxResults = 5) {
    this._checkClient();
    try {
      const response = await this.youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        order: 'relevance',
      });
      
      const videos = response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
      }));
      return { videos };
    } catch (error) {
      logger.error('[YouTubeService] Error searching videos:', error.message);
      throw new Error('Failed to search videos from YouTube API.');
    }
  }

  async getVideoDetails(videoId) {
    this._checkClient();
    try {
      const response = await this.youtube.videos.list({
        part: 'snippet,statistics,contentDetails',
        id: videoId,
      });

      if (!response.data.items || response.data.items.length === 0) {
        return { details: null, message: 'Video not found.' };
      }
      
      const item = response.data.items[0];
      const details = {
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        duration: item.contentDetails.duration, // ISO 8601 format
      };
      return { details };
    } catch (error) {
      logger.error('[YouTubeService] Error getting video details:', error.message);
      throw new Error('Failed to get video details from YouTube API.');
    }
  }
}

module.exports = YouTubeService;
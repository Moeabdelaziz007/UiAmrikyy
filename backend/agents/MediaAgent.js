// backend/src/agents/mini/MediaAgent.js
const YouTubeService = require('../../services/YouTubeService');
const VeoService = require('../../services/VeoService');
const { getAi } = require('../services/geminiService');
const { Modality } = require('@google/genai');
const logger = require('../../utils/logger');

class MediaAgent {
  constructor() {
    this.name = 'Media Agent';
    this.description = 'Handles video search, and AI-powered image and video generation and editing.';
    this.youTubeService = new YouTubeService();
    this.veoService = new VeoService();
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    try {
      switch (task.type) {
        case 'searchVideos':
          if (!task.query) throw new Error('Search query is required for searchVideos.');
          return await this.youTubeService.searchVideos(task.query);

        case 'generateImage':
          if (!task.prompt) throw new Error('Prompt is required for generateImage.');
          return await this.generateImage(task.prompt);

        case 'generateVideo':
          if (!task.prompt) throw new Error('Prompt is required for generateVideo.');
          return await this.veoService.startVideoGeneration(task);
        
        case 'getVideoStatus':
            if (!task.operation) throw new Error('Operation is required for getVideoStatus.');
            return await this.veoService.checkStatus(task);

        case 'editImage':
          if (!task.image || !task.prompt) throw new Error('Image and prompt are required for editImage.');
          return await this.editImage(task.image, task.prompt);

        case 'summarizeVideo':
            if (!task.title) throw new Error('Video title is required for summarizeVideo.');
            return await this.summarizeVideo(task.title);

        case 'contextualSearch':
            if (!task.query) throw new Error('Query is required for contextualSearch.');
            return await this.contextualSearch(task.query);
        
        case 'analyzeVideo':
            if (!task.videoUrl || !task.prompt) throw new Error('Video URL and prompt are required.');
            return await this.analyzeVideo(task.videoUrl, task.prompt);

        default:
          throw new Error(`Unknown task type for Media Agent: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
      throw error;
    }
  }

  async generateImage(prompt) {
    const ai = getAi();
    logger.info(`[${this.name}] Generating image with prompt: "${prompt}"`);
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('Image generation failed to produce an image.');
    }

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return { image: base64ImageBytes, mimeType: 'image/jpeg' };
  }

  async editImage(image, prompt) {
    const ai = getAi();
    logger.info(`[${this.name}] Editing image with prompt: "${prompt}"`);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: image.imageBytes,
                        mimeType: image.mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return { image: part.inlineData.data, mimeType: part.inlineData.mimeType };
        }
    }

    throw new Error('Image editing failed to produce an image.');
  }

  async summarizeVideo(title) {
    const ai = getAi();
    logger.info(`[${this.name}] Summarizing video: "${title}"`);
    const prompt = `Provide a concise, bullet-point summary of the YouTube video titled "${title}". Focus on the main topics and key takeaways.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return { result: response.text };
  }

  async contextualSearch(query) {
    const ai = getAi();
    logger.info(`[${this.name}] Getting suggestions for: "${query}"`);
    const prompt = `Based on the YouTube video titled "${query}", suggest 3 related videos that the user might also enjoy. Provide only the titles as a bulleted list.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return { result: response.text };
  }

  async analyzeVideo(videoUrl, userPrompt) {
    const ai = getAi();
    logger.info(`[${this.name}] Analyzing video: "${videoUrl}"`);
    const prompt = `You are a video analysis expert. Watch the video at the following URL and provide a detailed answer to the user's question.
    Video URL: ${videoUrl}
    User Question: "${userPrompt}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
    return { result: response.text };
  }
}

module.exports = MediaAgent;
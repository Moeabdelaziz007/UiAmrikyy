// backend/services/VeoService.js
const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

class VeoService {
    constructor() {
        this.modelName = 'veo-3.1-fast-generate-preview';
        logger.info('[VeoService] Initialized.');
    }

    async startVideoGeneration({ prompt, image, aspectRatio }) {
        if (!process.env.API_KEY) {
            throw new Error('API_KEY is not configured. Cannot make real Veo API calls.');
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            logger.info(`[VeoService] Starting video generation with prompt: "${prompt}"`);

            const request = {
                model: this.modelName,
                prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio || '16:9',
                }
            };
            
            if (image && image.imageBytes && image.mimeType) {
                request.image = {
                    imageBytes: image.imageBytes,
                    mimeType: image.mimeType,
                };
            }

            const operation = await ai.models.generateVideos(request);
            logger.info(`[VeoService] Video generation started. Operation name: ${operation.name}`);
            return operation;

        } catch (error) {
            logger.error('[VeoService] Error starting video generation:', error);
            throw new Error(`Failed to start video generation: ${error.message}`);
        }
    }

    async checkStatus({ operation }) {
        if (!process.env.API_KEY) {
            throw new Error('API_KEY is not configured. Cannot make real Veo API calls.');
        }
        if (!operation) {
            throw new Error('Operation object is required to check status.');
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            logger.debug(`[VeoService] Checking status for operation: ${operation.name}`);
            const updatedOperation = await ai.operations.getVideosOperation({ operation });
            logger.debug(`[VeoService] Status check complete. Done: ${updatedOperation.done}`);
            return updatedOperation;

        } catch (error) {
            logger.error('[VeoService] Error checking video generation status:', error);
            // Handle specific error for not found, which can happen if key changes
            if (error.message.includes('Requested entity was not found')) {
                throw new Error('API Key mismatch or operation not found. Please re-select your API key and try again.');
            }
            throw new Error(`Failed to check video generation status: ${error.message}`);
        }
    }
}

module.exports = VeoService;

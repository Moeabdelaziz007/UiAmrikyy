// backend/src/agents/mini/VisionAgent.js
const { getAi } = require('../services/geminiService');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const axios = require('axios');
const logger = require('../../utils/logger');

class VisionAgent {
  constructor() {
    this.name = 'Vision Agent';
    this.description = 'Handles image analysis, OCR, and object detection.';
    
    if (!process.env.API_KEY) {
      logger.warn('[VisionAgent] API_KEY not set. Gemini functions will be disabled.');
    }

    // Initialize Google Cloud Vision client
    try {
      this.cloudVisionClient = new ImageAnnotatorClient();
      logger.info('[VisionAgent] Google Cloud Vision client initialized.');
    } catch (e) {
      logger.warn('[VisionAgent] Could not initialize Google Cloud Vision client. OCR/Landmark/Object detection will be disabled. Ensure GOOGLE_APPLICATION_CREDENTIALS is set.');
      this.cloudVisionClient = null;
    }
  }

  async _getImagePart(imageUrl) {
    try {
        if (imageUrl.startsWith('data:image')) {
            const [header, data] = imageUrl.split(',');
            const mimeType = header.match(/:(.*?);/)[1];
            return { inlineData: { data, mimeType } };
        } else {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const data = Buffer.from(response.data).toString('base64');
            const mimeType = response.headers['content-type'];
            return { inlineData: { data, mimeType } };
        }
    } catch (error) {
        logger.error(`[VisionAgent] Failed to fetch or process image from URL: ${imageUrl}`, error);
        throw new Error('Could not retrieve image from the provided URL.');
    }
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    switch (task.type) {
      case 'analyzeImage':
        if (!process.env.API_KEY) throw new Error('Gemini Vision is not configured.');
        if (!task.imageUrl) throw new Error('Image URL is required for analyzeImage.');
        
        const ai = getAi();
        const imagePart = await this._getImagePart(task.imageUrl);
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, { text: task.prompt || "Describe this image in detail." }] }],
        });
        return { description: result.text };

      case 'extractText':
        if (!this.cloudVisionClient) throw new Error('Cloud Vision client is not configured.');
        if (!task.imageUrl) throw new Error('Image URL is required for extractText.');

        const [resultText] = await this.cloudVisionClient.textDetection(task.imageUrl);
        const detections = resultText.textAnnotations;
        return { fullText: detections[0]?.description || '', words: detections.slice(1).map(d => d.description) };

      case 'identifyLandmark':
        if (!this.cloudVisionClient) throw new Error('Cloud Vision client is not configured.');
        if (!task.imageUrl) throw new Error('Image URL is required for identifyLandmark.');

        const [resultLandmark] = await this.cloudVisionClient.landmarkDetection(task.imageUrl);
        return resultLandmark.landmarkAnnotations;

      case 'detectObjects':
        if (!this.cloudVisionClient) throw new Error('Cloud Vision client is not configured.');
        if (!task.imageUrl) throw new Error('Image URL is required for detectObjects.');

        const [resultObjects] = await this.cloudVisionClient.objectLocalization(task.imageUrl);
        return resultObjects.localizedObjectAnnotations;
        
      default:
        throw new Error(`Unknown task type for Vision Agent: ${task.type}`);
    }
  }
}

module.exports = VisionAgent;
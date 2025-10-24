// Mock the @google/genai library
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

// Mock the @google-cloud/vision library
const mockTextDetection = jest.fn();
const mockLandmarkDetection = jest.fn();
const mockObjectLocalization = jest.fn();
jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn(() => ({
    textDetection: mockTextDetection,
    landmarkDetection: mockLandmarkDetection,
    objectLocalization: mockObjectLocalization,
  })),
}));

// Mock axios
jest.mock('axios');
const axios = require('axios');


const VisionAgent = require('../agents/VisionAgent');
const { GoogleGenAI } = require('@google/genai');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

describe('VisionAgent', () => {
  let agent;
  const mockApiKey = 'MOCK_GEMINI_API_KEY';

  beforeEach(() => {
    process.env.API_KEY = mockApiKey;
    jest.clearAllMocks();
    agent = new VisionAgent();
  });

  afterAll(() => {
    delete process.env.API_KEY;
  });

  test('should throw error if API key is not set', async () => {
    delete process.env.API_KEY;
    agent = new VisionAgent(); // Re-initialize agent without API key
    await expect(agent.executeTask({ type: 'analyzeImage', imageUrl: 'http://example.com/img.png' }))
      .rejects.toThrow('Gemini Vision is not configured.');
  });

  describe('analyzeImage', () => {
    test('should call Gemini Vision API with correct parameters and return description', async () => {
      const mockResponse = { text: 'A beautiful landscape with mountains and a lake.' };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const imageUrl = 'data:image/jpeg;base64,mockimagedata';
      const prompt = 'Describe this scene.';
      const result = await agent.executeTask({ type: 'analyzeImage', imageUrl, prompt });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const calledWith = mockGenerateContent.mock.calls[0][0];
      expect(calledWith.model).toBe('gemini-2.5-flash');
      expect(calledWith.contents[0].parts[0].inlineData.data).toBe('mockimagedata');
      expect(calledWith.contents[0].parts[0].inlineData.mimeType).toBe('image/jpeg');
      expect(calledWith.contents[0].parts[1].text).toBe(prompt);

      expect(result).toEqual({ description: mockResponse.text });
    });

     test('should fetch remote image and call Gemini Vision API', async () => {
        const mockResponse = { text: 'A remote image.' };
        mockGenerateContent.mockResolvedValue(mockResponse);
        axios.get.mockResolvedValue({
            data: Buffer.from('remoteimagedata'),
            headers: { 'content-type': 'image/png' }
        });

        const imageUrl = 'http://example.com/img.png';
        const result = await agent.executeTask({ type: 'analyzeImage', imageUrl });

        expect(axios.get).toHaveBeenCalledWith(imageUrl, { responseType: 'arraybuffer' });
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const calledWith = mockGenerateContent.mock.calls[0][0];
        expect(calledWith.model).toBe('gemini-2.5-flash');
        expect(calledWith.contents[0].parts[0].inlineData.data).toBe(Buffer.from('remoteimagedata').toString('base64'));
        expect(calledWith.contents[0].parts[0].inlineData.mimeType).toBe('image/png');
        expect(result).toEqual({ description: mockResponse.text });
    });
  });

  describe('extractText', () => {
    test('should call Cloud Vision textDetection and return formatted text', async () => {
      const mockApiResponse = [{
        textAnnotations: [
          { description: 'Hello World\nLine 2' },
          { description: 'Hello' },
          { description: 'World' },
          { description: 'Line' },
          { description: '2' },
        ],
      }];
      mockTextDetection.mockResolvedValue(mockApiResponse);

      const imageUrl = 'http://example.com/text.png';
      const result = await agent.executeTask({ type: 'extractText', imageUrl });

      expect(mockTextDetection).toHaveBeenCalledWith(imageUrl);
      expect(result).toEqual({
        fullText: 'Hello World\nLine 2',
        words: ['Hello', 'World', 'Line', '2'],
      });
    });
  });
  
  // Similar tests can be written for 'identifyLandmark' and 'detectObjects'

  test('should throw error for unknown task type', async () => {
    await expect(agent.executeTask({ type: 'unknownTask' }))
      .rejects.toThrow('Unknown task type for Vision Agent: unknownTask');
  });
});
// Mock the @google/genai library
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

// Mock the logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const ResearchAgent = require('../agents/ResearchAgent');

describe('ResearchAgent', () => {
  let agent;
  const mockApiKey = 'MOCK_API_KEY';

  beforeEach(() => {
    process.env.API_KEY = mockApiKey;
    jest.clearAllMocks();
    agent = new ResearchAgent();
  });

  afterAll(() => {
    delete process.env.API_KEY;
  });

  test('should throw error if API key is not set', async () => {
    delete process.env.API_KEY;
    agent = new ResearchAgent(); // Re-initialize agent without API key
    await expect(agent.executeTask({ type: 'webSearch', query: 'test' }))
      .rejects.toThrow('Gemini API Key is not configured.');
  });
  
  test('should throw error for unknown task type', async () => {
    await expect(agent.executeTask({ type: 'unknownTask' }))
      .rejects.toThrow('Unknown or deprecated task type for Research Agent: unknownTask');
  });

  describe('webSearch', () => {
    test('should call Gemini with googleSearch tool and correct query', async () => {
      const mockResponse = {
        text: 'The capital of France is Paris.',
        candidates: [{
          groundingMetadata: {
            groundingChunks: [{ web: { uri: "https://en.wikipedia.org/wiki/Paris", title: "Paris - Wikipedia" } }]
          }
        }]
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const query = 'capital of France';
      const result = await agent.executeTask({ type: 'webSearch', query });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe(agent.modelName);
      expect(callArgs.contents).toBe(query);
      expect(callArgs.config.tools).toEqual([{ googleSearch: {} }]);
      
      expect(result.text).toBe(mockResponse.text);
      expect(result.groundingChunks).toEqual(mockResponse.candidates[0].groundingMetadata.groundingChunks);
    });

    test('should throw error if query is missing', async () => {
      await expect(agent.executeTask({ type: 'webSearch' }))
        .rejects.toThrow('Query is required for webSearch.');
    });
  });

  describe('locationQuery', () => {
    test('should call Gemini with googleMaps tool without location config', async () => {
      const mockResponse = { text: 'Eiffel Tower is in Paris.', candidates: [] };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const query = 'where is the Eiffel Tower';
      await agent.executeTask({ type: 'locationQuery', query });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.config.tools).toEqual([{ googleMaps: {} }]);
      expect(callArgs.config.toolConfig).toBeUndefined();
    });

    test('should call Gemini with googleMaps tool WITH location config', async () => {
      const mockResponse = { text: 'The nearest cafe is Cafe Central.', candidates: [] };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const query = 'cafe near me';
      const userLocation = { latitude: 48.8584, longitude: 2.2945 };
      await agent.executeTask({ type: 'locationQuery', query, userLocation });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.config.tools).toEqual([{ googleMaps: {} }]);
      expect(callArgs.config.toolConfig).toBeDefined();
      expect(callArgs.config.toolConfig.retrievalConfig.latLng).toEqual(userLocation);
    });

    test('should throw error if query is missing', async () => {
      await expect(agent.executeTask({ type: 'locationQuery' }))
        .rejects.toThrow('Query is required for locationQuery.');
    });
  });
});
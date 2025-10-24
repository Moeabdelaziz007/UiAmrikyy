// Mock the @google/genai library
jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn();
  return {
    GoogleGenAI: jest.fn(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
  };
});

const MarketingAgent = require('../agents/MarketingAgent');
const { GoogleGenAI } = require('@google/genai');

describe('MarketingAgent', () => {
  let agent;
  let mockGenerateContent;

  const mockApiKey = 'MOCK_GEMINI_API_KEY';
  process.env.API_KEY = mockApiKey; // Use API_KEY for consistency as per guidelines
  process.env.GEMINI_MODEL = 'gemini-2.5-flash'; // Set mock model

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new MarketingAgent();
    // Get the mocked generateContent function
    mockGenerateContent = GoogleGenAI().models.generateContent;
  });

  afterAll(() => {
    delete process.env.API_KEY; // Clean up API_KEY
    delete process.env.GEMINI_MODEL;
  });

  test('should throw error if API_KEY is not set', async () => {
    delete process.env.API_KEY; // Unset the API key
    agent = new MarketingAgent(); // Re-initialize to reflect missing key

    await expect(agent.executeTask({ type: 'marketResearch', targetAudience: 'test', productService: 'test' }))
      .rejects.toThrow('API_KEY is not configured. Cannot make real API calls.');
  });

  test('conductMarketResearch should call Gemini with Google Search tool and return response with grounding chunks', async () => {
    const mockGeminiResponse = { 
      text: 'mock market research results',
      candidates: [{
        groundingMetadata: {
          groundingChunks: [{ web: { uri: "https://mock-research.com", title: "Mock Research Paper" } }]
        }
      }]
    };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      targetAudience: 'young adults',
      productService: 'new streaming service',
      competitors: 'Netflix, Hulu',
    };
    const result = await agent.executeTask({ type: 'marketResearch', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.marketResearch.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Conduct market research for a "new streaming service" targeting "young adults".');
    expect(callArgs.config.tools).toEqual([{ googleSearch: {} }]);
    expect(result).toEqual({
      success: true,
      subAgent: 'Market Research Analyst',
      icon: '📊',
      result: {
        text: 'mock market research results',
        groundingChunks: [{ web: { uri: "https://mock-research.com", title: "Mock Research Paper" } }]
      },
      message: 'Market research conducted successfully',
    });
  });

  test('optimizeSEOStrategy should call Gemini with Google Search tool and return response with grounding chunks', async () => {
    const mockGeminiResponse = { 
      text: 'mock SEO strategy',
      candidates: [{
        groundingMetadata: {
          groundingChunks: [{ web: { uri: "https://mock-seo-blog.com", title: "Mock SEO Guide" } }]
        }
      }]
    };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      productService: 'e-commerce store',
      keywords: 'online shopping, discounts, fashion',
    };
    const result = await agent.executeTask({ type: 'seoSpecialist', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.seoSpecialist.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Optimize the SEO strategy for "e-commerce store".');
    expect(callArgs.config.tools).toEqual([{ googleSearch: {} }]);
    expect(result).toEqual({
      success: true,
      subAgent: 'SEO Specialist',
      icon: '📈',
      result: {
        text: 'mock SEO strategy',
        groundingChunks: [{ web: { uri: "https://mock-seo-blog.com", title: "Mock SEO Guide" } }]
      },
      message: 'SEO strategy optimized successfully',
    });
  });

  test('developContentStrategy should call Gemini with Google Search tool and return response with grounding chunks', async () => {
    const mockGeminiResponse = { 
      text: 'mock content strategy',
      candidates: [{
        groundingMetadata: {
          groundingChunks: [{ web: { uri: "https://mock-content-ideas.com", title: "Content Ideas Blog" } }]
        }
      }]
    };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      topic: 'sustainable living',
      targetAudience: 'environmentally conscious consumers',
    };
    const result = await agent.executeTask({ type: 'contentStrategist', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.contentStrategist.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Develop a content strategy for the topic "sustainable living" targeting "environmentally conscious consumers".');
    expect(callArgs.config.tools).toEqual([{ googleSearch: {} }]);
    expect(result).toEqual({
      success: true,
      subAgent: 'Content Strategist',
      icon: '✍️',
      result: {
        text: 'mock content strategy',
        groundingChunks: [{ web: { uri: "https://mock-content-ideas.com", title: "Content Ideas Blog" } }]
      },
      message: 'Content strategy developed successfully',
    });
  });

  test('manageSocialMedia should call Gemini with Google Search tool and return response with grounding chunks', async () => {
    const mockGeminiResponse = { 
      text: 'mock social media plan',
      candidates: [{
        groundingMetadata: {
          groundingChunks: [{ web: { uri: "https://mock-social-tips.com", title: "Social Media Tips" } }]
        }
      }]
    };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      platform: 'Instagram',
      productService: 'fashion brand',
    };
    const result = await agent.executeTask({ type: 'socialMediaManager', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.socialMediaManager.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Outline a social media management plan for "fashion brand" on "Instagram".');
    expect(callArgs.config.tools).toEqual([{ googleSearch: {} }]);
    expect(result).toEqual({
      success: true,
      subAgent: 'Social Media Manager',
      icon: '📱',
      result: {
        text: 'mock social media plan',
        groundingChunks: [{ web: { uri: "https://mock-social-tips.com", title: "Social Media Tips" } }]
      },
      message: 'Social media plan drafted successfully',
    });
  });

  test('launchMarketingCampaign should call Gemini with Google Search tool and return response with grounding chunks', async () => {
    const mockGeminiResponse = { 
      text: 'mock campaign plan',
      candidates: [{
        groundingMetadata: {
          groundingChunks: [{ web: { uri: "https://mock-campaign-strategies.com", title: "Campaign Strategy Guide" } }]
        }
      }]
    };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      campaignGoal: 'increase brand awareness',
      budget: '$5000',
      duration: '2 weeks',
    };
    const result = await agent.executeTask({ type: 'campaignManager', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.campaignManager.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Plan a marketing campaign with the goal to "increase brand awareness".');
    expect(callArgs.config.tools).toEqual([{ googleSearch: {} }]);
    expect(result).toEqual({
      success: true,
      subAgent: 'Campaign Manager',
      icon: '🚀',
      result: {
        text: 'mock campaign plan',
        groundingChunks: [{ web: { uri: "https://mock-campaign-strategies.com", title: "Campaign Strategy Guide" } }]
      },
      message: 'Marketing campaign outlined successfully',
    });
  });

  test('analyzeMarketingData should call Gemini with Google Search tool and return response with grounding chunks', async () => {
    const mockGeminiResponse = { 
      text: 'mock analytics report',
      candidates: [{
        groundingMetadata: {
          groundingChunks: [{ web: { uri: "https://mock-analytics-dashboard.com", title: "Analytics Dashboard" } }]
        }
      }]
    };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      dataToAnalyze: 'website traffic: 1000 visitors, 50 conversions',
      metrics: 'conversion rate, bounce rate',
    };
    const result = await agent.executeTask({ type: 'analyticsExpert', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.analyticsExpert.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Analyze the following marketing data:');
    expect(callArgs.config.tools).toEqual([{ googleSearch: {} }]);
    expect(result).toEqual({
      success: true,
      subAgent: 'Analytics Expert',
      icon: '📉',
      result: {
        text: 'mock analytics report',
        groundingChunks: [{ web: { uri: "https://mock-analytics-dashboard.com", title: "Analytics Dashboard" } }]
      },
      message: 'Marketing data analyzed successfully',
    });
  });

  test('generateMarketingPlan should orchestrate all sub-agents and include grounding chunks', async () => {
    mockGenerateContent
      .mockResolvedValueOnce({ text: 'mock market research', candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: "https://mock-research.com", title: "Mock Research Paper" } }] } }] })
      .mockResolvedValueOnce({ text: 'mock SEO', candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: "https://mock-seo-blog.com", title: "Mock SEO Guide" } }] } }] })
      .mockResolvedValueOnce({ text: 'mock content', candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: "https://mock-content-ideas.com", title: "Content Ideas Blog" } }] } }] })
      .mockResolvedValueOnce({ text: 'mock social media', candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: "https://mock-social-tips.com", title: "Social Media Tips" } }] } }] })
      .mockResolvedValueOnce({ text: 'mock campaign', candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: "https://mock-campaign-strategies.com", title: "Campaign Strategy Guide" } }] } }] })
      .mockResolvedValueOnce({ text: 'mock analytics', candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: "https://mock-analytics-dashboard.com", title: "Analytics Dashboard" } }] } }] });

    const prompt = 'promote a new eco-friendly product';
    const result = await agent.executeTask({ type: 'generateMarketingPlan', prompt });

    expect(mockGenerateContent).toHaveBeenCalledTimes(6);
    expect(result.success).toBe(true);
    expect(result.subAgentResults.marketResearch.result.text).toBe('mock market research');
    expect(result.subAgentResults.marketResearch.result.groundingChunks).toBeDefined();
    // ... similar checks for other sub-agents
  });

  test('should throw error for unknown task type', async () => {
    await expect(agent.executeTask({ type: 'unknownTask' }))
      .rejects.toThrow('Unknown task type: unknownTask');
  });

  test('should handle Gemini API errors gracefully', async () => {
    const errorMessage = 'Gemini API call failed';
    mockGenerateContent.mockRejectedValue(new Error(errorMessage));

    await expect(agent.executeTask({ type: 'marketResearch', targetAudience: 'error case', productService: 'error product' }))
      .rejects.toThrow(errorMessage);
  });
});
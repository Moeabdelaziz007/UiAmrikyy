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

const CodingAgent = require('../agents/CodingAgent');
const { GoogleGenAI } = require('@google/genai');

describe('CodingAgent', () => {
  let agent;
  let mockGenerateContent;

  const mockApiKey = 'MOCK_GEMINI_API_KEY';
  process.env.API_KEY = mockApiKey; // Use API_KEY for consistency as per guidelines
  process.env.GEMINI_MODEL = 'gemini-2.5-flash'; // Set mock model

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new CodingAgent();
    // Get the mocked generateContent function
    mockGenerateContent = GoogleGenAI().models.generateContent;
  });

  afterAll(() => {
    delete process.env.API_KEY; // Clean up API_KEY
    delete process.env.GEMINI_MODEL;
  });

  test('should throw error if API_KEY is not set', async () => {
    delete process.env.API_KEY; // Unset the API key
    agent = new CodingAgent(); // Re-initialize to reflect missing key

    await expect(agent.executeTask({ type: 'generateUI', projectDescription: 'test' }))
      .rejects.toThrow('API_KEY is not configured. Cannot make real AI calls.');
  });

  test('generateUI should call Gemini with correct prompt and return response', async () => {
    const mockGeminiResponse = { text: 'mock UI code' };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      projectDescription: 'login form',
      component: 'AuthCard',
      framework: 'React',
    };
    const result = await agent.executeTask({ type: 'generateUI', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.uiux.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Generate production-ready frontend code for a "login form" project.');
    expect(result).toEqual({
      success: true,
      subAgent: 'UI/UX Expert',
      icon: '🎨',
      result: 'mock UI code',
      message: 'UI component generated successfully',
    });
  });

  test('designAPI should call Gemini with correct prompt and return response', async () => {
    const mockGeminiResponse = { text: 'mock API design' };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      serviceDescription: 'user service',
      endpoints: '/users',
      language: 'Node.js',
    };
    const result = await agent.executeTask({ type: 'designAPI', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.api.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Design a complete API for "user service".');
    expect(result).toEqual({
      success: true,
      subAgent: 'API Architect',
      icon: '🔌',
      result: 'mock API design',
      message: 'API design completed successfully',
    });
  });

  test('createDeploymentConfig should call Gemini with correct prompt and return response', async () => {
    const mockGeminiResponse = { text: 'mock deployment config' };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      serviceDescription: 'backend service',
      platform: 'Kubernetes',
      ciCdTool: 'GitHub Actions',
    };
    const result = await agent.executeTask({ type: 'createDeploymentConfig', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.devops.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Create deployment configuration for a "backend service" application.');
    expect(result).toEqual({
      success: true,
      subAgent: 'DevOps Engineer',
      icon: '🚀',
      result: 'mock deployment config',
      message: 'Deployment configuration created successfully',
    });
  });

  test('writeTests should call Gemini with correct prompt and return response', async () => {
    const mockGeminiResponse = { text: 'mock test cases' };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      feature: 'user authentication',
      testFramework: 'Jest',
    };
    const result = await agent.executeTask({ type: 'writeTests', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.qa.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Write comprehensive tests for the "user authentication" feature.');
    expect(result).toEqual({
      success: true,
      subAgent: 'QA Specialist',
      icon: '✅',
      result: 'mock test cases',
      message: 'Test suite generated successfully',
    });
  });

  test('generateDocumentation should call Gemini with correct prompt and return response', async () => {
    const mockGeminiResponse = { text: 'mock documentation' };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const taskInput = {
      codeDescription: 'User login function',
      docType: 'API reference',
    };
    const result = await agent.executeTask({ type: 'generateDocumentation', ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.docs.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain('Generate comprehensive "API reference" documentation for the following code/feature description:');
    expect(result).toEqual({
      success: true,
      subAgent: 'Documentation Writer',
      icon: '📚',
      result: 'mock documentation',
      message: 'Documentation generated successfully',
    });
  });

  test('reviewCode should call Gemini with correct prompt and return response', async () => {
    const mockGeminiResponse = { text: 'mock code review' };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const codeToReview = 'function sum(a, b) { return a + b; }';
    const result = await agent.executeTask({ type: 'reviewCode', code: codeToReview });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe(agent.modelName);
    expect(callArgs.contents[0].parts[0].text).toContain(agent.subAgents.reviewer.systemPrompt);
    expect(callArgs.contents[0].parts[0].text).toContain(`Review the following code:\n\`\`\`\n${codeToReview}\n\`\`\``);
    expect(result).toEqual({
      success: true,
      subAgent: 'Code Reviewer',
      icon: '🔍',
      result: 'mock code review',
      message: 'Code review completed successfully',
    });
  });

  test('generateFullProject should orchestrate all sub-agents', async () => {
    // Mock generateContent for each sub-agent call within generateFullProject
    mockGenerateContent
      .mockResolvedValueOnce({ text: 'mock UI' }) // generateUI
      .mockResolvedValueOnce({ text: 'mock API' }) // designAPI
      .mockResolvedValueOnce({ text: 'mock deployment' }) // createDeployment
      .mockResolvedValueOnce({ text: 'mock tests' }) // writeTests
      .mockResolvedValueOnce({ text: 'mock docs' }) // generateDocumentation
      .mockResolvedValueOnce({ text: 'mock full review' }); // reviewCode

    const prompt = 'build a simple e-commerce app';
    const result = await agent.executeTask({ type: 'generateFullProject', prompt });

    expect(mockGenerateContent).toHaveBeenCalledTimes(6); // One for each sub-agent
    expect(result.success).toBe(true);
    expect(result.subAgentResults.ui.result).toBe('mock UI');
    expect(result.subAgentResults.api.result).toBe('mock API');
    expect(result.subAgentResults.deployment.result).toBe('mock deployment');
    expect(result.subAgentResults.tests.result).toBe('mock tests');
    expect(result.subAgentResults.docs.result).toBe('mock docs');
    expect(result.subAgentResults.review.result).toBe('mock full review');
    expect(result.summary).toEqual({
      totalSubAgents: 6,
      completedTasks: 6,
      status: 'complete',
    });
  });

  test('should throw error for unknown task type', async () => {
    await expect(agent.executeTask({ type: 'unknownTask' }))
      .rejects.toThrow('Unknown task type: unknownTask');
  });

  test('should handle Gemini API errors gracefully', async () => {
    const errorMessage = 'Gemini API call failed';
    mockGenerateContent.mockRejectedValue(new Error(errorMessage));

    await expect(agent.executeTask({ type: 'generateUI', projectDescription: 'error case' }))
      .rejects.toThrow(errorMessage);
  });
});
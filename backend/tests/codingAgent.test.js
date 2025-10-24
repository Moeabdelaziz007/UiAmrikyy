// Mock the @google/genai library
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

const CodingAgent = require('../agents/CodingAgent');
const { GoogleGenAI } = require('@google/genai');

describe('CodingAgent', () => {
  let agent;

  const mockApiKey = 'MOCK_GEMINI_API_KEY';

  beforeEach(() => {
    process.env.API_KEY = mockApiKey;
    jest.clearAllMocks();
    agent = new CodingAgent();
  });

  afterAll(() => {
    delete process.env.API_KEY;
  });

  test('should throw error if API_KEY is not set', async () => {
    delete process.env.API_KEY;
    agent = new CodingAgent();

    await expect(agent.executeTask({ type: 'generateUI', projectDescription: 'test' }))
      .rejects.toThrow('API_KEY is not configured. Cannot make real AI calls.');
  });

  const testSubAgent = async (taskType, taskInput, expectedSystemPrompt, expectedUserPromptContains, expectedResult) => {
    const mockGeminiResponse = { text: `mock ${taskType} result` };
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const result = await agent.executeTask({ type: taskType, ...taskInput });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    
    expect(callArgs.model).toBe('gemini-2.5-pro');
    expect(callArgs.config.systemInstruction).toBe(expectedSystemPrompt);
    expect(callArgs.contents).toContain(expectedUserPromptContains);
    expect(callArgs.config.thinkingConfig).toEqual({ thinkingBudget: 32768 });
    
    expect(result).toEqual(expect.objectContaining({
      success: true,
      result: mockGeminiResponse.text,
      ...expectedResult
    }));
  };

  test('generateUI should call Gemini with correct parameters', async () => {
    await testSubAgent(
      'generateUI',
      { projectDescription: 'login form', component: 'AuthCard', framework: 'React' },
      agent.subAgents.uiux.systemPrompt,
      'Generate production-ready frontend code for a "login form" project.',
      { subAgent: 'UI/UX Expert', message: 'UI component generated successfully' }
    );
  });

  test('designAPI should call Gemini with correct parameters', async () => {
    await testSubAgent(
      'designAPI',
      { serviceDescription: 'user service', endpoints: '/users', language: 'Node.js' },
      agent.subAgents.api.systemPrompt,
      'Design a complete API for "user service".',
      { subAgent: 'API Architect', message: 'API design completed successfully' }
    );
  });

  test('createDeploymentConfig should call Gemini with correct parameters', async () => {
    await testSubAgent(
      'createDeploymentConfig',
      { serviceDescription: 'backend service', platform: 'Kubernetes', ciCdTool: 'GitHub Actions' },
      agent.subAgents.devops.systemPrompt,
      'Create deployment configuration for a "backend service" application.',
      { subAgent: 'DevOps Engineer', message: 'Deployment configuration created successfully' }
    );
  });

  test('writeTests should call Gemini with correct parameters', async () => {
    await testSubAgent(
      'writeTests',
      { feature: 'user authentication', testFramework: 'Jest' },
      agent.subAgents.qa.systemPrompt,
      'Write comprehensive tests for the "user authentication" feature.',
      { subAgent: 'QA Specialist', message: 'Test suite generated successfully' }
    );
  });

  test('generateDocumentation should call Gemini with correct parameters', async () => {
    await testSubAgent(
      'generateDocumentation',
      { codeDescription: 'User login function', docType: 'API reference' },
      agent.subAgents.docs.systemPrompt,
      'Generate comprehensive "API reference" documentation',
      { subAgent: 'Documentation Writer', message: 'Documentation generated successfully' }
    );
  });

  test('reviewCode should call Gemini with correct parameters', async () => {
    const codeToReview = 'function sum(a, b) { return a + b; }';
    await testSubAgent(
      'reviewCode',
      { code: codeToReview },
      agent.subAgents.reviewer.systemPrompt,
      `Review the following code:\n\`\`\`\n${codeToReview}\n\`\`\``,
      { subAgent: 'Code Reviewer', message: 'Code review completed successfully' }
    );
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
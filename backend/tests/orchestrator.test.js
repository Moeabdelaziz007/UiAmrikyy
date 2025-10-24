// Mock the @google/genai library
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  ...jest.requireActual('@google/genai'), // Keep Type enum available
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

const OrchestratorAgent = require('../agents/OrchestratorAgent');
const { GoogleGenAI } = require('@google/genai');

// Mock the logger to prevent console output during tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('OrchestratorAgent', () => {
  let agent;
  const mockApiKey = 'MOCK_GEMINI_API_KEY';

  beforeEach(() => {
    process.env.API_KEY = mockApiKey;
    jest.clearAllMocks();
    agent = new OrchestratorAgent();
  });

  afterAll(() => {
    delete process.env.API_KEY;
  });

  test('should call Gemini with correct system instruction, prompt, and JSON config', async () => {
    const mockWorkflow = {
      name: 'Test Workflow',
      steps: [{ id: 'step-1', agentId: 'research', taskType: 'webSearch', taskInput: { query: 'testing' } }],
    };
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockWorkflow) });

    const prompt = 'this is a test prompt';
    const result = await agent.planExecution(prompt);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];

    expect(callArgs.model).toBe('gemini-2.5-pro');
    expect(callArgs.contents[0].parts[0].text).toBe(prompt);
    expect(callArgs.config.systemInstruction).toContain('You are an expert AI orchestrator');
    expect(callArgs.config.systemInstruction).toContain('- **navigator**:');
    expect(callArgs.config.responseMimeType).toBe('application/json');
    expect(callArgs.config.responseSchema).toBeDefined();

    expect(result).toEqual(mockWorkflow);
  });

  test('should parse and return the JSON workflow from Gemini', async () => {
    const mockWorkflow = {
      name: 'Multi-step Plan',
      steps: [
        { id: 'step-1', agentId: 'research', taskType: 'webSearch', taskInput: { query: 'restaurants' } },
        { id: 'step-2', agentId: 'scheduler', taskType: 'createEvent', taskInput: { title: 'Dinner at {{steps.step-1.output.results[0].name}}' } },
      ],
    };
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockWorkflow) });

    const result = await agent.planExecution('find restaurants and book one');
    expect(result).toEqual(mockWorkflow);
  });

  test('should fall back to mock logic if API key is not set', async () => {
    delete process.env.API_KEY;
    agent = new OrchestratorAgent(); // Re-initialize without API key

    const result = await agent.planExecution('plan a trip to mars');
    
    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(result.name).toBe('Trip Planning (Mock)');
    expect(result.steps[0].agentId).toBe('navigator');
  });
  
  test('should fall back to mock logic if Gemini API call fails', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Failure'));
    
    const result = await agent.planExecution('this will fail');
    
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Simple Web Search (Mock)');
    expect(result.steps[0].taskInput.query).toBe('this will fail');
  });

});
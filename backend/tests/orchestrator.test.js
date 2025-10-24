const request = require('supertest');
const express = require('express');
const apiRoutes = require('../routes/api'); // Assuming your API routes are in routes/api.js
const orchestratorService = require('../services/agentOrchestrator'); // Import to allow spying

// Mock the logger to prevent console output during tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));


// Create a dummy Express app to test the routes
const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('Orchestrator API', () => {

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('POST /api/orchestrator should return a mock trip planning workflow for "Plan a 7-day trip to Egypt"', async () => {
    const prompt = 'Plan a 7-day trip to Egypt';
    const response = await request(app)
      .post('/api/orchestrator')
      .send({ prompt, lang: 'en' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe('Trip Planning');
    expect(response.body.steps).toBeInstanceOf(Array);
    expect(response.body.steps.length).toBeGreaterThan(0);
    expect(response.body.steps[0]).toHaveProperty('agentId', 'research');
    expect(response.body.steps[0].taskInput.query).toContain('Egypt');
  });

  test('POST /api/orchestrator should return a simple search workflow for an unknown prompt', async () => {
    const prompt = 'What is the capital of France?';
    const response = await request(app)
      .post('/api/orchestrator')
      .send({ prompt, lang: 'en' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe('Simple Web Search');
    expect(response.body.steps).toHaveLength(1);
    expect(response.body.steps[0]).toHaveProperty('agentId', 'research');
    expect(response.body.steps[0].taskInput.query).toBe(prompt); // Verify placeholder was replaced
  });

  test('POST /api/orchestrator should return 400 if prompt is missing', async () => {
    const response = await request(app)
      .post('/api/orchestrator')
      .send({ lang: 'en' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Prompt is required');
  });

  test('POST /api/orchestrator should handle internal errors gracefully', async () => {
    // Spy on the planExecution method and make it throw an error
    const planExecutionSpy = jest.spyOn(orchestratorService, 'planExecution').mockImplementationOnce(() => {
      throw new Error('Internal planning failure');
    });

    const prompt = 'a prompt that will cause an error';
    const response = await request(app)
      .post('/api/orchestrator')
      .send({ prompt })
      .expect(500);

    expect(response.body).toHaveProperty('error', 'Failed to orchestrate task');
    
    // Restore the original implementation after the test
    planExecutionSpy.mockRestore();
  });
});
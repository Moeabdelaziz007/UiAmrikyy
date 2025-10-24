const express = require('express');
const router = express.Router();
// Import the singleton instance of the service
const orchestratorService = require('../services/agentOrchestrator'); 
const TravelAgent = require('../agents/TravelAgent');
const VisionAgent = require('../agents/VisionAgent');
const ResearchAgent = require('../agents/ResearchAgent');
const runResearchAixTask = require('../agents/ResearchAgent').runAixTask; // Import the new function
const TranslatorAgent = require('../agents/TranslatorAgent');
const SchedulerAgent = require('../agents/SchedulerAgent');
const StorageAgent = require('../agents/StorageAgent');
const MediaAgent = require('../agents/MediaAgent');
const CommunicatorAgent = require('../agents/CommunicatorAgent');
const CodingAgent = require('../agents/CodingAgent');
const MarketingAgent = require('../agents/MarketingAgent'); // Import MarketingAgent
const ChatAgent = require('../agents/ChatAgent'); // Import ChatAgent
const PromptEngineeringAgent = require('../agents/PromptEngineeringAgent'); // Import PromptEngineeringAgent
const VoiceControlAgent = require('../agents/VoiceControlAgent'); // Import VoiceControlAgent
const GuardianAgent = require('../agents/GuardianAgent'); // Import GuardianAgent
const ContentCreatorAgent = require('../agents/ContentCreatorAgent'); // Import ContentCreatorAgent
const logger = require('../utils/logger');


// Initialize agents
const travelAgent = new TravelAgent();
const visionAgent = new VisionAgent();
const researchAgent = new ResearchAgent();
const translatorAgent = new TranslatorAgent();
const schedulerAgent = new SchedulerAgent();
const storageAgent = new StorageAgent();
const mediaAgent = new MediaAgent();
const communicatorAgent = new CommunicatorAgent();
const codingAgent = new CodingAgent();
const marketingAgent = new MarketingAgent(); // Instantiate MarketingAgent
const chatAgent = new ChatAgent();
const promptEngineeringAgent = new PromptEngineeringAgent();
const voiceControlAgent = new VoiceControlAgent();
const guardianAgent = new GuardianAgent(); // Instantiate GuardianAgent
const contentCreatorAgent = new ContentCreatorAgent(); // Instantiate ContentCreatorAgent


// --- Orchestrator Route ---
router.post('/orchestrator', async (req, res) => {
  const { prompt, lang } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Use the orchestrator service instance directly
    const workflow = await orchestratorService.planExecution(prompt, lang);
    res.json(workflow);
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({ error: 'Failed to orchestrate task' });
  }
});

// --- New Voice Command Route ---
router.post('/voice-command', async (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Command text is required' });
    }
    try {
        const result = await voiceControlAgent.parseCommand(command);
        res.json(result);
    } catch (error) {
        logger.error('Voice Command error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Individual Agent Routes ---

// Chat Agent
router.post('/agents/chat', async (req, res) => {
  try {
    const result = await chatAgent.executeTask(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Chat Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Content Creator Agent
router.post('/agents/content-creator', async (req, res) => {
  try {
    const result = await contentCreatorAgent.executeTask(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Content Creator Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Travel Agent (replaces Navigator)
router.post('/agents/travel', async (req, res) => {
  try {
    const result = await travelAgent.executeTask(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Travel Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vision Agent
router.post('/agents/vision', async (req, res) => {
  const { type, imageUrl, prompt } = req.body;
  try {
    const result = await visionAgent.executeTask({ type, imageUrl, prompt });
    res.json(result);
  } catch (error) {
    console.error('Vision Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Research Agent
router.post('/agents/research', async (req, res) => {
  try {
    const result = await researchAgent.executeTask(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Research Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Translator Agent
router.post('/agents/translator', async (req, res) => {
  try {
    // Pass the entire request body to the agent.
    // The agent is responsible for validating and extracting the needed properties for each task type.
    const result = await translatorAgent.executeTask(req.body);
    res.json(result);
  } catch (error) {
    console.error('Translator Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scheduler Agent
router.post('/agents/scheduler', async (req, res) => {
  const { type, eventTitle, eventLocation, startTime, endTime, timeRange, eventId, reminder, itineraryData } = req.body;
  try {
    const result = await schedulerAgent.executeTask({ type, eventTitle, eventLocation, startTime, endTime, timeRange, eventId, reminder, itineraryData });
    res.json(result);
  } catch (error) {
    console.error('Scheduler Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Storage Agent
router.post('/agents/storage', async (req, res) => {
  const { type, content, filename, tripData, fileInput, fileId, email } = req.body;
  try {
    const result = await storageAgent.executeTask({ type, content, filename, tripData, fileInput, fileId, email });
    res.json(result);
  } catch (error) {
    console.error('Storage Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Media Agent
router.post('/agents/media', async (req, res) => {
  try {
    const result = await mediaAgent.executeTask(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Media Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// New route for checking video generation status
router.post('/agents/media/video-status', async (req, res) => {
  const { operation } = req.body;
  try {
    const result = await mediaAgent.executeTask({ type: 'getVideoStatus', operation });
    // Add API key to the URI if it's done
    if (result.done && result.response?.generatedVideos?.[0]?.video?.uri) {
      const uriWithKey = `${result.response.generatedVideos[0].video.uri}&key=${process.env.API_KEY}`;
      result.response.generatedVideos[0].video.uri = uriWithKey;
    }
    res.json(result);
  } catch (error) {
    logger.error('Media Agent video status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Communicator Agent
router.post('/agents/communicator', async (req, res) => {
  const { type, to, subject, body, itineraryData, message, chatId } = req.body;
  try {
    // Pass all possible params; the agent will pick what it needs.
    const result = await communicatorAgent.executeTask({ type, recipient: to, subject, body, itineraryData, notificationMessage: message, chatId, message });
    res.json(result);
  } catch (error) {
    console.error('Communicator Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Coding Agent
router.post('/agents/coding', async (req, res) => {
  const { type, ...taskInput } = req.body; // Extract type and rest as taskInput
  try {
    const result = await codingAgent.executeTask({ type, ...taskInput });
    res.json(result);
  } catch (error) {
    logger.error(`Coding Agent error on task ${type}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Marketing Agent
router.post('/agents/marketing', async (req, res) => {
  const { type, ...taskInput } = req.body;
  try {
    const result = await marketingAgent.executeTask({ type, ...taskInput });
    res.json(result);
  } catch (error) {
    logger.error(`Marketing Agent error on task ${type}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Prompt Engineering Agent
router.post('/agents/prompt-engineer', async (req, res) => {
  try {
    const result = await promptEngineeringAgent.executeTask({ type: 'refinePrompt', ...req.body });
    res.json(result);
  } catch (error) {
    logger.error('Prompt Engineering Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Guardian Agent (Self-Healing)
router.post('/agents/guardian', async (req, res) => {
  const { failedTask } = req.body;
  try {
    const result = await guardianAgent.executeTask({ failedTask });
    res.json(result);
  } catch (error) {
    logger.error('Guardian Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});


// --- AIX Test Routes ---
router.post('/test-aix', async (req, res) => {
  logger.info('Received request to test AIX execution');
  // For this test, we hardcode the filename.
  // In a real scenario, this might come from the request body.
  const result = await runResearchAixTask('customer_feedback_analysis.aix');
  if (result.success) {
    res.json({ message: 'AIX task executed successfully', output: result.output });
  } else {
    res.status(500).json({ message: 'AIX task failed', error: result.error });
  }
});

router.post('/test-aix-summary', async (req, res) => {
  logger.info('Received request to test AIX document summarization');
  const result = await runResearchAixTask('document_summarization.aix');
  if (result.success) {
    res.json({ message: 'AIX summarization task executed successfully', output: result.output });
  } else {
    res.status(500).json({ message: 'AIX summarization task failed', error: result.error });
  }
});

router.post('/test-aix-slogan', async (req, res) => {
  logger.info('Received request to test AIX slogan generation');
  const result = await runResearchAixTask('slogan_generation.aix');
  if (result.success) {
    res.json({ message: 'AIX slogan generation task executed successfully', output: result.output });
  } else {
    res.status(500).json({ message: 'AIX slogan generation task failed', error: result.error });
  }
});


module.exports = router;
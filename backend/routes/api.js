const express = require('express');
const router = express.Router();
// Import the singleton instance of the service
const orchestratorService = require('../services/agentOrchestrator'); 
const NavigatorAgent = require('../agents/NavigatorAgent');
const VisionAgent = require('../agents/VisionAgent');
const ResearchAgent = require('../agents/ResearchAgent');
const TranslatorAgent = require('../agents/TranslatorAgent');
const SchedulerAgent = require('../agents/SchedulerAgent');
const StorageAgent = require('../agents/StorageAgent');
const MediaAgent = require('../agents/MediaAgent');
const CommunicatorAgent = require('../agents/CommunicatorAgent');
const CodingAgent = require('../agents/CodingAgent');
const MarketingAgent = require('../agents/MarketingAgent'); // Import MarketingAgent
const logger = require('../utils/logger');


// Initialize agents
const navigatorAgent = new NavigatorAgent();
const visionAgent = new VisionAgent();
const researchAgent = new ResearchAgent();
const translatorAgent = new TranslatorAgent();
const schedulerAgent = new SchedulerAgent();
const storageAgent = new StorageAgent();
const mediaAgent = new MediaAgent();
const communicatorAgent = new CommunicatorAgent();
const codingAgent = new CodingAgent();
const marketingAgent = new MarketingAgent(); // Instantiate MarketingAgent


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

// --- Individual Agent Routes ---

// Navigator Agent
router.post('/agents/navigator', async (req, res) => {
  const { type, origin, destination, location, placeType, address } = req.body;
  try {
    const result = await navigatorAgent.executeTask({ type, origin, destination, location, placeType, address });
    res.json(result);
  } catch (error) {
    console.error('Navigator Agent error:', error);
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
  const { type, query, location, filters, itemName, placeName } = req.body;
  try {
    const result = await researchAgent.executeTask({ type, query, location, filters, itemName, placeName });
    res.json(result);
  } catch (error) {
    console.error('Research Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Translator Agent
router.post('/agents/translator', async (req, res) => {
  const { type, text, targetLang, sourceLang, audioFile, language } = req.body;
  try {
    const result = await translatorAgent.executeTask({ type, text, targetLang, sourceLang, audioFile, language });
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
  const { type, query, videoId, prompt } = req.body;
  try {
    // The MediaAgent distinguishes between generate/thumbnail prompts, so pass them all.
    const result = await mediaAgent.executeTask({ type, query, videoId, generatePrompt: prompt, thumbnailPrompt: prompt });
    res.json(result);
  } catch (error) {
    console.error('Media Agent error:', error);
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


module.exports = router;
// backend/agents/VoiceControlAgent.js
const { getAi } = require('../services/geminiService');
const { Type } = require('@google/genai');
const logger = require('../utils/logger');

const openAppFunctionDeclaration = {
    name: 'openApp',
    parameters: { type: Type.OBJECT, description: 'Opens a specified application.', properties: { appName: { type: Type.STRING, description: 'The name of the app to open, e.g., "Terminal" or "Coding Agent".' } }, required: ['appName'] }
};

const executeWorkflowFunctionDeclaration = {
    name: 'executeWorkflow',
    parameters: { type: Type.OBJECT, description: 'Executes a complex multi-step workflow for searches, planning, or multi-agent tasks.', properties: { prompt: { type: Type.STRING, description: 'The complex user request, e.g., "Plan a 3-day trip to Paris" or "search for the weather".' } }, required: ['prompt'] }
};

class VoiceControlAgent {
    constructor() {
        this.name = 'Voice Control Agent';
        this.model = 'gemini-2.5-pro';
    }

    async parseCommand(command) {
        logger.info(`[${this.name}] Parsing command: "${command}"`);
        if (!process.env.API_KEY) throw new Error('Gemini API is not configured.');

        try {
            const ai = getAi();
            const response = await ai.models.generateContent({
                model: this.model,
                contents: [{ role: 'user', parts: [{ text: `Command: "${command}"` }] }],
                config: { tools: [{ functionDeclarations: [openAppFunctionDeclaration, executeWorkflowFunctionDeclaration] }] }
            });
            
            const call = response.functionCalls?.[0];
            if (call) {
                if (call.name === 'openApp') {
                    return { action: 'openApp', appName: call.args.appName };
                } else if (call.name === 'executeWorkflow') {
                    return { action: 'executeWorkflow', prompt: call.args.prompt };
                }
            }
            
            // If no function call, return a text response
            return { action: 'speak', text: response.text || "Sorry, I couldn't understand that command." };

        } catch (error) {
            logger.error(`[${this.name}] Error parsing command:`, error);
            throw new Error('Failed to parse voice command with Gemini.');
        }
    }
}

module.exports = VoiceControlAgent;

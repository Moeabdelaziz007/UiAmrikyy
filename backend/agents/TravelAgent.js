const { getAi } = require('../services/geminiService');
const GoogleMapsService = require('../services/GoogleMapsService');
const logger = require('../utils/logger');

class TravelAgent {
  constructor() {
    this.name = "Travel Agent";
    this.description = "A powerful AI travel assistant for planning trips, finding flights, hotels, and local spots.";
    this.proModel = 'gemini-2.5-pro';
    this.flashModel = 'gemini-2.5-flash';
    this.mapsService = new GoogleMapsService();

    if (!process.env.API_KEY) {
      logger.warn(`[${this.name}] Gemini API Key is not configured. Real API calls will fail.`);
    }
  }

  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);
    if (!process.env.API_KEY) throw new Error('Gemini API Key is not configured.');

    try {
      switch (task.type) {
        case 'createItinerary':
          if (!task.prompt) throw new Error('A prompt is required to create an itinerary.');
          return await this.createItinerary(task.prompt);
        
        case 'findFlights':
            if (!task.origin || !task.destination) throw new Error('Origin and destination are required to find flights.');
            return await this.findFlights(task.origin, task.destination, task.dates);

        case 'findHotels':
            if (!task.location) throw new Error('Location is required to find hotels.');
            return await this.findHotels(task.location, task.dates, task.criteria);

        case 'findPlacesOfInterest':
            if (!task.location || !task.placeType) throw new Error('Location and place type are required.');
            return await this.findPlacesOfInterest(task.location, task.placeType);

        case 'getDirections':
          if (!task.origin || !task.destination) throw new Error('Origin and destination are required for directions.');
          const directions = await this.mapsService.getDirections(task.origin, task.destination);
          return { text: `Directions from ${task.origin} to ${task.destination} are ready.`, directions };

        default:
          throw new Error(`Unknown task type for Travel Agent: ${task.type}`);
      }
    } catch (error) {
        logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
        throw error;
    }
  }

  async createItinerary(prompt) {
    const ai = getAi();
    const systemInstruction = `You are an expert travel planner. Create a detailed, day-by-day itinerary based on the user's request. Include suggested timings, activity descriptions, and travel tips. Format the output clearly using Markdown.`;
    
    const response = await ai.models.generateContent({
        model: this.proModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { 
            systemInstruction,
            thinkingConfig: { thinkingBudget: 32768 },
        },
    });

    return { text: response.text };
  }

  async findFlights(origin, destination, dates) {
    const ai = getAi();
    const prompt = `You are a flight search assistant. Find flights from ${origin} to ${destination} for the following dates: ${dates || 'anytime soon'}.
    Search popular travel sites like Google Flights, Skyscanner, Kayak, and Cheapoair.
    Provide a summary of the best options, including airlines, prices (in USD), and number of stops. Also mention any notable deals or tips.`;

    const response = await ai.models.generateContent({
        model: this.flashModel,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
    });

    return {
        text: response.text,
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  }

  async findHotels(location, dates, criteria) {
    const ai = getAi();
    const prompt = `You are a hotel search assistant. Find hotels in ${location} for the dates: ${dates || 'upcoming'}.
    Consider the following criteria: ${criteria || 'best value'}.
    Search popular booking sites like Booking.com, Expedia, and Hotels.com.
    Provide a summary of the top 3-5 hotel options with their star rating, approximate price per night (in USD), and key features.`;
    
    const response = await ai.models.generateContent({
        model: this.flashModel,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
    });

    return {
        text: response.text,
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  }
  
  async findPlacesOfInterest(location, placeType) {
    const ai = getAi();
    const prompt = `Find the best ${placeType} in or near ${location}. Provide a list of the top 3-5 places with a brief description of each.`;
    
    const response = await ai.models.generateContent({
        model: this.flashModel,
        contents: prompt,
        config: { tools: [{ googleMaps: {} }] },
    });

    return {
        text: response.text,
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  }
}

module.exports = TravelAgent;
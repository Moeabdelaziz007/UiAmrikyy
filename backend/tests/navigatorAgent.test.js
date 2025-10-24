// Mock the @googlemaps/google-maps-services-js library
jest.mock('@googlemaps/google-maps-services-js', () => ({
  Client: jest.fn(() => ({
    directions: jest.fn(),
    placesNearby: jest.fn(),
    geocode: jest.fn(),
  })),
}));

const NavigatorAgent = require('../agents/NavigatorAgent');
const { Client } = require('@googlemaps/google-maps-services-js');

describe('NavigatorAgent', () => {
  let agent;
  let mockDirections;
  let mockPlacesNearby;
  let mockGeocode;

  // Set a mock API key for the environment
  const mockApiKey = 'MOCK_GOOGLE_MAPS_API_KEY';
  process.env.GOOGLE_MAPS_API_KEY = mockApiKey;

  beforeEach(() => {
    // Clear all mocks and reset mock implementations
    jest.clearAllMocks();
    agent = new NavigatorAgent();

    // Get the mock implementations of the client methods
    mockDirections = Client().directions;
    mockPlacesNearby = Client().placesNearby;
    mockGeocode = Client().geocode;
  });

  afterAll(() => {
    // Clean up environment variable
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  test('should call getDirections API with correct parameters', async () => {
    const mockResponse = {
      data: {
        routes: [{
          summary: "Real Route: Cairo to Alexandria",
          legs: [{
            distance: { text: "180 km" },
            duration: { text: "2 hours 30 mins" },
            steps: [{ html_instructions: "Drive North" }]
          }]
        }]
      }
    };
    mockDirections.mockResolvedValue(mockResponse);

    const taskInput = { origin: 'Cairo', destination: 'Alexandria' };
    const result = await agent.executeTask({ type: 'getDirections', ...taskInput });

    expect(mockDirections).toHaveBeenCalledTimes(1);
    expect(mockDirections).toHaveBeenCalledWith({
      params: {
        origin: 'Cairo',
        destination: 'Alexandria',
        mode: 'driving',
        key: mockApiKey,
      },
    });
    expect(result).toEqual(mockResponse.data.routes[0]);
    expect(result.summary).toContain('Real Route');
  });

  test('should call findNearby API with correct parameters', async () => {
    const mockResponse = {
      data: {
        results: [
          { name: "Real Restaurant 1", vicinity: "123 Real St", rating: 4.5, geometry: { location: { lat: 30.0, lng: 31.0 } }, place_id: "real_place_1" },
          { name: "Real Restaurant 2", vicinity: "456 True Ave", rating: 4.0, geometry: { location: { lat: 30.1, lng: 31.1 } }, place_id: "real_place_2" }
        ]
      }
    };
    mockPlacesNearby.mockResolvedValue(mockResponse);

    const taskInput = { location: { lat: 30.0444, lng: 31.2357 }, placeType: 'restaurant' };
    const result = await agent.executeTask({ type: 'findNearby', ...taskInput });

    expect(mockPlacesNearby).toHaveBeenCalledTimes(1);
    expect(mockPlacesNearby).toHaveBeenCalledWith({
      params: {
        location: { lat: 30.0444, lng: 31.2357 },
        type: 'restaurant',
        radius: 1000,
        key: mockApiKey,
      },
    });
    expect(result).toEqual({ results: mockResponse.data.results });
    expect(result.results).toHaveLength(2);
    expect(result.results[0].name).toContain('Real Restaurant');
  });

  test('should call geocode API with correct parameters', async () => {
    const mockResponse = {
      data: {
        results: [{
          geometry: { location: { lat: 30.0444, lng: 31.2357 } }
        }]
      }
    };
    mockGeocode.mockResolvedValue(mockResponse);

    const taskInput = { address: '123 Real Street' };
    const result = await agent.executeTask({ type: 'geocode', ...taskInput });

    expect(mockGeocode).toHaveBeenCalledTimes(1);
    expect(mockGeocode).toHaveBeenCalledWith({
      params: {
        address: '123 Real Street',
        key: mockApiKey,
      },
    });
    expect(result).toEqual({ location: mockResponse.data.results[0].geometry.location });
    expect(result.location).toHaveProperty('lat', 30.0444);
    expect(result.location).toHaveProperty('lng', 31.2357);
  });

  test('should throw error for unknown task type', async () => {
    await expect(agent.executeTask({ type: 'unknownTask' })).rejects.toThrow('Unknown task type for Navigator Agent: unknownTask');
  });

  test('should handle API errors for getDirections', async () => {
    const errorMessage = 'API rate limit exceeded';
    mockDirections.mockRejectedValue(new Error(errorMessage));

    const taskInput = { origin: 'Cairo', destination: 'Alexandria' };
    await expect(agent.executeTask({ type: 'getDirections', ...taskInput })).rejects.toThrow(errorMessage);
  });

  test('should throw error if API key is not set', async () => {
    delete process.env.GOOGLE_MAPS_API_KEY; // Unset the API key
    agent = new NavigatorAgent(); // Re-initialize to reflect missing key

    const taskInput = { origin: 'Cairo', destination: 'Alexandria' };
    await expect(agent.executeTask({ type: 'getDirections', ...taskInput })).rejects.toThrow('Google Maps API Key is not configured. Cannot make real API calls.');
  });
});
// backend/src/services/GoogleMapsService.js
const { Client } = require('@googlemaps/google-maps-services-js');
const logger = require('../utils/logger');

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!this.apiKey) {
      logger.warn('[GoogleMapsService] GOOGLE_MAPS_API_KEY is not set. Real API calls will fail.');
      this.client = null;
    } else {
      this.client = new Client({});
      logger.info('[GoogleMapsService] Initialized successfully.');
    }
  }

  _checkClient() {
    if (!this.client) {
      throw new Error('Google Maps Service is not configured. Please provide GOOGLE_MAPS_API_KEY.');
    }
  }

  async getDirections(origin, destination, mode = 'driving') {
    this._checkClient();
    try {
      const response = await this.client.directions({
        params: {
          origin,
          destination,
          mode,
          key: this.apiKey,
        },
      });
      // Return a simplified, frontend-friendly version of the response
      const route = response.data.routes[0];
      if (!route) return { summary: 'No route found.' };
      return {
        summary: route.summary,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
      };
    } catch (error) {
      logger.error('[GoogleMapsService] Error getting directions:', error.response?.data?.error_message || error.message);
      throw new Error('Failed to get directions from Google Maps API.');
    }
  }

  async findNearby(location, type, radius = 5000) {
    this._checkClient();
    try {
      const response = await this.client.placesNearby({
        params: {
          location, // Expects {lat: number, lng: number}
          type,
          radius,
          key: this.apiKey,
        },
      });
      // Return simplified results
      const results = response.data.results.map(place => ({
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating,
        placeId: place.place_id,
      }));
      return { results };
    } catch (error) {
      logger.error('[GoogleMapsService] Error finding nearby places:', error.response?.data?.error_message || error.message);
      throw new Error('Failed to find nearby places from Google Maps API.');
    }
  }

  async geocode(address) {
    this._checkClient();
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });
      if (!response.data.results || response.data.results.length === 0) {
        return { location: null, formattedAddress: 'Address not found.' };
      }
      return {
        location: response.data.results[0].geometry.location,
        formattedAddress: response.data.results[0].formatted_address,
      };
    } catch (error) {
      logger.error('[GoogleMapsService] Error geocoding address:', error.response?.data?.error_message || error.message);
      throw new Error('Failed to geocode address with Google Maps API.');
    }
  }
}

module.exports = GoogleMapsService;
import { CityService } from '../services/CityService';
import { WeatherService } from '../services/WeatherService';
import { ActivityService } from '../services/ActivityService';

// Initialize services
const cityService = new CityService();
const weatherService = new WeatherService();
const activityService = new ActivityService(weatherService);

export const resolvers = {
  Query: {
    searchCities: async (_: any, { query }: { query: string }) => {
      if (!query || query.trim().length < 2) {
        throw new Error('Query must be at least 2 characters long');
      }

      return await cityService.searchCities(query.trim());
    },

    getWeather: async (_: any, { latitude, longitude }: { latitude: number; longitude: number }) => {
      if (!cityService.validateCoordinates(latitude, longitude)) {
        throw new Error('Invalid coordinates provided');
      }

      return await weatherService.getWeather(latitude, longitude);
    },

    getActivityRecommendations: async (
      _: any,
      { latitude, longitude }: { latitude: number; longitude: number }
    ) => {
      if (!cityService.validateCoordinates(latitude, longitude)) {
        throw new Error('Invalid coordinates provided');
      }

      return await activityService.getActivityRecommendations(latitude, longitude);
    }
  }
};

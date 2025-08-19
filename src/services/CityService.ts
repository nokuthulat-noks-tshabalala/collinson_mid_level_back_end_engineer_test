import axios from 'axios';
import { City, OpenMeteoGeocodingResponse } from '../types';

export class CityService {
  private readonly geocodingBaseUrl: string;

  constructor() {
    this.geocodingBaseUrl = process.env.GEOCODING_BASE_URL || 'https://geocoding-api.open-meteo.com/v1';
  }

  async searchCities(query: string): Promise<City[]> {
    try {
      const response = await axios.get<OpenMeteoGeocodingResponse>(`${this.geocodingBaseUrl}/search`, {
        params: {
          name: query,
          count: 10,
          language: 'en',
          format: 'json'
        },
        timeout: 5000
      });

      if (!response.data.results) {
        return [];
      }

      return response.data.results
        .filter(result => result.country) // Filter out results without country (e.g., continents, regions)
        .map(result => ({
          id: result.id.toString(),
          name: result.name,
          country: result.country,
          latitude: result.latitude,
          longitude: result.longitude,
          population: result.population,
          timezone: result.timezone
        }));
    } catch (error) {
      console.error('Error searching cities:', error);
      throw new Error('Failed to search cities. Please try again later.');
    }
  }

  async getCityByCoordinates(latitude: number, longitude: number): Promise<City | null> {
    try {
      const response = await axios.get<OpenMeteoGeocodingResponse>(`${this.geocodingBaseUrl}/search`, {
        params: {
          latitude: latitude.toFixed(4),
          longitude: longitude.toFixed(4),
          count: 1,
          language: 'en',
          format: 'json'
        },
        timeout: 5000
      });

      if (!response.data.results || response.data.results.length === 0) {
        return null;
      }

      const result = response.data.results[0];
      return {
        id: result.id.toString(),
        name: result.name,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude,
        population: result.population,
        timezone: result.timezone
      };
    } catch (error) {
      console.error('Error getting city by coordinates:', error);
      return null;
    }
  }

  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }
}

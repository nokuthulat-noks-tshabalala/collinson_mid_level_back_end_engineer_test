import axios from 'axios';
import { CityService } from '../services/CityService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CityService', () => {
  let cityService: CityService;

  beforeEach(() => {
    cityService = new CityService();
    jest.clearAllMocks();
  });

  describe('searchCities', () => {
    it('should return cities when API call is successful', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              name: 'Paris',
              country: 'France',
              latitude: 48.8566,
              longitude: 2.3522,
              timezone: 'Europe/Paris',
              population: 2161000
            },
            {
              id: 2,
              name: 'Paris',
              country: 'United States',
              latitude: 33.6617,
              longitude: -95.5555,
              timezone: 'America/Chicago',
              population: 25171
            }
          ],
          generationtime_ms: 0.123
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await cityService.searchCities('Paris');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: 'Europe/Paris',
        population: 2161000
      });
      expect(result[1]).toEqual({
        id: '2',
        name: 'Paris',
        country: 'United States',
        latitude: 33.6617,
        longitude: -95.5555,
        timezone: 'America/Chicago',
        population: 25171
      });
    });

    it('should return empty array when no results found', async () => {
      const mockResponse = {
        data: {
          generationtime_ms: 0.123
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await cityService.searchCities('NonexistentCity');

      expect(result).toEqual([]);
    });

    it('should throw error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(cityService.searchCities('Paris')).rejects.toThrow(
        'Failed to search cities. Please try again later.'
      );
    });

    it('should filter out results without country field', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              name: 'Paris',
              country: 'France',
              latitude: 48.8566,
              longitude: 2.3522,
              population: 2140526,
              timezone: 'Europe/Paris'
            },
            {
              id: 2,
              name: 'South America',
              // Note: no country field (like continents in real API)
              latitude: -14.60485,
              longitude: -57.65625,
              population: 385742554,
              timezone: 'America/Recife'
            },
            {
              id: 3,
              name: 'London',
              country: 'United Kingdom',
              latitude: 51.5074,
              longitude: -0.1278,
              population: 8982000,
              timezone: 'Europe/London'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await cityService.searchCities('test');

      expect(result).toHaveLength(2); // Should exclude the result without country
      expect(result[0]).toEqual({
        id: '1',
        name: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        population: 2140526,
        timezone: 'Europe/Paris'
      });
      expect(result[1]).toEqual({
        id: '3',
        name: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        population: 8982000,
        timezone: 'Europe/London'
      });
      
      // Verify that South America (without country) was filtered out
      expect(result.some(city => city.name === 'South America')).toBe(false);
    });

    it('should call API with correct parameters', async () => {
      const mockResponse = {
        data: {
          results: [],
          generationtime_ms: 0.123
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await cityService.searchCities('London');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://geocoding-api.open-meteo.com/v1/search',
        {
          params: {
            name: 'London',
            count: 10,
            language: 'en',
            format: 'json'
          },
          timeout: 5000
        }
      );
    });
  });

  describe('getCityByCoordinates', () => {
    it('should return city when found', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              name: 'Paris',
              country: 'France',
              latitude: 48.8566,
              longitude: 2.3522,
              timezone: 'Europe/Paris',
              population: 2161000
            }
          ],
          generationtime_ms: 0.123
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await cityService.getCityByCoordinates(48.8566, 2.3522);

      expect(result).toEqual({
        id: '1',
        name: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: 'Europe/Paris',
        population: 2161000
      });
    });

    it('should return null when no city found', async () => {
      const mockResponse = {
        data: {
          results: [],
          generationtime_ms: 0.123
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await cityService.getCityByCoordinates(0, 0);

      expect(result).toBeNull();
    });

    it('should return null when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await cityService.getCityByCoordinates(48.8566, 2.3522);

      expect(result).toBeNull();
    });
  });

  describe('validateCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(cityService.validateCoordinates(48.8566, 2.3522)).toBe(true);
      expect(cityService.validateCoordinates(-90, -180)).toBe(true);
      expect(cityService.validateCoordinates(90, 180)).toBe(true);
      expect(cityService.validateCoordinates(0, 0)).toBe(true);
    });

    it('should return false for invalid latitude', () => {
      expect(cityService.validateCoordinates(91, 0)).toBe(false);
      expect(cityService.validateCoordinates(-91, 0)).toBe(false);
    });

    it('should return false for invalid longitude', () => {
      expect(cityService.validateCoordinates(0, 181)).toBe(false);
      expect(cityService.validateCoordinates(0, -181)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(cityService.validateCoordinates(NaN, 0)).toBe(false);
      expect(cityService.validateCoordinates(0, NaN)).toBe(false);
      expect(cityService.validateCoordinates('48.8566' as any, 2.3522)).toBe(false);
    });
  });
});

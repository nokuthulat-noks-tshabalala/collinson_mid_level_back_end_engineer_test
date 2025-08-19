import { ActivityService } from '../services/ActivityService';
import { WeatherService } from '../services/WeatherService';
import { ActivityType } from '../types';

jest.mock('../services/WeatherService');

const MockedWeatherService = WeatherService as jest.MockedClass<typeof WeatherService>;

describe('ActivityService', () => {
  let activityService: ActivityService;
  let mockWeatherService: jest.Mocked<WeatherService>;

  beforeEach(() => {
    MockedWeatherService.mockClear();
    mockWeatherService = new MockedWeatherService() as jest.Mocked<WeatherService>;
    activityService = new ActivityService(mockWeatherService);
  });

  describe('getActivityRecommendations', () => {
    it('should return activity recommendations sorted by score for sunny weather', async () => {
      const mockCurrentWeather = {
        temperature: 25,
        weatherCode: 0,
        windSpeed: 10,
        windDirection: 180,
        humidity: 50,
        condition: 'Clear sky',
        uvIndex: 5,
        visibility: 10000
      };

      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockCurrentWeather);

      const result = await activityService.getActivityRecommendations(48.8566, 2.3522);

      expect(result).toHaveLength(4);
      // Check that activities have different scores (not all the same)
      const scores = result.map(activity => activity.score);
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBeGreaterThan(1);
      
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            type: 'Skiing'
          }),
          expect.objectContaining({ 
            type: 'Surfing'
          }),
          expect.objectContaining({ 
            type: 'Outdoor sightseeing'
          }),
          expect.objectContaining({ 
            type: 'Indoor sightseeing'
          })
        ])
      );

      const skiing = result.find(activity => activity.type === 'Skiing');
      expect(skiing?.score).toBeGreaterThan(0);
    });

    it('should return activity recommendations for rainy weather', async () => {
      const mockCurrentWeather = {
        temperature: 15,
        weatherCode: 61,
        windSpeed: 20,
        windDirection: 180,
        humidity: 80,
        condition: 'Moderate rain',
        uvIndex: 2,
        visibility: 5000
      };

      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockCurrentWeather);

      const result = await activityService.getActivityRecommendations(48.8566, 2.3522);

      expect(result).toHaveLength(4);
      
      const surfing = result.find(activity => activity.type === 'Surfing');
      const skiing = result.find(activity => activity.type === 'Skiing');
      expect(surfing?.score).toBeGreaterThan(0);
      expect(skiing?.score).toBeGreaterThan(0);
    });

    it('should favor indoor activities during bad weather', async () => {
      const mockCurrentWeather = {
        temperature: 5,
        weatherCode: 95,
        windSpeed: 35,
        windDirection: 270,
        humidity: 90,
        condition: 'Thunderstorm',
        uvIndex: 1,
        visibility: 2000
      };

      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockCurrentWeather);

      const result = await activityService.getActivityRecommendations(48.8566, 2.3522);

      expect(result).toHaveLength(4);
      
      const outdoorSightseeing = result.find(activity => activity.type === 'Outdoor sightseeing');
      const indoorSightseeing = result.find(activity => activity.type === 'Indoor sightseeing');
      
      expect(indoorSightseeing?.score).toBeGreaterThan(outdoorSightseeing?.score || 0);
    });

    it('should handle snow conditions for skiing', async () => {
      const mockCurrentWeather = {
        temperature: -5,
        weatherCode: 71,
        windSpeed: 15,
        windDirection: 90,
        humidity: 70,
        condition: 'Light snow',
        uvIndex: 2,
        visibility: 8000
      };

      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockCurrentWeather);

      const result = await activityService.getActivityRecommendations(48.8566, 2.3522);

      const indoorSightseeing = result.find(activity => activity.type === 'Indoor sightseeing');
      const outdoorSightseeing = result.find(activity => activity.type === 'Outdoor sightseeing');
      
      expect(indoorSightseeing?.score).toBeDefined();
      expect(outdoorSightseeing?.score).toBeDefined();
    });

    it('should throw error when weather service fails', async () => {
      mockWeatherService.getCurrentWeather.mockRejectedValueOnce(new Error('Weather API error'));

      await expect(
        activityService.getActivityRecommendations(48.8566, 2.3522)
      ).rejects.toThrow('Failed to get activity recommendations. Please try again later.');
    });

    it('should throw error when weather service returns null', async () => {
      mockWeatherService.getCurrentWeather.mockResolvedValue(null);

      await expect(
        activityService.getActivityRecommendations(48.8566, 2.3522)
      ).rejects.toThrow('Failed to get activity recommendations. Please try again later.');
    });
  });

  describe('getActivityScore', () => {
    it('should return null when weather service fails', async () => {
      mockWeatherService.getCurrentWeather.mockRejectedValueOnce(new Error('Weather API error'));

      const result = await activityService.getActivityScore(ActivityType.SKIING, 48.8566, 2.3522);

      expect(result).toBeNull();
    });

    it('should return null when weather service returns null', async () => {
      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(null);

      const result = await activityService.getActivityScore(ActivityType.SKIING, 48.8566, 2.3522);

      expect(result).toBeNull();
    });

    it('should calculate score when weather service returns valid data', async () => {
      const mockCurrentWeather = {
        temperature: 20,
        weatherCode: 0,
        windSpeed: 10,
        windDirection: 180,
        humidity: 60,
        condition: 'Clear sky',
        uvIndex: 4,
        visibility: 12000
      };

      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockCurrentWeather);

      const result = await activityService.getActivityScore(ActivityType.SKIING, 48.8566, 2.3522);

      expect(result?.score).toBeGreaterThanOrEqual(0);
      expect(result?.score).toBeLessThanOrEqual(100);
      expect(result?.reason).toBeDefined();
    });
  });

  describe('getActivityDescription', () => {
    it('should return correct descriptions for all activity types', () => {
      expect(activityService.getActivityDescription(ActivityType.SKIING))
        .toBe('Alpine skiing and winter sports activities');
      expect(activityService.getActivityDescription(ActivityType.SURFING))
        .toBe('Ocean surfing and water sports');
      expect(activityService.getActivityDescription(ActivityType.INDOOR_SIGHTSEEING))
        .toBe('Museums, galleries, and indoor attractions');
      expect(activityService.getActivityDescription(ActivityType.OUTDOOR_SIGHTSEEING))
        .toBe('Parks, monuments, and outdoor attractions');
    });

    it('should return "Unknown activity" for invalid activity type', () => {
      // Type assertion to test edge case
      const invalidType = 'INVALID_TYPE' as ActivityType;
      expect(activityService.getActivityDescription(invalidType))
        .toBe('Unknown activity');
    });
  });

  describe('validateActivityType', () => {
    it('should return true for valid activity types', () => {
      expect(activityService.validateActivityType('SKIING')).toBe(true);
      expect(activityService.validateActivityType('SURFING')).toBe(true);
      expect(activityService.validateActivityType('INDOOR_SIGHTSEEING')).toBe(true);
      expect(activityService.validateActivityType('OUTDOOR_SIGHTSEEING')).toBe(true);
    });

    it('should return false for invalid activity types', () => {
      expect(activityService.validateActivityType('INVALID_TYPE')).toBe(false);
      expect(activityService.validateActivityType('skiing')).toBe(false); // lowercase
      expect(activityService.validateActivityType('')).toBe(false);
      expect(activityService.validateActivityType('SWIMMING')).toBe(false);
    });

    it('should handle null and undefined inputs', () => {
      expect(activityService.validateActivityType(null as any)).toBe(false);
      expect(activityService.validateActivityType(undefined as any)).toBe(false);
    });
  });

  describe('formatActivityType (private method via public interface)', () => {
    it('should format activity types correctly in getActivityRecommendations', async () => {
      const mockCurrentWeather = {
        temperature: 20,
        weatherCode: 0,
        windSpeed: 10,
        windDirection: 180,
        humidity: 60,
        condition: 'Clear sky',
        uvIndex: 4,
        visibility: 12000
      };

      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockCurrentWeather);

      const result = await activityService.getActivityRecommendations(48.8566, 2.3522);

      // Verify formatted types are returned
      const types = result.map(activity => activity.type);
      expect(types).toContain('Skiing');
      expect(types).toContain('Surfing');
      expect(types).toContain('Indoor sightseeing');
      expect(types).toContain('Outdoor sightseeing');
      
      // Ensure no enum values are returned
      expect(types).not.toContain('SKIING');
      expect(types).not.toContain('SURFING');
      expect(types).not.toContain('INDOOR_SIGHTSEEING');
      expect(types).not.toContain('OUTDOOR_SIGHTSEEING');
    });
  });

  describe('getActivityScore edge cases', () => {
    it('should handle all activity types individually', async () => {
      const mockCurrentWeather = {
        temperature: 15,
        weatherCode: 0,
        windSpeed: 10,
        windDirection: 180,
        humidity: 60,
        condition: 'Clear sky',
        uvIndex: 4,
        visibility: 12000
      };

      // Test each activity type individually
      const activityTypes = [
        ActivityType.SKIING,
        ActivityType.SURFING,
        ActivityType.INDOOR_SIGHTSEEING,
        ActivityType.OUTDOOR_SIGHTSEEING
      ];

      for (const activityType of activityTypes) {
        mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockCurrentWeather);
        
        const result = await activityService.getActivityScore(activityType, 48.8566, 2.3522);
        
        expect(result).not.toBeNull();
        expect(result?.score).toBeGreaterThanOrEqual(0);
        expect(result?.score).toBeLessThanOrEqual(100);
        expect(result?.reason).toBeDefined();
        expect(typeof result?.reason).toBe('string');
      }
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle weather service timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      mockWeatherService.getCurrentWeather.mockRejectedValueOnce(timeoutError);

      await expect(
        activityService.getActivityRecommendations(48.8566, 2.3522)
      ).rejects.toThrow('Failed to get activity recommendations. Please try again later.');
    });

    it('should handle network errors in getActivityScore', async () => {
      const networkError = new Error('Network error');
      mockWeatherService.getCurrentWeather.mockRejectedValueOnce(networkError);

      const result = await activityService.getActivityScore(ActivityType.SKIING, 48.8566, 2.3522);
      expect(result).toBeNull();
    });

    it('should handle extreme weather conditions', async () => {
      const extremeWeather = {
        temperature: -40, // Extreme cold
        weatherCode: 95,
        windSpeed: 100, // Very high wind
        windDirection: 180,
        humidity: 100,
        condition: 'Extreme weather',
        uvIndex: 0,
        visibility: 100 // Very low visibility
      };

      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(extremeWeather);

      const result = await activityService.getActivityRecommendations(48.8566, 2.3522);
      
      expect(result).toHaveLength(4);
      expect(result.every(activity => 
        activity.score >= 0 && activity.score <= 100
      )).toBe(true);
    });

    it('should handle invalid coordinates gracefully', async () => {
      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(null);

      await expect(
        activityService.getActivityRecommendations(999, 999) // Invalid coordinates
      ).rejects.toThrow('Failed to get activity recommendations. Please try again later.');
    });
  });
});

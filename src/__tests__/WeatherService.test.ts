import axios from 'axios';
import { WeatherService } from '../services/WeatherService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let weatherService: WeatherService;

  beforeEach(() => {
    weatherService = new WeatherService();
    jest.clearAllMocks();
  });

  describe('getWeather', () => {
    it('should return weather data when API call is successful', async () => {
      const mockResponse = {
        data: {
          latitude: 48.8566,
          longitude: 2.3522,
          generationtime_ms: 0.5,
          utc_offset_seconds: 3600,
          timezone: 'Europe/Paris',
          timezone_abbreviation: 'CET',
          elevation: 42,
          current_units: {
            time: 'iso8601',
            interval: 'seconds',
            temperature_2m: '°C',
            relative_humidity_2m: '%',
            wind_speed_10m: 'km/h',
            wind_direction_10m: '°',
            weather_code: 'wmo code',
            uv_index: '',
            visibility: 'm'
          },
          current: {
            time: '2024-01-15T12:00',
            interval: 900,
            temperature_2m: 15.2,
            relative_humidity_2m: 65,
            wind_speed_10m: 12.5,
            wind_direction_10m: 180,
            weather_code: 0,
            uv_index: 3.5,
            visibility: 10000
          },
          daily_units: {
            time: 'iso8601',
            weather_code: 'wmo code',
            temperature_2m_max: '°C',
            temperature_2m_min: '°C',
            precipitation_probability_max: '%',
            wind_speed_10m_max: 'km/h',
            relative_humidity_2m_max: '%'
          },
          daily: {
            time: ['2024-01-15', '2024-01-16', '2024-01-17'],
            weather_code: [0, 1, 2],
            temperature_2m_max: [18.5, 20.1, 16.8],
            temperature_2m_min: [8.2, 10.5, 7.9],
            precipitation_probability_max: [0, 10, 30],
            wind_speed_10m_max: [15.2, 18.0, 22.1],
            relative_humidity_2m_max: [70, 75, 80]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherService.getWeather(48.8566, 2.3522);

      expect(result).toBeDefined();
      expect(result!.current).toEqual({
        temperature: 15.2,
        humidity: 65,
        windSpeed: 12.5,
        windDirection: 180,
        condition: 'Clear sky',
        uvIndex: 3.5,
        visibility: 10000
      });
      expect(result!.forecast).toHaveLength(3);
      expect(result!.forecast[0]).toEqual({
        date: '2024-01-15',
        maxTemperature: 18.5,
        minTemperature: 8.2,
        condition: 'Clear sky',
        precipitationProbability: 0,
        windSpeed: 15.2,
        humidity: 70
      });
    });

    it('should throw error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(weatherService.getWeather(48.8566, 2.3522)).rejects.toThrow(
        'Failed to fetch weather data. Please try again later.'
      );
    });

    it('should call API with correct parameters', async () => {
      const mockResponse = {
        data: {
          current: {
            temperature_2m: 15,
            relative_humidity_2m: 65,
            wind_speed_10m: 12,
            wind_direction_10m: 180,
            weather_code: 0,
            uv_index: 3,
            visibility: 10000
          },
          daily: {
            time: ['2024-01-15'],
            weather_code: [0],
            temperature_2m_max: [18],
            temperature_2m_min: [8],
            precipitation_probability_max: [0],
            wind_speed_10m_max: [15],
            relative_humidity_2m_max: [70]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await weatherService.getWeather(48.8566, 2.3522);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.open-meteo.com/v1/forecast',
        {
          params: {
            latitude: '48.8566',
            longitude: '2.3522',
            current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index,visibility',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_max',
            timezone: 'auto',
            forecast_days: 7
          },
          timeout: 5000
        }
      );
    });
  });

  describe('getCurrentWeather', () => {
    it('should return current weather data when API call is successful', async () => {
      const mockResponse = {
        data: {
          current: {
            temperature_2m: 20.5,
            relative_humidity_2m: 60,
            wind_speed_10m: 8.2,
            wind_direction_10m: 270,
            weather_code: 1,
            uv_index: 5.0,
            visibility: 15000
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherService.getCurrentWeather(48.8566, 2.3522);

      expect(result).toEqual({
        temperature: 20.5,
        humidity: 60,
        windSpeed: 8.2,
        windDirection: 270,
        condition: 'Mainly clear',
        uvIndex: 5.0,
        visibility: 15000
      });
    });

    it('should throw error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(weatherService.getCurrentWeather(48.8566, 2.3522)).rejects.toThrow(
        'Failed to fetch current weather data. Please try again later.'
      );
    });

    it('should call API with correct parameters for current weather only', async () => {
      const mockResponse = {
        data: {
          current: {
            temperature_2m: 20,
            relative_humidity_2m: 60,
            wind_speed_10m: 8,
            wind_direction_10m: 270,
            weather_code: 1,
            uv_index: 5,
            visibility: 15000
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await weatherService.getCurrentWeather(48.8566, 2.3522);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.open-meteo.com/v1/forecast',
        {
          params: {
            latitude: '48.8566',
            longitude: '2.3522',
            current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index,visibility',
            timezone: 'auto'
          },
          timeout: 5000
        }
      );
    });
  });

  describe('Environment variable configuration', () => {
    it('should use custom base URL when OPENMETEO_BASE_URL is set', () => {
      const originalEnv = process.env.OPENMETEO_BASE_URL;
      process.env.OPENMETEO_BASE_URL = 'https://custom-api.example.com/v1';
      
      const customWeatherService = new WeatherService();
      
      expect(customWeatherService['baseUrl']).toBe('https://custom-api.example.com/v1');
      
      // Restore original environment
      if (originalEnv) {
        process.env.OPENMETEO_BASE_URL = originalEnv;
      } else {
        delete process.env.OPENMETEO_BASE_URL;
      }
    });

    it('should use default base URL when OPENMETEO_BASE_URL is not set', () => {
      const originalEnv = process.env.OPENMETEO_BASE_URL;
      delete process.env.OPENMETEO_BASE_URL;
      
      const defaultWeatherService = new WeatherService();
      
      expect(defaultWeatherService['baseUrl']).toBe('https://api.open-meteo.com/v1');
      
      // Restore original environment
      if (originalEnv) {
        process.env.OPENMETEO_BASE_URL = originalEnv;
      }
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle API response without daily data in getWeather', async () => {
      const mockResponseWithoutDaily = {
        data: {
          current: {
            temperature_2m: 15.2,
            relative_humidity_2m: 65,
            wind_speed_10m: 12.5,
            wind_direction_10m: 180,
            weather_code: 0,
            uv_index: 3.5,
            visibility: 10000
          }
          // No daily property
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponseWithoutDaily);

      const result = await weatherService.getWeather(48.8566, 2.3522);

      expect(result).toBeDefined();
      expect(result!.current).toBeDefined();
      expect(result!.forecast).toEqual([]);
    });

    it('should handle daily data with more than 7 days in getWeather', async () => {
      const mockResponseWith10Days = {
        data: {
          current: {
            temperature_2m: 15.2,
            relative_humidity_2m: 65,
            wind_speed_10m: 12.5,
            wind_direction_10m: 180,
            weather_code: 0,
            uv_index: 3.5,
            visibility: 10000
          },
          daily: {
            time: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-20', '2024-01-21', '2024-01-22', '2024-01-23', '2024-01-24'],
            weather_code: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
            temperature_2m_max: [18.5, 20.1, 16.8, 22.3, 19.1, 17.5, 21.2, 23.8, 18.9, 16.7],
            temperature_2m_min: [8.2, 10.5, 7.9, 12.1, 9.8, 6.5, 11.3, 14.2, 8.7, 7.1],
            precipitation_probability_max: [0, 10, 30, 50, 20, 40, 15, 5, 25, 35],
            wind_speed_10m_max: [15.2, 18.0, 22.1, 25.5, 17.8, 20.3, 16.9, 14.7, 19.6, 21.4],
            relative_humidity_2m_max: [70, 75, 80, 85, 72, 78, 74, 68, 76, 82]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponseWith10Days);

      const result = await weatherService.getWeather(48.8566, 2.3522);

      expect(result).toBeDefined();
      expect(result!.forecast).toHaveLength(7); // Should be limited to 7 days
      expect(result!.forecast[0].date).toBe('2024-01-15');
      expect(result!.forecast[6].date).toBe('2024-01-21');
    });

    it('should handle extreme coordinate values', async () => {
      const mockResponse = {
        data: {
          current: {
            temperature_2m: -40.5,
            relative_humidity_2m: 95,
            wind_speed_10m: 120.0,
            wind_direction_10m: 359,
            weather_code: 95,
            uv_index: 0.0,
            visibility: 50
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Test extreme coordinates (North Pole and close to International Date Line)
      const result = await weatherService.getCurrentWeather(89.9999, 179.9999);

      expect(result).toEqual({
        temperature: -40.5,
        humidity: 95,
        windSpeed: 120.0,
        windDirection: 359,
        condition: 'Thunderstorm',
        uvIndex: 0.0,
        visibility: 50
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.open-meteo.com/v1/forecast',
        expect.objectContaining({
          params: expect.objectContaining({
            latitude: '89.9999',
            longitude: '179.9999'
          })
        })
      );
    });

    it('should handle negative coordinates', async () => {
      const mockResponse = {
        data: {
          current: {
            temperature_2m: 25.0,
            relative_humidity_2m: 45,
            wind_speed_10m: 5.5,
            wind_direction_10m: 90,
            weather_code: 0,
            uv_index: 8.5,
            visibility: 25000
          },
          daily: {
            time: ['2024-01-15'],
            weather_code: [0],
            temperature_2m_max: [30],
            temperature_2m_min: [18],
            precipitation_probability_max: [5],
            wind_speed_10m_max: [8],
            relative_humidity_2m_max: [50]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Test negative coordinates (Southern Hemisphere)
      const result = await weatherService.getWeather(-33.8688, -151.2093);

      expect(result).toBeDefined();
      expect(result!.current.temperature).toBe(25.0);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.open-meteo.com/v1/forecast',
        expect.objectContaining({
          params: expect.objectContaining({
            latitude: '-33.8688',
            longitude: '-151.2093'
          })
        })
      );
    });

    it('should handle timeout errors specifically', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      timeoutError.name = 'AxiosError';
      mockedAxios.get.mockRejectedValueOnce(timeoutError);

      await expect(weatherService.getWeather(48.8566, 2.3522)).rejects.toThrow(
        'Failed to fetch weather data. Please try again later.'
      );
    });

    it('should handle HTTP error responses', async () => {
      const httpError = {
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { error: 'Invalid coordinates' }
        }
      };
      mockedAxios.get.mockRejectedValueOnce(httpError);

      await expect(weatherService.getCurrentWeather(999, 999)).rejects.toThrow(
        'Failed to fetch current weather data. Please try again later.'
      );
    });

    it('should handle malformed API response data', async () => {
      const malformedResponse = {
        data: {
          current: {
            temperature_2m: null,
            relative_humidity_2m: undefined,
            wind_speed_10m: 'invalid',
            wind_direction_10m: 180,
            weather_code: 0,
            uv_index: 3.5,
            visibility: 10000
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(malformedResponse);

      const result = await weatherService.getCurrentWeather(48.8566, 2.3522);

      expect(result).toBeDefined();
      // Should handle null/undefined values gracefully
      expect(result!.temperature).toBeNull();
      expect(result!.humidity).toBeUndefined();
      expect(result!.windSpeed).toBe('invalid');
    });

    it('should handle empty daily arrays', async () => {
      const mockResponseWithEmptyDaily = {
        data: {
          current: {
            temperature_2m: 15.2,
            relative_humidity_2m: 65,
            wind_speed_10m: 12.5,
            wind_direction_10m: 180,
            weather_code: 0,
            uv_index: 3.5,
            visibility: 10000
          },
          daily: {
            time: [],
            weather_code: [],
            temperature_2m_max: [],
            temperature_2m_min: [],
            precipitation_probability_max: [],
            wind_speed_10m_max: [],
            relative_humidity_2m_max: []
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponseWithEmptyDaily);

      const result = await weatherService.getWeather(48.8566, 2.3522);

      expect(result).toBeDefined();
      expect(result!.current).toBeDefined();
      expect(result!.forecast).toEqual([]);
    });
  });

  describe('Coordinate precision', () => {
    it('should format coordinates to 4 decimal places', async () => {
      const mockResponse = {
        data: {
          current: {
            temperature_2m: 20,
            relative_humidity_2m: 60,
            wind_speed_10m: 8,
            wind_direction_10m: 270,
            weather_code: 1,
            uv_index: 5,
            visibility: 15000
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Test with coordinates that need rounding
      await weatherService.getCurrentWeather(48.85661234567, 2.35221234567);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.open-meteo.com/v1/forecast',
        expect.objectContaining({
          params: expect.objectContaining({
            latitude: '48.8566',
            longitude: '2.3522'
          })
        })
      );
    });
  });
});

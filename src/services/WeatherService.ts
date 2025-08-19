import axios from 'axios';
import { Weather, CurrentWeather, WeatherForecast, OpenMeteoWeatherResponse } from '../types';
import { weatherCodeToCondition } from '../utils/weatherUtils';

export class WeatherService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OPENMETEO_BASE_URL || 'https://api.open-meteo.com/v1';
  }

  async getWeather(latitude: number, longitude: number): Promise<Weather | null> {
    try {
      const response = await axios.get<OpenMeteoWeatherResponse>(`${this.baseUrl}/forecast`, {
        params: {
          latitude: latitude.toFixed(4),
          longitude: longitude.toFixed(4),
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'wind_speed_10m',
            'wind_direction_10m',
            'weather_code',
            'uv_index',
            'visibility'
          ].join(','),
          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_probability_max',
            'wind_speed_10m_max',
            'relative_humidity_2m_max'
          ].join(','),
          timezone: 'auto',
          forecast_days: 7
        },
        timeout: 5000
      });

      const { current, daily } = response.data;

      // Parse current weather
      const currentWeather: CurrentWeather = {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        condition: weatherCodeToCondition(current.weather_code),
        uvIndex: current.uv_index,
        visibility: current.visibility
      };

      // Parse forecast
      const forecast: WeatherForecast[] = [];
      if (daily) {
        for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
          forecast.push({
            date: daily.time[i],
            maxTemperature: daily.temperature_2m_max[i],
            minTemperature: daily.temperature_2m_min[i],
            condition: weatherCodeToCondition(daily.weather_code[i]),
            precipitationProbability: daily.precipitation_probability_max[i],
            windSpeed: daily.wind_speed_10m_max[i],
            humidity: daily.relative_humidity_2m_max[i]
          });
        }
      }

      return {
        current: currentWeather,
        forecast
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data. Please try again later.');
    }
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeather | null> {
    try {
      const response = await axios.get<OpenMeteoWeatherResponse>(`${this.baseUrl}/forecast`, {
        params: {
          latitude: latitude.toFixed(4),
          longitude: longitude.toFixed(4),
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'wind_speed_10m',
            'wind_direction_10m',
            'weather_code',
            'uv_index',
            'visibility'
          ].join(','),
          timezone: 'auto'
        },
        timeout: 5000
      });

      const { current } = response.data;

      return {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        condition: weatherCodeToCondition(current.weather_code),
        uvIndex: current.uv_index,
        visibility: current.visibility
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch current weather data. Please try again later.');
    }
  }
}

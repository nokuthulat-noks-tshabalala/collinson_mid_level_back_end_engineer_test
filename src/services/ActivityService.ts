import { Activity, ActivityType, CurrentWeather } from '../types';
import { calculateActivityScore } from '../utils/weatherUtils';
import { WeatherService } from './WeatherService';

export class ActivityService {
  private weatherService: WeatherService;

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

  private formatActivityType(activityType: ActivityType): string {
    const formatMap = {
      [ActivityType.SKIING]: 'Skiing',
      [ActivityType.SURFING]: 'Surfing',
      [ActivityType.INDOOR_SIGHTSEEING]: 'Indoor sightseeing',
      [ActivityType.OUTDOOR_SIGHTSEEING]: 'Outdoor sightseeing'
    };
    
    return formatMap[activityType] || activityType;
  }

  async getActivityRecommendations(latitude: number, longitude: number): Promise<Activity[]> {
    try {
      const currentWeather = await this.weatherService.getCurrentWeather(latitude, longitude);
      
      if (!currentWeather) {
        throw new Error('Unable to fetch weather data for activity recommendations');
      }

      const activities: Activity[] = [];
      const activityTypes = Object.values(ActivityType);

      for (const activityType of activityTypes) {
        const { score, reason } = calculateActivityScore(activityType, {
          temperature: currentWeather.temperature,
          condition: currentWeather.condition,
          windSpeed: currentWeather.windSpeed,
          visibility: currentWeather.visibility
        });

        activities.push({
          type: this.formatActivityType(activityType),
          score,
          reason
        });
      }

      // Sort activities by score in descending order
      return activities.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error getting activity recommendations:', error);
      throw new Error('Failed to get activity recommendations. Please try again later.');
    }
  }

  async getActivityScore(
    activityType: ActivityType,
    latitude: number,
    longitude: number
  ): Promise<{ score: number; reason: string } | null> {
    try {
      const currentWeather = await this.weatherService.getCurrentWeather(latitude, longitude);
      
      if (!currentWeather) {
        return null;
      }

      return calculateActivityScore(activityType, {
        temperature: currentWeather.temperature,
        condition: currentWeather.condition,
        windSpeed: currentWeather.windSpeed,
        visibility: currentWeather.visibility
      });
    } catch (error) {
      console.error('Error calculating activity score:', error);
      return null;
    }
  }

  getActivityDescription(activityType: ActivityType): string {
    const descriptions = {
      [ActivityType.SKIING]: 'Alpine skiing and winter sports activities',
      [ActivityType.SURFING]: 'Ocean surfing and water sports',
      [ActivityType.INDOOR_SIGHTSEEING]: 'Museums, galleries, and indoor attractions',
      [ActivityType.OUTDOOR_SIGHTSEEING]: 'Parks, monuments, and outdoor attractions'
    };

    return descriptions[activityType] || 'Unknown activity';
  }

  validateActivityType(activityType: string): activityType is ActivityType {
    return Object.values(ActivityType).includes(activityType as ActivityType);
  }
}

export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  condition: string;
  uvIndex: number;
  visibility: number;
}

export interface WeatherForecast {
  date: string;
  maxTemperature: number;
  minTemperature: number;
  condition: string;
  precipitationProbability: number;
  windSpeed: number;
  humidity: number;
}

export interface Weather {
  current: CurrentWeather;
  forecast: WeatherForecast[];
}

export enum ActivityType {
  SKIING = 'SKIING',
  SURFING = 'SURFING',
  INDOOR_SIGHTSEEING = 'INDOOR_SIGHTSEEING',
  OUTDOOR_SIGHTSEEING = 'OUTDOOR_SIGHTSEEING'
}

export interface Activity {
  type: string;
  score: number;
  reason: string;
}

export interface ActivityRecommendation {
  activities: Activity[];
  basedOnWeather: CurrentWeather;
}

// OpenMeteo API response types
export interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    feature_code: string;
    country_code: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
    admin4?: string;
    timezone: string;
    population?: number;
    country: string;
  }>;
  generationtime_ms: number;
}

export interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    weather_code: string;
    uv_index: string;
    visibility: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    uv_index: number;
    visibility: number;
  };
  daily_units?: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_probability_max: string;
    wind_speed_10m_max: string;
    relative_humidity_2m_max: string;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    relative_humidity_2m_max: number[];
  };
}

export interface GraphQLContext {
  // Add any context properties here
  dataSources?: {
    weatherService: any;
    cityService: any;
    activityService: any;
  };
}

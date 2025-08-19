// Weather code mapping based on WMO Weather interpretation codes
// https://open-meteo.com/en/docs
export const weatherCodeToCondition = (code: number): string => {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };

  return weatherCodes[code] || 'Unknown';
};

export const isGoodSkiingWeather = (weather: {
  temperature: number;
  condition: string;
  windSpeed: number;
}): boolean => {
  const { temperature, condition, windSpeed } = weather;
  
  // Good skiing conditions: cold temperature, snow or clear weather, moderate winds
  const isSnowing = condition.toLowerCase().includes('snow');
  const isClear = condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('partly');
  const isCold = temperature <= 0; // Below freezing
  const isWindNotTooStrong = windSpeed <= 30; // km/h
  
  return isCold && (isSnowing || isClear) && isWindNotTooStrong;
};

export const isGoodSurfingWeather = (weather: {
  temperature: number;
  condition: string;
  windSpeed: number;
}): boolean => {
  const { temperature, condition, windSpeed } = weather;
  
  // Good surfing conditions: warm temperature, not too windy, clear or partly cloudy
  const isWarm = temperature >= 15; // Celsius
  const isNotRainy = !condition.toLowerCase().includes('rain') && !condition.toLowerCase().includes('storm');
  const isWindModerate = windSpeed <= 25; // km/h
  
  return isWarm && isNotRainy && isWindModerate;
};

export const isGoodOutdoorSightseeingWeather = (weather: {
  temperature: number;
  condition: string;
  windSpeed: number;
  visibility: number;
}): boolean => {
  const { temperature, condition, windSpeed, visibility } = weather;
  
  // Good outdoor sightseeing: comfortable temperature, clear visibility, not rainy
  const isComfortableTemp = temperature >= 5 && temperature <= 30;
  const isNotRainy = !condition.toLowerCase().includes('rain') && !condition.toLowerCase().includes('storm');
  const isNotTooWindy = windSpeed <= 40;
  const hasGoodVisibility = visibility >= 5000; // meters
  
  return isComfortableTemp && isNotRainy && isNotTooWindy && hasGoodVisibility;
};

export const isGoodIndoorSightseeingWeather = (weather: {
  temperature: number;
  condition: string;
  windSpeed: number;
}): boolean => {
  // Indoor sightseeing is good when outdoor conditions are poor
  return !isGoodOutdoorSightseeingWeather({ ...weather, visibility: 10000 });
};

export const calculateActivityScore = (
  activityType: string,
  weather: {
    temperature: number;
    condition: string;
    windSpeed: number;
    visibility: number;
  }
): { score: number; reason: string } => {
  const { temperature, condition, windSpeed, visibility } = weather;
  
  switch (activityType) {
    case 'SKIING':
      if (isGoodSkiingWeather(weather)) {
        let score = 80;
        if (condition.toLowerCase().includes('snow')) score += 15;
        if (temperature <= -5) score += 5;
        return { score: Math.min(score, 100), reason: 'Excellent skiing conditions with cold temperature and good weather' };
      } else if (temperature <= 5) {
        return { score: 40, reason: 'Decent skiing conditions but may lack snow or have strong winds' };
      } else {
        return { score: 10, reason: 'Poor skiing conditions - too warm or unsuitable weather' };
      }
      
    case 'SURFING':
      if (isGoodSurfingWeather(weather)) {
        let score = 75;
        if (temperature >= 20) score += 10;
        if (condition.toLowerCase().includes('clear')) score += 10;
        if (windSpeed >= 10 && windSpeed <= 20) score += 5; // Some wind is good for surfing
        return { score: Math.min(score, 100), reason: 'Great surfing conditions with warm weather and good winds' };
      } else if (temperature >= 10 && !condition.toLowerCase().includes('storm')) {
        return { score: 45, reason: 'Moderate surfing conditions - weather is acceptable but not ideal' };
      } else {
        return { score: 15, reason: 'Poor surfing conditions - too cold, stormy, or windy' };
      }
      
    case 'OUTDOOR_SIGHTSEEING':
      if (isGoodOutdoorSightseeingWeather(weather)) {
        let score = 85;
        if (temperature >= 15 && temperature <= 25) score += 10;
        if (condition.toLowerCase().includes('clear')) score += 5;
        return { score: Math.min(score, 100), reason: 'Perfect outdoor sightseeing weather with clear visibility and comfortable temperature' };
      } else if (temperature >= 0 && temperature <= 35 && visibility >= 1000) {
        return { score: 50, reason: 'Acceptable outdoor sightseeing conditions but weather could be better' };
      } else {
        return { score: 20, reason: 'Poor outdoor sightseeing conditions - bad weather or low visibility' };
      }
      
    case 'INDOOR_SIGHTSEEING':
      if (isGoodIndoorSightseeingWeather(weather)) {
        let score = 85;
        if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm')) score += 10;
        if (temperature < 0 || temperature > 35) score += 5;
        return { score: Math.min(score, 100), reason: 'Perfect indoor sightseeing weather - outdoor conditions encourage staying inside' };
      } else {
        return { score: 30, reason: 'Indoor sightseeing is always an option, but outdoor weather is quite pleasant' };
      }
      
    default:
      return { score: 0, reason: 'Unknown activity type' };
  }
};

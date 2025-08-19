import { 
  weatherCodeToCondition, 
  calculateActivityScore,
  isGoodSkiingWeather,
  isGoodSurfingWeather,
  isGoodOutdoorSightseeingWeather,
} from '../utils/weatherUtils';

describe('Weather Utils', () => {
  describe('weatherCodeToCondition', () => {
    it('should return correct condition for clear sky', () => {
      expect(weatherCodeToCondition(0)).toBe('Clear sky');
    });

    it('should return correct condition for snow', () => {
      expect(weatherCodeToCondition(71)).toBe('Slight snow fall');
      expect(weatherCodeToCondition(73)).toBe('Moderate snow fall');
      expect(weatherCodeToCondition(75)).toBe('Heavy snow fall');
    });

    it('should return correct condition for rain', () => {
      expect(weatherCodeToCondition(61)).toBe('Slight rain');
      expect(weatherCodeToCondition(63)).toBe('Moderate rain');
      expect(weatherCodeToCondition(65)).toBe('Heavy rain');
    });

    it('should return "Unknown" for invalid weather code', () => {
      expect(weatherCodeToCondition(999)).toBe('Unknown');
    });
  });

  describe('isGoodSkiingWeather', () => {
    it('should return true for ideal skiing conditions', () => {
      const weather = {
        temperature: -5,
        condition: 'Slight snow fall',
        windSpeed: 15
      };
      expect(isGoodSkiingWeather(weather)).toBe(true);
    });

    it('should return true for cold clear weather', () => {
      const weather = {
        temperature: -2,
        condition: 'Clear sky',
        windSpeed: 10
      };
      expect(isGoodSkiingWeather(weather)).toBe(true);
    });

    it('should return false for warm weather', () => {
      const weather = {
        temperature: 10,
        condition: 'Clear sky',
        windSpeed: 10
      };
      expect(isGoodSkiingWeather(weather)).toBe(false);
    });

    it('should return false for very windy conditions', () => {
      const weather = {
        temperature: -5,
        condition: 'Clear sky',
        windSpeed: 40
      };
      expect(isGoodSkiingWeather(weather)).toBe(false);
    });
  });

  describe('isGoodSurfingWeather', () => {
    it('should return true for ideal surfing conditions', () => {
      const weather = {
        temperature: 22,
        condition: 'Clear sky',
        windSpeed: 15
      };
      expect(isGoodSurfingWeather(weather)).toBe(true);
    });

    it('should return false for cold weather', () => {
      const weather = {
        temperature: 10,
        condition: 'Clear sky',
        windSpeed: 15
      };
      expect(isGoodSurfingWeather(weather)).toBe(false);
    });

    it('should return false for rainy conditions', () => {
      const weather = {
        temperature: 20,
        condition: 'Heavy rain',
        windSpeed: 15
      };
      expect(isGoodSurfingWeather(weather)).toBe(false);
    });

    it('should return false for very windy conditions', () => {
      const weather = {
        temperature: 22,
        condition: 'Clear sky',
        windSpeed: 35
      };
      expect(isGoodSurfingWeather(weather)).toBe(false);
    });
  });

  describe('isGoodOutdoorSightseeingWeather', () => {
    it('should return true for ideal outdoor conditions', () => {
      const weather = {
        temperature: 20,
        condition: 'Clear sky',
        windSpeed: 10,
        visibility: 10000
      };
      expect(isGoodOutdoorSightseeingWeather(weather)).toBe(true);
    });

    it('should return false for rainy weather', () => {
      const weather = {
        temperature: 20,
        condition: 'Heavy rain',
        windSpeed: 10,
        visibility: 10000
      };
      expect(isGoodOutdoorSightseeingWeather(weather)).toBe(false);
    });

    it('should return false for poor visibility', () => {
      const weather = {
        temperature: 20,
        condition: 'Clear sky',
        windSpeed: 10,
        visibility: 1000
      };
      expect(isGoodOutdoorSightseeingWeather(weather)).toBe(false);
    });

    it('should return false for extreme temperatures', () => {
      const weather = {
        temperature: 40,
        condition: 'Clear sky',
        windSpeed: 10,
        visibility: 10000
      };
      expect(isGoodOutdoorSightseeingWeather(weather)).toBe(false);
    });
  });

  describe('calculateActivityScore', () => {
    it('should give high score for skiing in ideal conditions', () => {
      const weather = {
        temperature: -5,
        condition: 'Slight snow fall',
        windSpeed: 15,
        visibility: 10000
      };
      const result = calculateActivityScore('SKIING', weather);
      expect(result.score).toBeGreaterThan(90);
      expect(result.reason).toContain('Excellent skiing conditions');
    });

    it('should give high score for surfing in ideal conditions', () => {
      const weather = {
        temperature: 25,
        condition: 'Clear sky',
        windSpeed: 15,
        visibility: 10000
      };
      const result = calculateActivityScore('SURFING', weather);
      expect(result.score).toBeGreaterThan(85);
      expect(result.reason).toContain('Great surfing conditions');
    });

    it('should give high score for outdoor sightseeing in good conditions', () => {
      const weather = {
        temperature: 22,
        condition: 'Clear sky',
        windSpeed: 10,
        visibility: 15000
      };
      const result = calculateActivityScore('OUTDOOR_SIGHTSEEING', weather);
      expect(result.score).toBeGreaterThan(90);
      expect(result.reason).toContain('Perfect outdoor sightseeing');
    });

    it('should give high score for indoor sightseeing in bad weather', () => {
      const weather = {
        temperature: 2,
        condition: 'Heavy rain',
        windSpeed: 30,
        visibility: 1000
      };
      const result = calculateActivityScore('INDOOR_SIGHTSEEING', weather);
      expect(result.score).toBeGreaterThan(85);
      expect(result.reason).toContain('Perfect indoor sightseeing');
    });

    it('should return zero score for unknown activity type', () => {
      const weather = {
        temperature: 20,
        condition: 'Clear sky',
        windSpeed: 10,
        visibility: 10000
      };
      const result = calculateActivityScore('UNKNOWN_ACTIVITY', weather);
      expect(result.score).toBe(0);
      expect(result.reason).toBe('Unknown activity type');
    });
  });
});

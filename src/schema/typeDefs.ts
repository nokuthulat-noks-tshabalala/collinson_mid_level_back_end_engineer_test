import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  """
  Activity types supported by the travel planning API.
  Used to categorize different types of travel activities.
  """
  enum ActivityType {
    """Snow sports and winter activities - best in cold, snowy conditions"""
    SKIING
    """Water sports and ocean activities - best in warm, calm weather"""
    SURFING
    """Museums, galleries, shopping - ideal during poor outdoor weather"""
    INDOOR_SIGHTSEEING
    """Parks, monuments, walking tours - best in clear, pleasant weather"""
    OUTDOOR_SIGHTSEEING
  }

  """
  Geographic city information with coordinates and metadata.
  Used for location-based weather and activity recommendations.
  """
  type City {
    """Unique identifier for the city"""
    id: ID!
    """City name in English"""
    name: String!
    """Country name where the city is located"""
    country: String!
    """Geographic latitude in decimal degrees (-90 to 90)"""
    latitude: Float!
    """Geographic longitude in decimal degrees (-180 to 180)"""
    longitude: Float!
    """City population count (may be null for smaller locations)"""
    population: Int
    """Timezone identifier (e.g., 'Europe/London', 'America/New_York')"""
    timezone: String
  }

  """
  Current weather conditions for a specific location.
  All measurements use metric units unless otherwise specified.
  """
  type CurrentWeather {
    """Temperature in degrees Celsius"""
    temperature: Float!
    """Relative humidity as percentage (0-100)"""
    humidity: Int!
    """Wind speed in kilometers per hour"""
    windSpeed: Float!
    """Wind direction in degrees (0-360, where 0/360 = North)"""
    windDirection: Int!
    """Human-readable weather condition description"""
    condition: String!
    """UV Index value (0-11+, higher values indicate stronger UV radiation)"""
    uvIndex: Float!
    """Visibility distance in meters"""
    visibility: Float!
  }

  """
  Weather forecast for a specific date.
  Contains daily summary information for planning purposes.
  """
  type WeatherForecast {
    """Forecast date in ISO 8601 format (YYYY-MM-DD)"""
    date: String!
    """Maximum temperature for the day in degrees Celsius"""
    maxTemperature: Float!
    """Minimum temperature for the day in degrees Celsius"""
    minTemperature: Float!
    """General weather condition for the day"""
    condition: String!
    """Probability of precipitation as percentage (0-100)"""
    precipitationProbability: Int!
    """Maximum wind speed expected during the day in km/h"""
    windSpeed: Float!
    """Average relative humidity for the day as percentage"""
    humidity: Int!
  }

  """
  Complete weather information including current conditions and forecast.
  Provides comprehensive weather data for travel planning decisions.
  """
  type Weather {
    """Current weather conditions at the specified location"""
    current: CurrentWeather!
    """7-day weather forecast starting from today"""
    forecast: [WeatherForecast!]!
  }

  """
  Activity recommendation with suitability scoring.
  Helps users choose appropriate activities based on weather conditions.
  """
  type Activity {
    """Human-readable activity type (e.g., "Skiing", "Surfing", "Indoor sightseeing")"""
    type: String!
    """Suitability score from 0-100 (higher = more suitable for current weather)"""
    score: Float!
    """Human-readable explanation for the score and recommendation"""
    reason: String!
  }

  """
  Root query type providing access to all API endpoints.
  All queries are read-only and do not modify server state.
  """
  type Query {
    """
    Search for cities based on partial or complete name input.
    
    Parameters:
    - query: Search term (minimum 2 characters recommended)
    
    Returns: List of matching cities with geographic coordinates
    
    Use Cases:
    - City name autocomplete
    - Location search for travel planning
    - Finding coordinates for weather queries
    """
    searchCities(
      """
      Search query string. Can be partial city name.
      Minimum 1 character required, 2+ recommended for better results.
      Case-insensitive search across city names globally.
      """
      query: String!
    ): [City!]!

    """
    Get current weather conditions and 7-day forecast for a specific location.
    
    Parameters:
    - latitude: Geographic latitude (-90 to 90)
    - longitude: Geographic longitude (-180 to 180)
    
    Returns: Current weather and forecast data, or null if location invalid
    
    Use Cases:
    - Weather checking before travel
    - Planning outdoor activities
    - 7-day trip weather overview
    """
    getWeather(
      """
      Geographic latitude in decimal degrees.
      Valid range: -90.0 (South Pole) to +90.0 (North Pole).
      Example: 51.5074 (London), 40.7128 (New York), -33.8688 (Sydney)
      """
      latitude: Float!
      """
      Geographic longitude in decimal degrees.
      Valid range: -180.0 to +180.0 (wraps around at International Date Line).
      Example: -0.1278 (London), -74.0060 (New York), 151.2093 (Sydney)
      """
      longitude: Float!
    ): Weather

    """
    Get personalized activity recommendations based on current weather conditions.
    
    Parameters:
    - latitude: Geographic latitude (-90 to 90)
    - longitude: Geographic longitude (-180 to 180)
    
    Returns: Activities ranked by suitability (highest score first)
    
    Scoring System:
    - 90-100: Excellent conditions for this activity
    - 70-89: Good conditions, recommended
    - 50-69: Fair conditions, acceptable
    - 30-49: Poor conditions, not recommended
    - 0-29: Very poor conditions, avoid
    
    Activity Factors:
    - SKIING: Cold temperature, snow/clear conditions, moderate winds
    - SURFING: Warm temperature, clear weather, light winds
    - OUTDOOR_SIGHTSEEING: Comfortable temperature, good visibility, no rain
    - INDOOR_SIGHTSEEING: Recommended during poor outdoor conditions
    
    Use Cases:
    - Activity planning for travelers
    - Weather-based recommendations
    - Itinerary optimization based on conditions
    """
    getActivityRecommendations(
      """
      Geographic latitude in decimal degrees.
      Valid range: -90.0 (South Pole) to +90.0 (North Pole).
      Used to fetch current weather for activity scoring.
      """
      latitude: Float!
      """
      Geographic longitude in decimal degrees.
      Valid range: -180.0 to +180.0 (wraps around at International Date Line).
      Used to fetch current weather for activity scoring.
      """
      longitude: Float!
    ): [Activity!]!
  }
`;

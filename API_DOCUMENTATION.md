# Travel Planning GraphQL API Documentation

## Overview

The Travel Planning GraphQL API provides comprehensive weather data and activity recommendations for travel planning. The API integrates with OpenMeteo weather services to deliver real-time weather information and intelligent activity suggestions based on current conditions.

## Getting Started

### Base URL
- **Development:** `http://localhost:4001/graphql`
- **Health Check:** `http://localhost:4001/health`

### GraphQL Playground
Navigate to `http://localhost:4001/graphql` in your browser to access the interactive GraphQL Playground with full schema documentation, query builder, and testing capabilities.

## API Endpoints

### 1. Search Cities

**Query:** `searchCities`

Search for cities worldwide by name to get their geographic coordinates and metadata.

**Parameters:**
- `query` (String!, required): Search term for city name
  - Minimum 1 character required
  - 2+ characters recommended for better results
  - Case-insensitive search

**Returns:** Array of City objects

**Example Query:**
```graphql
query SearchCities {
  searchCities(query: "London") {
    id
    name
    country
    latitude
    longitude
    population
    timezone
  }
}
```

**Example Response:**
```json
{
  "data": {
    "searchCities": [
      {
        "id": "2643743",
        "name": "London",
        "country": "United Kingdom",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "population": 8982000,
        "timezone": "Europe/London"
      }
    ]
  }
}
```

---

### 2. Get Weather

**Query:** `getWeather`

Retrieve current weather conditions and 7-day forecast for any location worldwide.

**Parameters:**
- `latitude` (Float!, required): Geographic latitude (-90.0 to 90.0)
- `longitude` (Float!, required): Geographic longitude (-180.0 to 180.0)

**Returns:** Weather object with current conditions and forecast, or null if location is invalid

**Example Query:**
```graphql
query GetWeather {
  getWeather(latitude: 51.5074, longitude: -0.1278) {
    current {
      temperature
      condition
      humidity
      windSpeed
      windDirection
      uvIndex
      visibility
    }
    forecast {
      date
      maxTemperature
      minTemperature
      condition
      precipitationProbability
      windSpeed
      humidity
    }
  }
}
```

**Example Response:**
```json
{
  "data": {
    "getWeather": {
      "current": {
        "temperature": 15.2,
        "condition": "Partly cloudy",
        "humidity": 78,
        "windSpeed": 12.5,
        "windDirection": 225,
        "uvIndex": 3.2,
        "visibility": 10000
      },
      "forecast": [
        {
          "date": "2025-08-18",
          "maxTemperature": 18.5,
          "minTemperature": 11.2,
          "condition": "Light rain",
          "precipitationProbability": 65,
          "windSpeed": 15.3,
          "humidity": 82
        }
      ]
    }
  }
}
```

---

### 3. Get Activity Recommendations

**Query:** `getActivityRecommendations`

Get personalized activity recommendations based on current weather conditions, ranked by suitability.

**Parameters:**
- `latitude` (Float!, required): Geographic latitude (-90.0 to 90.0)
- `longitude` (Float!, required): Geographic longitude (-180.0 to 180.0)

**Returns:** Array of Activity recommendations sorted by score (highest first)

**Example Query:**
```graphql
query GetActivityRecommendations {
  getActivityRecommendations(latitude: 51.5074, longitude: -0.1278) {
    type
    score
    reason
  }
}
```

**Example Response:**
```json
{
  "data": {
    "getActivityRecommendations": [
      {
        "type": "Indoor sightseeing",
        "score": 85,
        "reason": "Perfect indoor sightseeing weather - outdoor conditions encourage staying inside"
      },
      {
        "type": "Outdoor sightseeing",
        "score": 50,
        "reason": "Acceptable outdoor sightseeing conditions but weather could be better"
      },
      {
        "type": "Surfing",
        "score": 15,
        "reason": "Poor surfing conditions - too cold, stormy, or windy"
      },
      {
        "type": "Skiing",
        "score": 10,
        "reason": "Poor skiing conditions - too warm or unsuitable weather"
      }
    ]
  }
}

## 🏷️ Data Types

### City
Geographic city information with coordinates and metadata.

| Field | Type | Description |
|-------|------|-------------|
| id | ID! | Unique identifier for the city |
| name | String! | City name in English |
| country | String! | Country name where the city is located |
| latitude | Float! | Geographic latitude (-90 to 90) |
| longitude | Float! | Geographic longitude (-180 to 180) |
| population | Int | City population (may be null) |
| timezone | String | Timezone identifier (e.g., 'Europe/London') |

### CurrentWeather
Current weather conditions for a specific location.

| Field | Type | Description |
|-------|------|-------------|
| temperature | Float! | Temperature in degrees Celsius |
| humidity | Int! | Relative humidity percentage (0-100) |
| windSpeed | Float! | Wind speed in kilometers per hour |
| windDirection | Int! | Wind direction in degrees (0-360) |
| condition | String! | Human-readable weather description |
| uvIndex | Float! | UV Index (0-11+, higher = stronger UV) |
| visibility | Float! | Visibility distance in meters |

### WeatherForecast
Daily weather forecast information.

| Field | Type | Description |
|-------|------|-------------|
| date | String! | Forecast date (YYYY-MM-DD) |
| maxTemperature | Float! | Maximum temperature in Celsius |
| minTemperature | Float! | Minimum temperature in Celsius |
| condition | String! | General weather condition |
| precipitationProbability | Int! | Rain probability percentage (0-100) |
| windSpeed | Float! | Maximum wind speed in km/h |
| humidity | Int! | Average relative humidity percentage |

### Activity
Activity recommendation with suitability scoring.

| Field | Type | Description |
|-------|------|-------------|
| type | String! | Human-readable activity type (e.g., "Skiing", "Surfing") |
| score | Float! | Suitability score (0-100) |
| reason | String! | Explanation for the recommendation |

### Activity Types
The API returns the following human-readable activity types:

| Type | Description |
|------|-------------|
| Skiing | Snow sports and winter activities |
| Surfing | Water sports and ocean activities |
| Indoor sightseeing | Museums, galleries, shopping |
| Outdoor sightseeing | Parks, monuments, walking tours |

## 📊 Scoring System

Activity recommendations use a 0-100 scoring system:

- **90-100**: Excellent conditions, highly recommended
- **70-89**: Good conditions, recommended
- **50-69**: Fair conditions, acceptable
- **30-49**: Poor conditions, not recommended
- **0-29**: Very poor conditions, avoid

### Activity Factors

**SKIING:**
- Best: Cold temperatures (≤0°C), snow or clear conditions, moderate winds
- Factors: Temperature, weather condition, wind speed

**SURFING:**
- Best: Warm temperatures (≥15°C), clear weather, light winds
- Factors: Temperature, weather condition, wind speed

**OUTDOOR_SIGHTSEEING:**
- Best: Comfortable temperature (5-30°C), good visibility, no rain
- Factors: Temperature, visibility, weather condition, wind

**INDOOR_SIGHTSEEING:**
- Best: When outdoor conditions are poor
- Inverse scoring of outdoor sightseeing conditions

## 🔧 Error Handling

The API uses GraphQL's built-in error handling. Common error scenarios:

1. **Invalid Coordinates**: Returns null for weather queries with invalid lat/lng
2. **Network Errors**: Returns GraphQL errors for external API failures
3. **Validation Errors**: Returns validation errors for invalid input parameters

## 📝 Usage Examples

### Complete Travel Planning Query
```graphql
query TravelPlanning($cityQuery: String!, $lat: Float!, $lng: Float!) {
  # Search for cities
  cities: searchCities(query: $cityQuery) {
    id
    name
    country
    latitude
    longitude
  }
  
  # Get weather for location
  weather: getWeather(latitude: $lat, longitude: $lng) {
    current {
      temperature
      condition
      humidity
      windSpeed
    }
    forecast {
      date
      maxTemperature
      minTemperature
      condition
      precipitationProbability
    }
  }
  
  # Get activity recommendations
  activities: getActivityRecommendations(latitude: $lat, longitude: $lng) {
    type
    score
    reason
  }
}
```

### Variables:
```json
{
  "cityQuery": "Paris",
  "lat": 48.8566,
  "lng": 2.3522
}
```

## 🔒 Security & Rate Limiting

- CORS enabled for development environments
- Helmet.js security headers applied
- Request timeout: 5 seconds for external API calls
- No authentication required (public API)

## 🌐 External Dependencies

- **OpenMeteo API**: Weather data and geocoding
- **Apollo Server**: GraphQL server implementation
- **Express.js**: HTTP server framework

## 📞 Support

For technical support or questions about the API:
- Check the interactive documentation at `/graphql`
- Review error messages in GraphQL responses
- Verify coordinate ranges and input parameters

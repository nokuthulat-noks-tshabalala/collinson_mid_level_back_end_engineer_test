# Travel Planning GraphQL API

A scalable and maintainable GraphQL API for travel planning applications that provides:

- Dynamic city suggestions based on partial or complete user input
- Weather forecasts for selected cities
- Activity rankings based on weather conditions (Skiing, Surfing, Indoor sightseeing, Outdoor sightseeing)

## Features

- **GraphQL Schema**: Well-designed, extensible schema that clearly models the travel planning domain
- **Weather Integration**: Uses OpenMeteo API for real-time weather and geolocation data
- **Activity Recommendations**: Intelligent ranking of activities based on weather conditions
- **Smart City Filtering**: Automatically filters search results to include only valid cities with proper country information
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Testing**: Comprehensive unit and integration tests using Jest and Supertest with 80% coverage requirements
- **Architecture**: Clean separation of concerns with scalable, maintainable architecture
- **Error Handling**: Robust error handling with meaningful user-friendly messages

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **GraphQL**: Apollo Server Express
- **HTTP Client**: Axios for API calls
- **Testing**: Jest, Supertest, ts-jest
- **Development**: Nodemon, ts-node
- **Security**: Helmet, CORS

## API Structure

### GraphQL Schema

#### Types
- `City`: Represents a city with location data
- `Weather`: Current and forecast weather information
- `Activity`: Activity recommendations with scores
- `ActivityType`: Enum for activity types (returns human-readable strings like "Skiing", "Surfing", "Indoor sightseeing", "Outdoor sightseeing")

#### Queries
- `searchCities(query: String!)`: Dynamic city suggestions (filtered to include only locations with valid country information)
- `getWeather(latitude: Float!, longitude: Float!)`: Weather data for coordinates
- `getActivityRecommendations(latitude: Float!, longitude: Float!)`: Ranked activities based on weather

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The GraphQL playground will be available at `http://localhost:4000/graphql`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage (80% threshold for all metrics)
npm run test:coverage
```

The test suite includes:
- Unit tests for all services and utilities
- Integration tests for GraphQL endpoints
- Comprehensive coverage requirements (80% for statements, branches, functions, and lines)

### Building

```bash
# Build for production (includes TypeScript compilation and test coverage)
npm run build

# Build without running tests (faster for development iterations)
npm run build:no-test

# Start production server
npm start
```

## Example Queries

### Search Cities
```graphql
query SearchCities {
  searchCities(query: "Paris") {
    id
    name
    country
    latitude
    longitude
  }
}
```

### Get Weather
```graphql
query GetWeather {
  getWeather(latitude: 48.8566, longitude: 2.3522) {
    current {
      temperature
      humidity
      windSpeed
      condition
    }
    forecast {
      date
      maxTemperature
      minTemperature
      condition
      precipitationProbability
    }
  }
}
```

### Get Activity Recommendations
```graphql
query GetActivities {
  getActivityRecommendations(latitude: 48.8566, longitude: 2.3522) {
    type
    score
    reason
  }
}
```

## Architecture

The application follows a layered architecture pattern:

- **Presentation Layer**: GraphQL resolvers
- **Service Layer**: Business logic for weather, cities, and activities
- **Data Layer**: External API integrations (OpenMeteo)
- **Types**: Comprehensive TypeScript type definitions

## Environment Variables

Create a `.env` file in the root directory:

```bash
PORT=4000
NODE_ENV=development
OPENMETEO_BASE_URL=https://api.open-meteo.com/v1
GEOCODING_BASE_URL=https://geocoding-api.open-meteo.com/v1
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License


## Ommissions & trade-offs

I did not use the supplied URL "http://www.openmeteo.com/" as it was redirecting me to a German page.
I used the API URLs suggested by Copilot.

## How I would improve or extend the project with more time

1. Add detailed failure logs so that we can be able to investigate when clients report errors or bugs.
2. Style the docs.html better and check for spelling or gramatical errors on documentation
3. Perform more testing to ensure good error handling and robustness

## AI Tool Used

Copilot
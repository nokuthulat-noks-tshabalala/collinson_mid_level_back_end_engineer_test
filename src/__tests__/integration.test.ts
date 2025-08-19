import request from 'supertest';
import { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { startServer } from '../server';

describe('GraphQL Integration Tests', () => {
  let app: Application;
  let server: ApolloServer;

  beforeAll(async () => {
    const serverInstance = await startServer();
    app = serverInstance.app;
    server = serverInstance.server;
  });

  afterAll(async () => {
    await server?.stop();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        environment: 'test'
      });
    });
  });

  describe('GraphQL Endpoint', () => {
    it('should handle GraphQL introspection query', async () => {
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            types {
              name
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query: introspectionQuery })
        .expect(200);

      expect(response.body.data.__schema.types).toBeDefined();
      expect(response.body.data.__schema.types.length).toBeGreaterThan(0);
    });

    it('should validate searchCities query structure', async () => {
      const query = `
        query SearchCities($query: String!) {
          searchCities(query: $query) {
            id
            name
            country
            latitude
            longitude
            population
            timezone
          }
        }
      `;

      // This test validates the GraphQL schema structure, 
      // but might fail due to external API dependency
      const response = await request(app)
        .post('/graphql')
        .send({ 
          query, 
          variables: { query: 'Paris' }
        });

      // Should either succeed or fail with a network/timeout error, not a schema error
      if (response.body.errors) {
        // If there are errors, they should be runtime errors, not schema errors
        response.body.errors.forEach((error: any) => {
          expect(error.message).not.toContain('Cannot query field');
          expect(error.message).not.toContain('Unknown argument');
        });
      } else {
        // If successful, validate response structure
        expect(response.body.data.searchCities).toBeDefined();
        expect(Array.isArray(response.body.data.searchCities)).toBe(true);
      }
    });

    it('should validate getWeather query structure', async () => {
      const query = `
        query GetWeather($latitude: Float!, $longitude: Float!) {
          getWeather(latitude: $latitude, longitude: $longitude) {
            current {
              temperature
              humidity
              windSpeed
              windDirection
              condition
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
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ 
          query, 
          variables: { latitude: 48.8566, longitude: 2.3522 }
        });

      // Should either succeed or fail with a network/timeout error, not a schema error
      if (response.body.errors) {
        response.body.errors.forEach((error: any) => {
          expect(error.message).not.toContain('Cannot query field');
          expect(error.message).not.toContain('Unknown argument');
        });
      } else {
        expect(response.body.data.getWeather).toBeDefined();
        if (response.body.data.getWeather) {
          expect(response.body.data.getWeather.current).toBeDefined();
          expect(response.body.data.getWeather.forecast).toBeDefined();
        }
      }
    });

    it('should validate getActivityRecommendations query structure', async () => {
      const query = `
        query GetActivityRecommendations($latitude: Float!, $longitude: Float!) {
          getActivityRecommendations(latitude: $latitude, longitude: $longitude) {
            type
            score
            reason
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ 
          query, 
          variables: { latitude: 48.8566, longitude: 2.3522 }
        });

      // Should either succeed or fail with a network/timeout error, not a schema error
      if (response.body.errors) {
        response.body.errors.forEach((error: any) => {
          expect(error.message).not.toContain('Cannot query field');
          expect(error.message).not.toContain('Unknown argument');
        });
      } else {
        expect(response.body.data.getActivityRecommendations).toBeDefined();
        expect(Array.isArray(response.body.data.getActivityRecommendations)).toBe(true);
      }
    });

    it('should handle invalid coordinates gracefully', async () => {
      const query = `
        query GetWeather($latitude: Float!, $longitude: Float!) {
          getWeather(latitude: $latitude, longitude: $longitude) {
            current {
              temperature
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ 
          query, 
          variables: { latitude: 999, longitude: 999 }
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Invalid coordinates');
    });

    it('should handle short search query gracefully', async () => {
      const query = `
        query SearchCities($query: String!) {
          searchCities(query: $query) {
            id
            name
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ 
          query, 
          variables: { query: 'a' }
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('at least 2 characters');
    });

    it('should handle malformed GraphQL queries', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({ query: 'invalid query' });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Syntax Error');
    });
  });
});

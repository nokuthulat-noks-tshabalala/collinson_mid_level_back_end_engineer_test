// Test setup file
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.OPENMETEO_BASE_URL = 'https://api.open-meteo.com/v1';
process.env.GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

// Setup global test timeout
jest.setTimeout(10000);

// Suppress console.error during tests to clean up output
// This prevents expected error messages from cluttering test results
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

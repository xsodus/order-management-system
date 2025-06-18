// testHelpers.ts
import supertest from 'supertest';
import app from '../app';

// Create a test client
export const testClient = supertest(app);

// Sample order data for tests
export const sampleOrderData = {
  quantity: 10,
  latitude: 37.7749,
  longitude: -122.4194,
};

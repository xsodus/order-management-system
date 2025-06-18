// error-handling.test.ts
import { testClient } from './testHelpers';

describe('API Error Handling Tests', () => {
  describe('Invalid Routes', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await testClient.get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
    });
  });

  describe('Input Validation', () => {
    it('should validate numeric inputs', async () => {
      const response = await testClient.post('/api/orders').send({
        quantity: 'not-a-number',
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should validate latitude range', async () => {
      const response = await testClient.post('/api/orders').send({
        quantity: 10,
        latitude: 95, // Invalid latitude (exceeds 90)
        longitude: -122.4194,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should validate longitude range', async () => {
      const response = await testClient.post('/api/orders').send({
        quantity: 10,
        latitude: 37.7749,
        longitude: -200, // Invalid longitude (below -180)
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should validate that quantity is positive', async () => {
      const response = await testClient.post('/api/orders').send({
        quantity: 0, // Invalid quantity (should be positive)
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('Request ID Tracking', () => {
    it('should include request ID in response headers', async () => {
      const response = await testClient.get('/api/orders');

      expect(response.headers).toHaveProperty('x-request-id');
      expect(response.headers['x-request-id']).toBeTruthy();
    });
  });
});

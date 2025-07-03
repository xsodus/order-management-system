import request from 'supertest';
import app from '../app';
import { Warehouse, seedWarehouses } from '../models/warehouse.model';

describe('Warehouse API', () => {
  // Clean up before each test
  beforeEach(async () => {
    try {
      await Warehouse.truncate({ cascade: true, force: true });
    } catch (error) {
      console.error('Failed to clean up test data:', error);
    }
  });

  describe('POST /api/warehouses', () => {
    it('should create a new warehouse successfully', async () => {
      const warehouseData = {
        name: 'Test Warehouse',
        latitude: 40.7128,
        longitude: -74.0060,
        stock: 100,
      };

      const response = await request(app)
        .post('/api/warehouses')
        .send(warehouseData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(warehouseData.name);
      expect(response.body.latitude).toBe(warehouseData.latitude);
      expect(response.body.longitude).toBe(warehouseData.longitude);
      expect(response.body.stock).toBe(warehouseData.stock);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 when creating warehouse with duplicate name', async () => {
      const warehouseData = {
        name: 'Duplicate Warehouse',
        latitude: 40.7128,
        longitude: -74.0060,
        stock: 100,
      };

      // Create first warehouse
      await request(app)
        .post('/api/warehouses')
        .send(warehouseData)
        .expect(201);

      // Try to create second warehouse with same name
      const response = await request(app)
        .post('/api/warehouses')
        .send(warehouseData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 when creating warehouse with invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        latitude: 91, // Invalid latitude
        longitude: -181, // Invalid longitude
        stock: -1, // Negative stock
      };

      const response = await request(app)
        .post('/api/warehouses')
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/warehouses', () => {
    it('should return all warehouses', async () => {
      // Seed some test warehouses
      await seedWarehouses();

      const response = await request(app)
        .get('/api/warehouses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check that warehouses are sorted by name
      if (response.body.length > 1) {
        expect(response.body[0].name).toBeLessThanOrEqual(response.body[1].name);
      }
    });

    it('should return empty array when no warehouses exist', async () => {
      const response = await request(app)
        .get('/api/warehouses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/warehouses/:id', () => {
    it('should return warehouse by ID', async () => {
      // Create a test warehouse
      const warehouseData = {
        name: 'Test Warehouse',
        latitude: 40.7128,
        longitude: -74.0060,
        stock: 100,
      };

      const createResponse = await request(app)
        .post('/api/warehouses')
        .send(warehouseData)
        .expect(201);

      const warehouseId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/warehouses/${warehouseId}`)
        .expect(200);

      expect(response.body.id).toBe(warehouseId);
      expect(response.body.name).toBe(warehouseData.name);
    });

    it('should return 404 when warehouse not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/warehouses/${nonExistentId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 when warehouse ID is invalid', async () => {
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .get(`/api/warehouses/${invalidId}`)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/warehouses/:id/stock', () => {
    it('should update warehouse stock successfully', async () => {
      // Create a test warehouse
      const warehouseData = {
        name: 'Test Warehouse',
        latitude: 40.7128,
        longitude: -74.0060,
        stock: 100,
      };

      const createResponse = await request(app)
        .post('/api/warehouses')
        .send(warehouseData)
        .expect(201);

      const warehouseId = createResponse.body.id;
      const newStock = 250;

      const response = await request(app)
        .put(`/api/warehouses/${warehouseId}/stock`)
        .send({ stock: newStock })
        .expect(200);

      expect(response.body.id).toBe(warehouseId);
      expect(response.body.stock).toBe(newStock);
      expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);
    });

    it('should return 404 when updating non-existent warehouse', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .put(`/api/warehouses/${nonExistentId}/stock`)
        .send({ stock: 100 })
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 when stock is negative', async () => {
      // Create a test warehouse
      const warehouseData = {
        name: 'Test Warehouse',
        latitude: 40.7128,
        longitude: -74.0060,
        stock: 100,
      };

      const createResponse = await request(app)
        .post('/api/warehouses')
        .send(warehouseData)
        .expect(201);

      const warehouseId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/warehouses/${warehouseId}/stock`)
        .send({ stock: -1 })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/warehouses/:id', () => {
    it('should delete warehouse successfully', async () => {
      // Create a test warehouse
      const warehouseData = {
        name: 'Test Warehouse',
        latitude: 40.7128,
        longitude: -74.0060,
        stock: 100,
      };

      const createResponse = await request(app)
        .post('/api/warehouses')
        .send(warehouseData)
        .expect(201);

      const warehouseId = createResponse.body.id;

      // Delete the warehouse
      await request(app)
        .delete(`/api/warehouses/${warehouseId}`)
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get(`/api/warehouses/${warehouseId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent warehouse', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/warehouses/${nonExistentId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });
  });
});

import request from 'supertest';
import './setup'; // Import global setup
import { sequelize } from '../config/database';
import app from '../app';
import Warehouse from '../models/warehouse.model';

describe('Order Concurrency Tests', () => {
  beforeAll(async () => {
    // The global setup from ./setup.ts will handle test database initialization
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear all data before each test
    await sequelize.sync({ force: true });

    // Seed warehouses with specific stock for testing
    await Warehouse.bulkCreate([
      {
        name: 'Test Warehouse',
        latitude: 37.7749,
        longitude: -122.4194,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          crs: { type: 'name', properties: { name: 'EPSG:4326' } },
        },
        stock: 10, // Only 10 items to make race conditions more likely
      },
    ]);
  });

  it('should handle concurrent orders without overselling', async () => {
    // Try to create multiple orders concurrently that would total more than stock
    const orderData = {
      quantity: 6,
      latitude: 37.7749,
      longitude: -122.4194,
    };

    // Create 3 concurrent orders, each wanting 6 items (18 total)
    // But we only have 10 items in stock
    const concurrentRequests = [
      request(app).post('/api/orders').send(orderData),
      request(app).post('/api/orders').send(orderData),
      request(app).post('/api/orders').send(orderData),
    ];

    const responses = await Promise.all(concurrentRequests);

    // Count successful and failed orders
    const successfulOrders = responses.filter(res => res.status === 201);
    const failedOrders = responses.filter(res => res.status === 400);

    // We should have exactly 1 successful order (using 6 items)
    // The remaining 4 items should not be enough for another order of 6
    expect(successfulOrders.length).toBe(1);
    expect(failedOrders.length).toBe(2);

    // Verify the warehouse still has correct stock (10 - 6 = 4)
    const warehouse = await Warehouse.findOne();
    expect(warehouse?.stock).toBe(4);

    // Verify error messages for failed orders
    failedOrders.forEach(response => {
      expect(response.body.message).toContain('Cannot fulfill order');
    });
  });

  it('should handle rapid sequential orders correctly', async () => {
    const orderData = {
      quantity: 2,
      latitude: 37.7749,
      longitude: -122.4194,
    };

    // Create 5 orders rapidly in sequence (10 items total)
    const orders = [];
    for (let i = 0; i < 5; i++) {
      const response = await request(app).post('/api/orders').send(orderData);
      orders.push(response);
    }

    // All orders should succeed since 5 * 2 = 10 items (exactly our stock)
    orders.forEach(response => {
      expect(response.status).toBe(201);
    });

    // Verify warehouse is now empty
    const warehouse = await Warehouse.findOne();
    expect(warehouse?.stock).toBe(0);

    // Try one more order - should fail
    const extraOrder = await request(app).post('/api/orders').send(orderData);
    expect(extraOrder.status).toBe(400);
    expect(extraOrder.body.message).toContain('Cannot fulfill order');
  });

  it('should maintain data consistency with high concurrency', async () => {
    // Create many small concurrent orders
    const orderData = {
      quantity: 1,
      latitude: 37.7749,
      longitude: -122.4194,
    };

    // Create 15 concurrent orders of 1 item each
    // We only have 10 items, so 5 should fail
    const requests = Array(15)
      .fill(null)
      .map(() => request(app).post('/api/orders').send(orderData));

    const responses = await Promise.all(requests);

    const successfulOrders = responses.filter(res => res.status === 201);
    const failedOrders = responses.filter(res => res.status === 400);

    // Exactly 10 orders should succeed (our stock amount)
    expect(successfulOrders.length).toBe(10);
    expect(failedOrders.length).toBe(5);

    // Warehouse should be empty
    const warehouse = await Warehouse.findOne();
    expect(warehouse?.stock).toBe(0);
  });
});

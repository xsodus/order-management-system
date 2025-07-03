// orders.test.ts
import { testClient, sampleOrderData } from './testHelpers';
import { OrderStatus } from '../models/order.model';

import { Order, OrderItem } from '../models/order.model';
import Warehouse, { seedWarehouses } from '../models/warehouse.model';

// Clean up before each test
beforeEach(async () => {
  try {
    await Warehouse.truncate({ cascade: true, force: true });
    await seedWarehouses();
    // Truncate order items first due to foreign key constraints
    await OrderItem.truncate({ cascade: true, force: true });
    // Then truncate orders
    await Order.truncate({ cascade: true, force: true });
  } catch (error) {
    console.error('Failed to clean up test data:', error);
  }
});

describe('Order API Integration Tests', () => {
  // Test order verification
  describe('GET /api/orders/verify', () => {
    it('should verify an order successfully', async () => {
      const response = await testClient.get('/api/orders/verify').query({
        quantity: sampleOrderData.quantity,
        latitude: sampleOrderData.latitude,
        longitude: sampleOrderData.longitude,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('basePrice');
      expect(response.body).toHaveProperty('totalPrice');
      expect(response.body).toHaveProperty('discount');
      expect(response.body).toHaveProperty('shippingCost');

      // Validate basePrice calculation (quantity * $150)
      const expectedBasePrice = sampleOrderData.quantity * 150;
      expect(response.body.basePrice).toBe(expectedBasePrice);
    });

    it('should return 400 if required parameters are missing', async () => {
      const response = await testClient.get('/api/orders/verify').query({
        quantity: sampleOrderData.quantity,
        // Missing latitude and longitude
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  // Test order creation
  describe('POST /api/orders', () => {
    it('should create an order successfully', async () => {
      let orderId: string;
      const response = await testClient.post('/api/orders').send(sampleOrderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body).toHaveProperty('status', OrderStatus.PENDING);
      expect(response.body).toHaveProperty('basePrice');
      expect(response.body).toHaveProperty('totalPrice');

      // Validate basePrice calculation (quantity * $150)
      const expectedBasePrice = sampleOrderData.quantity * 150;
      expect(response.body.basePrice).toBe(expectedBasePrice);

      // Save the order id for later tests
      orderId = response.body.id;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await testClient.post('/api/orders').send({
        quantity: sampleOrderData.quantity,
        // Missing latitude and longitude
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 if quantity is negative', async () => {
      const response = await testClient.post('/api/orders').send({
        ...sampleOrderData,
        quantity: -5,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should calculate basePrice correctly for different quantities', async () => {
      const testQuantities = [1, 25, 50, 100];

      for (const quantity of testQuantities) {
        const response = await testClient.post('/api/orders').send({
          ...sampleOrderData,
          quantity,
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('basePrice');

        // Validate basePrice calculation (quantity * $150)
        const expectedBasePrice = quantity * 150;
        expect(response.body.basePrice).toBe(expectedBasePrice);

        // Clean up created order
        if (response.body.id) {
          await testClient.delete(`/api/orders/${response.body.id}`);
        }
      }
    });
  });

  // Test getting all orders (no filtering, no get by id, no patch/delete)
  describe('GET /api/orders', () => {
    it('should get all orders', async () => {
      // Create some test orders first
      const testOrders = [
        { ...sampleOrderData, quantity: 10 },
        { ...sampleOrderData, quantity: 25 },
        { ...sampleOrderData, quantity: 50 },
      ];
      // Create the orders
      const createdOrders = [];
      for (const orderData of testOrders) {
        const createResponse = await testClient.post('/api/orders').send(orderData);
        expect(createResponse.status).toBe(201);
        createdOrders.push(createResponse.body);
      }
      const response = await testClient.get('/api/orders');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(testOrders.length);
      // Validate that each order has basePrice
      response.body.forEach((order: any) => {
        expect(order).toHaveProperty('basePrice');
        expect(order).toHaveProperty('quantity');
        const expectedBasePrice = order.quantity * 150;
        expect(order.basePrice).toBe(expectedBasePrice);
      });
    });
  });
});

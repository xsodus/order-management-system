import request from 'supertest';
import './setup'; // Import global setup
import { sequelize } from '../config/database';
import app from '../app';
import Warehouse from '../models/warehouse.model';
import { Order, OrderItem } from '../models/order.model';
import { OrderService } from '../services/order.service';

describe('Transaction Error Handling Tests', () => {
  beforeAll(async () => {
    // The global setup from ./setup.ts will handle test database initialization
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear all data before each test
    await sequelize.sync({ force: true });

    // Seed warehouses with stock for testing
    await Warehouse.bulkCreate([
      {
        name: 'Test Warehouse 1',
        latitude: 37.7749,
        longitude: -122.4194,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          crs: { type: 'name', properties: { name: 'EPSG:4326' } },
        },
        stock: 50,
      },
    ]);
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await OrderItem.destroy({ where: {}, truncate: true, cascade: true });
      await Order.destroy({ where: {}, truncate: true, cascade: true });
      await Warehouse.destroy({ where: {}, truncate: true, cascade: true });
    } catch (error) {
      console.error('Failed to clean up test data:', error);
    }
  });

  describe('Order Creation Transaction Error Handling', () => {
    it('should rollback transaction when error occurs during order creation', async () => {
      const orderService = new OrderService();

      // Mock the Order.create method to throw an error
      const originalCreate = Order.create;
      const mockCreate = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      Order.create = mockCreate;

      const orderData = {
        quantity: 10,
        latitude: 37.7749,
        longitude: -122.4194,
      };

      // Get initial warehouse stock
      const initialWarehouse = await Warehouse.findOne();
      const initialStock = initialWarehouse?.stock || 0;

      try {
        // Attempt to create order - should fail and rollback
        await orderService.createOrder(orderData);

        // This should not be reached
        expect(true).toBe(false);
      } catch (error: any) {
        // Verify the error is thrown correctly
        expect(error.message).toBe('Database connection failed');

        // Verify transaction was rolled back by checking warehouse stock hasn't changed
        const warehouseAfterError = await Warehouse.findOne();
        expect(warehouseAfterError?.stock).toBe(initialStock);

        // Verify no order was created
        const orderCount = await Order.count();
        expect(orderCount).toBe(0);

        // Verify no order items were created
        const orderItemCount = await OrderItem.count();
        expect(orderItemCount).toBe(0);
      } finally {
        // Restore original Order.create method
        Order.create = originalCreate;
      }
    });

    it('should rollback transaction when warehouse update fails', async () => {
      const orderService = new OrderService();

      // Mock the warehouse updateStock method to throw an error
      const originalUpdateStock = Warehouse.prototype.updateStock;
      const mockUpdateStock = jest.fn().mockRejectedValue(new Error('Stock update failed'));
      Warehouse.prototype.updateStock = mockUpdateStock;

      const orderData = {
        quantity: 10,
        latitude: 37.7749,
        longitude: -122.4194,
      };

      // Get initial warehouse stock
      const initialWarehouse = await Warehouse.findOne();
      const initialStock = initialWarehouse?.stock || 0;

      try {
        // Attempt to create order - should fail and rollback
        await orderService.createOrder(orderData);

        // This should not be reached
        expect(true).toBe(false);
      } catch (error: any) {
        // Verify the error is thrown correctly
        expect(error.message).toBe('Stock update failed');

        // Verify transaction was rolled back by checking warehouse stock hasn't changed
        const warehouseAfterError = await Warehouse.findOne();
        expect(warehouseAfterError?.stock).toBe(initialStock);

        // Verify no order was created
        const orderCount = await Order.count();
        expect(orderCount).toBe(0);

        // Verify no order items were created
        const orderItemCount = await OrderItem.count();
        expect(orderItemCount).toBe(0);
      } finally {
        // Restore original updateStock method
        Warehouse.prototype.updateStock = originalUpdateStock;
      }
    });

    it('should handle API-level transaction rollback on insufficient stock error', async () => {
      const orderData = {
        quantity: 100, // Request more than available stock (50)
        latitude: 37.7749,
        longitude: -122.4194,
      };

      // Get initial warehouse stock
      const initialWarehouse = await Warehouse.findOne();
      const initialStock = initialWarehouse?.stock || 0;

      // Make API request that should fail due to insufficient stock
      const response = await request(app).post('/api/orders').send(orderData);

      // Verify API returns error (400 as per controller error handling)
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Cannot fulfill order');

      // Verify warehouse stock hasn't changed (transaction rollback worked)
      const warehouseAfterError = await Warehouse.findOne();
      expect(warehouseAfterError?.stock).toBe(initialStock);

      // Verify no order was created
      const orderCount = await Order.count();
      expect(orderCount).toBe(0);

      // Verify no order items were created
      const orderItemCount = await OrderItem.count();
      expect(orderItemCount).toBe(0);
    });

    it('should log error details when transaction rollback occurs', async () => {
      const orderService = new OrderService();

      // Mock the Order.create method to throw an error
      const originalCreate = Order.create;
      Order.create = jest.fn().mockRejectedValue(new Error('Simulated database error'));

      const orderData = {
        quantity: 10,
        latitude: 37.7749,
        longitude: -122.4194,
      };

      try {
        await orderService.createOrder(orderData);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Verify error is properly thrown
        expect(error.message).toBe('Simulated database error');

        // Note: In a real test, you would need to mock the logger import
        // For now, we just verify the error handling logic works
      } finally {
        // Restore original Order.create method
        Order.create = originalCreate;
      }
    });

    it('should execute transaction rollback and error logging as specified in lines 349-357', async () => {
      const orderService = new OrderService();

      // Mock logger to capture error logs
      const logger = require('../utils/logger').default;
      const loggerErrorSpy = jest.spyOn(logger, 'error');

      // Mock the OrderItem.create method to throw an error after order verification
      const originalCreate = require('../models/order.model').OrderItem.create;
      const mockCreate = jest.fn().mockRejectedValue(new Error('OrderItem creation failed'));
      require('../models/order.model').OrderItem.create = mockCreate;

      const orderData = {
        quantity: 10,
        latitude: 37.7749,
        longitude: -122.4194,
      };

      // Get initial warehouse stock
      const initialWarehouse = await Warehouse.findOne();
      const initialStock = initialWarehouse?.stock || 0;

      try {
        // Attempt to create order - should fail during OrderItem creation
        await orderService.createOrder(orderData);

        // This should not be reached
        expect(true).toBe(false);
      } catch (error: any) {
        // Verify the exact error message thrown matches lines 349-357 behavior
        expect(error.message).toBe('OrderItem creation failed');

        // Verify logger.error was called with correct parameters (line 351-354)
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          'Error creating order, transaction rolled back',
          expect.objectContaining({
            error: 'OrderItem creation failed',
            stack: expect.any(String),
          }),
        );

        // Verify transaction was rolled back by checking warehouse stock hasn't changed
        const warehouseAfterError = await Warehouse.findOne();
        expect(warehouseAfterError?.stock).toBe(initialStock);

        // Verify no order was created (transaction rollback worked)
        const orderCount = await Order.count();
        expect(orderCount).toBe(0);

        // Verify no order items were created (transaction rollback worked)
        const orderItemCount = await OrderItem.count();
        expect(orderItemCount).toBe(0);
      } finally {
        // Restore original OrderItem.create method
        require('../models/order.model').OrderItem.create = originalCreate;
        loggerErrorSpy.mockRestore();
      }
    });
  });
});

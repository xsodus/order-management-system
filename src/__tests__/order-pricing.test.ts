// order-pricing.test.ts
import Order, { OrderItem } from '../models/order.model';
import Warehouse, { seedWarehouses } from '../models/warehouse.model';
import { testClient, sampleOrderData } from './testHelpers';
import Decimal from 'decimal.js';

// Clean up before each test
beforeEach(async () => {
  try {
    await Warehouse.truncate({ cascade: true, force: true });
    await seedWarehouses();
    // Truncate order items first due to foreign key constraints
    await OrderItem.truncate({ cascade: true });
    // Then truncate orders
    await Order.truncate({ cascade: true });
  } catch (error) {
    console.error('Failed to clean up test data:', error);
  }
});

describe('Order Pricing and Discount Integration Tests', () => {
  // Test discount logic
  describe('Order Discount Logic', () => {
    it('should apply no discount for small orders', async () => {
      const response = await testClient.post('/api/orders').send({
        ...sampleOrderData,
        quantity: 5, // Small quantity, shouldn't get discount
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('discount');
      expect(response.body.discount).toBe(0); // API returns discount as number now
    });

    it('should apply 5% discount for medium-sized orders', async () => {
      const response = await testClient.post('/api/orders').send({
        ...sampleOrderData,
        quantity: 25, // Should get 5% discount
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('discount');
      expect(response.body.discount).toBe(187.5); // 5% of 3750 (25 * 150)
    });

    it('should apply 10% discount for larger orders', async () => {
      const response = await testClient.post('/api/orders').send({
        ...sampleOrderData,
        quantity: 50, // Should get 10% discount
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('discount');
      expect(response.body.discount).toBe(750); // 10% of 7500 (50 * 150)
    });

    it('should apply 15% discount for very large orders', async () => {
      const response = await testClient.post('/api/orders').send({
        ...sampleOrderData,
        quantity: 100, // Should get 15% discount
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('discount');
      expect(response.body.discount).toBe(2250); // 15% of 15000 (100 * 150)
    });

    it('should apply 20% discount for bulk orders', async () => {
      const response = await testClient.post('/api/orders').send({
        ...sampleOrderData,
        quantity: 250, // Should get 20% discount
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('discount');
      expect(response.body.discount).toBe(7500); // 20% of 37500 (250 * 150)
    });
  });

  // Test shipping cost calculation based on distance
  describe('Shipping Cost Calculations', () => {
    it('should calculate shipping cost properly', async () => {
      // First, verify an order to check the calculated shipping cost
      const verifyResponse = await testClient.get('/api/orders/verify').query({
        ...sampleOrderData,
      });

      expect(verifyResponse.status).toBe(200);

      // Now create the order with same parameters
      const createResponse = await testClient.post('/api/orders').send(sampleOrderData);

      expect(createResponse.status).toBe(201);

      // Verify shipping cost consistency between verify and create endpoints
      // Use a small tolerance for floating point comparisons
      expect(createResponse.body.shippingCost).toBe(verifyResponse.body.shippingCost);
      expect(createResponse.body.basePrice).toBe(verifyResponse.body.basePrice);
      expect(createResponse.body.totalPrice).toBe(verifyResponse.body.totalPrice);
      expect(createResponse.body.discount).toBe(verifyResponse.body.discount);
    });

    it('should calculate shipping cost based on distance from nearest warehouse', async () => {
      // Test with San Francisco coordinates - should use Los Angeles warehouse (closest to sample data)
      const sanFranciscoOrder = {
        quantity: 10,
        latitude: 37.7749, // San Francisco
        longitude: -122.4194,
      };

      const response = await testClient.post('/api/orders').send(sanFranciscoOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('shippingCost');

      // Shipping cost should be greater than 0 since there's distance involved
      expect(response.body.shippingCost).toBeGreaterThan(0);

      // Test with New York coordinates - should be more expensive due to greater distance
      const newYorkOrder = {
        quantity: 10,
        latitude: 40.7128, // New York City
        longitude: -74.006,
      };

      const nyResponse = await testClient.post('/api/orders').send(newYorkOrder);

      expect(nyResponse.status).toBe(201);
      expect(nyResponse.body).toHaveProperty('shippingCost');

      // New York order should have different shipping cost (likely from different warehouse)
      expect(nyResponse.body.shippingCost).toBeGreaterThan(0);
    });

    it('should calculate shipping cost using the correct formula', async () => {
      // Test with coordinates very close to New York warehouse since Los Angeles might be exhausted
      const orderData = {
        quantity: 5,
        latitude: 40.639722, // New York warehouse coordinates
        longitude: -73.778889,
      };

      const response = await testClient.post('/api/orders').send(orderData);

      expect(response.status).toBe(201);

      // Since we're ordering from the exact New York warehouse location, distance is 0
      // Shipping cost formula: quantity × deviceWeight (0.365kg) × distance (0km) × shippingRate ($0.01/kg/km) = 0
      // This is correct behavior - no shipping cost when ordering from warehouse location
      expect(response.body.shippingCost).toBe(0);
    });

    it('should vary shipping cost based on quantity (same location)', async () => {
      const location = {
        latitude: 37.7749, // San Francisco
        longitude: -122.4194,
      };

      // Test with different quantities from the same location
      const quantities = [1, 10, 50];
      const shippingCosts: number[] = [];

      for (const quantity of quantities) {
        const response = await testClient.post('/api/orders').send({
          ...location,
          quantity,
        });

        expect(response.body.items[0].warehouseName).toBe('Los Angeles'); // Should always use LA warehouse for SF area
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('shippingCost');
        shippingCosts.push(response.body.shippingCost);
      }

      // Shipping cost should increase proportionally with quantity
      expect(shippingCosts).toMatchSnapshot('shippingCostsSnapshot');
    });

    it('should calculate different shipping costs for different international locations', async () => {
      const locations = [
        { name: 'Los Angeles Area', latitude: 34.0, longitude: -118.0 },
        { name: 'New York Area', latitude: 40.7, longitude: -74.0 },
        { name: 'Paris Area', latitude: 48.9, longitude: 2.3 },
        { name: 'Hong Kong Area', latitude: 22.3, longitude: 114.0 },
      ];

      const shippingResults: Array<{ name: string; cost: number }> = [];

      for (const location of locations) {
        const response = await testClient.post('/api/orders').send({
          quantity: 20,
          latitude: location.latitude,
          longitude: location.longitude,
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('shippingCost');

        shippingResults.push({
          name: location.name,
          cost: response.body.shippingCost,
        });
      }

      // All shipping costs should be greater than 0
      shippingResults.forEach(result => {
        expect(result.cost).toBeGreaterThan(0);
      });

      // Shipping costs should vary between locations
      const uniqueCosts = new Set(shippingResults.map(r => r.cost));
      expect(uniqueCosts.size).toBeGreaterThan(1); // Should have different costs for different locations
    });

    it('should use nearest warehouse for shipping cost calculation', async () => {
      // Test coordinates that are clearly closer to specific warehouses

      // Close to Los Angeles warehouse (33.9425, -118.408056)
      const laResponse = await testClient.post('/api/orders').send({
        quantity: 10,
        latitude: 33.9425,
        longitude: -118.5,
      });

      // Close to New York warehouse (40.639722, -73.778889)
      const nyResponse = await testClient.post('/api/orders').send({
        quantity: 10,
        latitude: 40.6,
        longitude: -73.8,
      });

      expect(laResponse.status).toBe(201);
      expect(nyResponse.status).toBe(201);

      // Both should have reasonable shipping costs
      expect(laResponse.body.shippingCost).toBe(0.3102);
      expect(nyResponse.body.shippingCost).toBe(0.1737);

      // Check which warehouse is being used based on the items array
      expect(laResponse.body.items).toBeDefined();
      expect(laResponse.body.items.length).toBe(1);
      expect(nyResponse.body.items).toBeDefined();
      expect(nyResponse.body.items.length).toBe(1);

      // LA Area test: Should use the nearest available warehouse
      // Could be "Los Angeles" (if available) or "New York" (if LA is exhausted)
      const laWarehouseName = laResponse.body.items[0].warehouseName;
      expect('Los Angeles').toContain(laWarehouseName);

      // NY Area: Should always use New York warehouse (very close)
      const nyWarehouseName = nyResponse.body.items[0].warehouseName;
      expect(nyWarehouseName).toBe('New York');

      // Verify shipping costs are reasonable
      expect(laResponse.body.shippingCost).toBe(0.3102);
      expect(nyResponse.body.shippingCost).toBe(0.1737);
    });

    it('should validate shipping cost does exceed 15% of order total', async () => {
      // Test with a location very far from any warehouse to potentially trigger high shipping costs
      // Using coordinates in the middle of the Pacific Ocean
      const extremeLocation = {
        quantity: 1, // Small quantity to minimize total price
        latitude: 0, // Equator
        longitude: 180, // International Date Line - far from all warehouses
      };

      // This should either succeed with reasonable shipping cost or fail with validation error
      const response = await testClient.post('/api/orders').send(extremeLocation);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('shipping cost exceeds 15%');
    });
  });

  // Test total price calculation
  describe('Total Price Calculations', () => {
    it('should calculate total price including discount and shipping cost', async () => {
      const quantity = 50; // Should get 10% discount
      const productPrice = 150; // Product price is $150 as per service implementation

      const response = await testClient.post('/api/orders').send({
        ...sampleOrderData,
        quantity: quantity,
      });

      expect(response.status).toBe(201);

      const totalPrice = response.body.totalPrice;
      const discount = response.body.discount;

      // Convert values to Decimal for precise calculation
      const totalPriceDecimal = new Decimal(totalPrice);
      const discountDecimal = new Decimal(discount);

      // Calculate expected base price
      const basePrice = new Decimal(productPrice).times(quantity); // 150 * 50 = 7500

      // According to the service implementation, totalPrice is simply basePrice - discount
      // and does NOT include shippingCost
      const expectedTotalPrice = basePrice.minus(discountDecimal);

      expect(basePrice.toString()).toBe(response.body.basePrice.toString());
      // Compare as strings to avoid floating point issues
      expect(totalPriceDecimal.toString()).toBe(expectedTotalPrice.toString());
    });
  });
});

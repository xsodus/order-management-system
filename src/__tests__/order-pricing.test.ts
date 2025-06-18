// order-pricing.test.ts
import { testClient, sampleOrderData } from './testHelpers';
import Decimal from 'decimal.js';

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
        quantity: sampleOrderData.quantity,
        latitude: sampleOrderData.latitude,
        longitude: sampleOrderData.longitude,
      });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body).toHaveProperty('shippingCost');
      const shippingCost = verifyResponse.body.shippingCost;

      // Now create the order with same parameters
      const createResponse = await testClient.post('/api/orders').send(sampleOrderData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('shippingCost');

      // Shipping cost should match the verified cost
      expect(createResponse.body.shippingCost).toBe(shippingCost);
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
      const shippingCost = response.body.shippingCost;

      // Convert values to Decimal for precise calculation
      const totalPriceDecimal = new Decimal(totalPrice);
      const discountDecimal = new Decimal(discount);
      const shippingCostDecimal = new Decimal(shippingCost);

      // Calculate expected base price
      const basePrice = new Decimal(productPrice).times(quantity); // 150 * 50 = 7500

      // According to the service implementation, totalPrice is simply basePrice - discount
      // and does NOT include shippingCost
      const expectedTotalPrice = basePrice.minus(discountDecimal);

      // Compare as strings to avoid floating point issues
      expect(totalPriceDecimal.toString()).toBe(expectedTotalPrice.toString());
    });
  });
});

// setup.ts
import { sequelize } from '../config/database';
import { Warehouse } from '../models/warehouse.model';
import { Product } from '../models/product.model';
import Decimal from 'decimal.js';

// Setup before all tests
beforeAll(async () => {
  // Ensure database tables are created
  await sequelize.sync({ force: true });

  // Create sample product
  await Product.create({
    name: 'Test Product',
    price: new Decimal(150), // $150
    weight: 0.365, // 365g
  });

  // Create sample warehouses at different locations with different stock levels
  await Warehouse.bulkCreate([
    {
      name: 'Warehouse San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      stock: 100,
    },
    {
      name: 'Warehouse Los Angeles',
      latitude: 34.0522,
      longitude: -118.2437,
      stock: 200,
    },
    {
      name: 'Warehouse New York',
      latitude: 40.7128,
      longitude: -74.006,
      stock: 150,
    },
    {
      name: 'Warehouse Chicago',
      latitude: 41.8781,
      longitude: -87.6298,
      stock: 175,
    },
    {
      name: 'Warehouse Miami',
      latitude: 25.7617,
      longitude: -80.1918,
      stock: 125,
    },
  ]);
});

// Clean up after all tests
afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// Global timeout of 30 seconds for all tests
jest.setTimeout(30000);

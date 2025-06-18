// setup.ts
import { sequelize } from '../config/database';
import { testDatabase } from '../config/test-database';
import { Warehouse } from '../models/warehouse.model';
import { Product } from '../models/product.model';
import Decimal from 'decimal.js';

let testSequelize: any = null;

// Setup before all tests
beforeAll(async () => {
  try {
    // Use testcontainers for MySQL if explicitly enabled and Docker is available
    const useTestcontainers =
      process.env.USE_TESTCONTAINERS === 'true' && process.env.DB_DIALECT === 'mysql';

    if (useTestcontainers) {
      console.log('Attempting to use testcontainers for MySQL database...');
      try {
        testSequelize = await testDatabase.start();

        // Import models with the test database
        const { Warehouse: TestWarehouse } = require('../models/warehouse.model');
        const { Product: TestProduct } = require('../models/product.model');

        // Sync database with force: true to recreate tables
        await testSequelize.sync({ force: true });

        // Create sample product
        await TestProduct.create({
          name: 'Test Product',
          price: new Decimal(150), // $150
          weight: 0.365, // 365g
        });

        // Create sample warehouses
        await TestWarehouse.bulkCreate([
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

        console.log('Successfully set up testcontainers MySQL database');
      } catch (containerError: any) {
        console.warn(
          'Failed to start testcontainers, falling back to SQLite:',
          containerError?.message || 'Unknown error',
        );
        testSequelize = null;
      }
    }

    if (!testSequelize) {
      console.log('Using in-memory SQLite database for tests...');
      // Fallback to SQLite for CI or when testcontainers fails
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
    }
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
}, 120000); // 2 minutes timeout for container startup

// Clean up after all tests
afterAll(async () => {
  try {
    if (testSequelize) {
      await testDatabase.stop();
    } else {
      await sequelize.close();
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}, 30000);

// Global timeout of 60 seconds for all tests (increased for container operations)
jest.setTimeout(60000);

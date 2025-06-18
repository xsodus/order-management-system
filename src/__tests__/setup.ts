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
    console.log('Starting PostgreSQL test container...');
    testSequelize = await testDatabase.start();

    console.log('Successfully set up PostgreSQL test database');
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
}, 120000); // 2 minutes timeout for container startup

// Clean up after all tests
afterAll(async () => {
  try {
    await testDatabase.stop();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}, 30000);

// Global timeout of 60 seconds for all tests (increased for container operations)
jest.setTimeout(60000);

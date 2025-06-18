import { seedProducts } from '../models/product.model';
import { seedWarehouses } from '../models/warehouse.model';
import logger from '../utils/logger';
import { initDatabase } from './database';

export const setupDatabase = async (): Promise<void> => {
  try {
    // Initialize the database
    await initDatabase();

    // Seed products and warehouses
    await seedProducts();
    await seedWarehouses();

    logger.info('Database setup completed successfully!');
  } catch (error) {
    logger.error('Error setting up database:', error);
    throw error;
  }
};

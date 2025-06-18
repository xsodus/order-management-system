import { initDatabase, closeConnection } from '../config/database';
import { Warehouse } from '../models/warehouse.model';
import { Product } from '../models/product.model';
import { addPostGISGeography } from './add-postgis-geography';
import Decimal from 'decimal.js';
import logger from '../utils/logger';

async function migrate() {
  try {
    logger.info('Starting database migration...');

    // Initialize database connection and sync models
    await initDatabase();

    // Check if data already exists
    const productCount = await Product.count();
    const warehouseCount = await Warehouse.count();

    if (productCount === 0) {
      logger.info('Creating initial product data...');
      await Product.create({
        name: 'SCOS Station P1 Pro',
        price: new Decimal(150),
        weight: 0.365, // 365g in kg
      });
      logger.info('Product created successfully');
    } else {
      logger.info('Product data already exists, skipping...');
    }

    if (warehouseCount === 0) {
      logger.info('Creating initial warehouse data...');
      await Warehouse.bulkCreate([
        {
          name: 'Los Angeles',
          latitude: 33.9425,
          longitude: -118.408056,
          stock: 355,
        },
        {
          name: 'New York',
          latitude: 40.639722,
          longitude: -73.778889,
          stock: 578,
        },
        {
          name: 'São Paulo',
          latitude: -23.435556,
          longitude: -46.473056,
          stock: 265,
        },
        {
          name: 'Paris',
          latitude: 49.009722,
          longitude: 2.547778,
          stock: 694,
        },
        {
          name: 'Warsaw',
          latitude: 52.165833,
          longitude: 20.967222,
          stock: 245,
        },
        {
          name: 'Hong Kong',
          latitude: 22.308889,
          longitude: 113.914444,
          stock: 419,
        },
      ]);
      logger.info('Warehouses created successfully');
    } else {
      logger.info('Warehouse data already exists, skipping...');
    }

    // Run the PostGIS migration (add location column and populate it)
    await addPostGISGeography();

    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

export default migrate;

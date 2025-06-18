// warehouse-fixtures.test.ts
import { Warehouse } from '../models/warehouse.model';
import { Product } from '../models/product.model';
import { sequelize } from '../config/database';
import Decimal from 'decimal.js';

describe('Warehouse Fixtures Setup', () => {
  beforeAll(async () => {
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

  it('should have created warehouse fixtures', async () => {
    const warehouseCount = await Warehouse.count();
    expect(warehouseCount).toBe(5);

    const productCount = await Product.count();
    expect(productCount).toBe(1);
  });

  afterAll(async () => {
    // Clean up is handled by global setup
  });
});

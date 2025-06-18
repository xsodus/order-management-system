// warehouse-fixtures.test.ts
import { Warehouse } from '../models/warehouse.model';
import { Product } from '../models/product.model';
import { sequelize } from '../config/database';

describe('Warehouse Fixtures Setup', () => {
  it('should have created warehouse fixtures', async () => {
    // The warehouses and products are created in the global setup.ts file
    const warehouseCount = await Warehouse.count();
    expect(warehouseCount).toBe(5);

    const productCount = await Product.count();
    expect(productCount).toBe(1);
  });

  afterAll(async () => {
    // Clean up is handled by global setup
  });
});

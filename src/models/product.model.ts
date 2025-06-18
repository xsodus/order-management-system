import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import Decimal from 'decimal.js';

export interface ProductAttributes {
  id?: string;
  name: string;
  price: Decimal;
  weight: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product extends Model<ProductAttributes> implements ProductAttributes {
  public id!: string;
  public name!: string;
  public price!: Decimal;
  public weight!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Calculate discount based on quantity
   * @param quantity The number of units ordered
   * @returns The discount percentage (0-1)
   */
  public getDiscount(quantity: number): number {
    if (quantity >= 250) {
      return 0.2; // 20% discount
    } else if (quantity >= 100) {
      return 0.15; // 15% discount
    } else if (quantity >= 50) {
      return 0.1; // 10% discount
    } else if (quantity >= 25) {
      return 0.05; // 5% discount
    }
    return 0; // No discount
  }
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(15, 4), // Higher precision for financial calculations
      allowNull: false,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('price');
        return value === null ? null : new Decimal(value.toString());
      },
      set(value: number | string | Decimal) {
        // Store as string in DB but ensure proper conversion
        const stringValue = value instanceof Decimal ? value.toString() : String(value);
        // Use type assertion to handle the mismatch
        this.setDataValue('price', stringValue as any);
      },
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: 'products',
  },
);

// Function to seed products
export const seedProducts = async (): Promise<void> => {
  await Product.create({
    name: 'SCOS Station P1 Pro',
    price: new Decimal(150), // $150
    weight: 0.365, // 365g converted to kg
  });
  console.log('Products seeded successfully');
};

export default Product;

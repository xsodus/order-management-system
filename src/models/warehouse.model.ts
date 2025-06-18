import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import logger from '../utils/logger';

export interface WarehouseAttributes {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Warehouse extends Model<WarehouseAttributes> implements WarehouseAttributes {
  public id!: string;
  public name!: string;
  public latitude!: number;
  public longitude!: number;
  public stock!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to update stock
  async updateStock(quantity: number): Promise<void> {
    if (this.stock < quantity) {
      throw new Error(`Not enough stock available in warehouse ${this.name}`);
    }
    this.stock -= quantity;
    await this.save();
  }
}

Warehouse.init(
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
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: 'warehouses',
  },
);

// Function to seed warehouses
export const seedWarehouses = async (): Promise<void> => {
  const warehouses = [
    { name: 'Los Angeles', latitude: 33.9425, longitude: -118.408056, stock: 355 },
    { name: 'New York', latitude: 40.639722, longitude: -73.778889, stock: 578 },
    { name: 'São Paulo', latitude: -23.435556, longitude: -46.473056, stock: 265 },
    { name: 'Paris', latitude: 49.009722, longitude: 2.547778, stock: 694 },
    { name: 'Warsaw', latitude: 52.165833, longitude: 20.967222, stock: 245 },
    { name: 'Hong Kong', latitude: 22.308889, longitude: 113.914444, stock: 419 },
  ];

  await Warehouse.bulkCreate(warehouses);
  logger.info('Warehouses seeded successfully');
};

export default Warehouse;

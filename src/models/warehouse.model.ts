import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import logger from '../utils/logger';

export interface WarehouseAttributes {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  location?: any; // PostGIS GEOGRAPHY point
  stock: number;
}

export class Warehouse extends Model<WarehouseAttributes> implements WarehouseAttributes {
  public id!: string;
  public name!: string;
  public latitude!: number;
  public longitude!: number;
  public location?: any; // PostGIS GEOGRAPHY point
  public stock!: number;

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
    location: {
      type: DataTypes.GEOGRAPHY('POINT', 4326),
      allowNull: true,
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
    timestamps: false,
    hooks: {
      beforeCreate: (warehouse: Warehouse) => {
        // Automatically create location from latitude and longitude
        if (warehouse.latitude && warehouse.longitude) {
          warehouse.location = {
            type: 'Point',
            coordinates: [warehouse.longitude, warehouse.latitude],
            crs: { type: 'name', properties: { name: 'EPSG:4326' } },
          };
        }
      },
      beforeUpdate: (warehouse: Warehouse) => {
        // Update location if latitude or longitude changed
        if (warehouse.changed('latitude') || warehouse.changed('longitude')) {
          warehouse.location = {
            type: 'Point',
            coordinates: [warehouse.longitude, warehouse.latitude],
            crs: { type: 'name', properties: { name: 'EPSG:4326' } },
          };
        }
      },
    },
  },
);

// Function to seed warehouses
export const seedWarehouses = async (): Promise<void> => {
  const warehouses = [
    {
      name: 'Los Angeles',
      latitude: 33.9425,
      longitude: -118.408056,
      location: {
        type: 'Point',
        coordinates: [-118.408056, 33.9425],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      },
      stock: 355,
    },
    {
      name: 'New York',
      latitude: 40.639722,
      longitude: -73.778889,
      location: {
        type: 'Point',
        coordinates: [-73.778889, 40.639722],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      },
      stock: 578,
    },
    {
      name: 'São Paulo',
      latitude: -23.435556,
      longitude: -46.473056,
      location: {
        type: 'Point',
        coordinates: [-46.473056, -23.435556],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      },
      stock: 265,
    },
    {
      name: 'Paris',
      latitude: 49.009722,
      longitude: 2.547778,
      location: {
        type: 'Point',
        coordinates: [2.547778, 49.009722],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      },
      stock: 694,
    },
    {
      name: 'Warsaw',
      latitude: 52.165833,
      longitude: 20.967222,
      location: {
        type: 'Point',
        coordinates: [20.967222, 52.165833],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      },
      stock: 245,
    },
    {
      name: 'Hong Kong',
      latitude: 22.308889,
      longitude: 113.914444,
      location: {
        type: 'Point',
        coordinates: [113.914444, 22.308889],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      },
      stock: 419,
    },
  ];

  await Warehouse.bulkCreate(warehouses);
  logger.info('Warehouses seeded successfully');
};

export default Warehouse;

import { Transaction } from 'sequelize';
import { Warehouse, WarehouseAttributes } from '../models/warehouse.model';
import { CreateWarehouseDto, UpdateWarehouseStockDto } from '../dtos/warehouse.dto';
import logger from '../utils/logger';

export class WarehouseService {
  /**
   * Create a new warehouse
   */
  async createWarehouse(data: CreateWarehouseDto): Promise<Warehouse> {
    logger.info('Creating warehouse', { name: data.name, stock: data.stock });

    try {
      // Check if warehouse with the same name already exists
      const existingWarehouse = await Warehouse.findOne({
        where: { name: data.name },
      });

      if (existingWarehouse) {
        throw new Error(`Warehouse with name '${data.name}' already exists`);
      }

      const warehouse = await Warehouse.create({
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        stock: data.stock,
      });

      logger.info('Warehouse created successfully', {
        id: warehouse.id,
        name: warehouse.name,
      });

      return warehouse;
    } catch (error: any) {
      logger.error('Failed to create warehouse', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Get all warehouses
   */
  async getAllWarehouses(): Promise<Warehouse[]> {
    logger.info('Fetching all warehouses');

    try {
      const warehouses = await Warehouse.findAll({
        order: [['name', 'ASC']],
      });

      logger.info('Successfully fetched warehouses', { count: warehouses.length });
      return warehouses;
    } catch (error: any) {
      logger.error('Failed to fetch warehouses', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get warehouse by ID
   */
  async getWarehouseById(id: string): Promise<Warehouse> {
    logger.info('Fetching warehouse by ID', { id });

    try {
      const warehouse = await Warehouse.findByPk(id);

      if (!warehouse) {
        throw new Error(`Warehouse with ID '${id}' not found`);
      }

      logger.info('Successfully fetched warehouse', {
        id: warehouse.id,
        name: warehouse.name,
      });

      return warehouse;
    } catch (error: any) {
      logger.error('Failed to fetch warehouse', {
        error: error.message,
        id,
      });
      throw error;
    }
  }

  /**
   * Update warehouse stock
   */
  async updateWarehouseStock(
    id: string,
    data: UpdateWarehouseStockDto,
    transaction?: Transaction,
  ): Promise<Warehouse> {
    logger.info('Updating warehouse stock', { id, newStock: data.stock });

    try {
      const warehouse = await Warehouse.findByPk(id, { transaction });

      if (!warehouse) {
        throw new Error(`Warehouse with ID '${id}' not found`);
      }

      const oldStock = warehouse.stock;
      warehouse.stock = data.stock;
      await warehouse.save({ transaction });

      logger.info('Warehouse stock updated successfully', {
        id,
        oldStock,
        newStock: data.stock,
      });

      return warehouse;
    } catch (error: any) {
      logger.error('Failed to update warehouse stock', {
        error: error.message,
        id,
        data,
      });
      throw error;
    }
  }

  /**
   * Delete warehouse
   */
  async deleteWarehouse(id: string): Promise<void> {
    logger.info('Deleting warehouse', { id });

    try {
      const warehouse = await Warehouse.findByPk(id);

      if (!warehouse) {
        throw new Error(`Warehouse with ID '${id}' not found`);
      }

      await warehouse.destroy();

      logger.info('Warehouse deleted successfully', {
        id,
        name: warehouse.name,
      });
    } catch (error: any) {
      logger.error('Failed to delete warehouse', {
        error: error.message,
        id,
      });
      throw error;
    }
  }
}

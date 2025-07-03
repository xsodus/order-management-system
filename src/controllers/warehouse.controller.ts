import { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouse.service';
import { WarehouseMapper } from '../dtos/warehouse.dto';
import { getRequestLogger } from '../utils/logger/get-request-logger';

export class WarehouseController {
  private warehouseService: WarehouseService;

  constructor() {
    this.warehouseService = new WarehouseService();
  }

  /**
   * Create a new warehouse
   */
  async createWarehouse(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    logger.info('Creating warehouse', { body: req.body });

    try {
      const { name, latitude, longitude, stock } = req.body;

      logger.debug('Calling warehouse service to create warehouse', {
        name,
        latitude,
        longitude,
        stock,
      });

      const warehouse = await this.warehouseService.createWarehouse({
        name,
        latitude,
        longitude,
        stock,
      });

      logger.info('Warehouse created successfully', {
        id: warehouse.id,
        name: warehouse.name,
      });

      res.status(201).json(WarehouseMapper.toResponseDto(warehouse));
    } catch (error: any) {
      logger.error('Failed to create warehouse', {
        error: error.message,
        stack: error.stack,
      });

      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to create warehouse',
      });
    }
  }

  /**
   * Get all warehouses
   */
  async getAllWarehouses(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    logger.info('Fetching all warehouses');

    try {
      const warehouses = await this.warehouseService.getAllWarehouses();

      logger.info('Successfully fetched warehouses', {
        count: warehouses.length,
      });

      res.status(200).json(WarehouseMapper.toResponseDtoList(warehouses));
    } catch (error: any) {
      logger.error('Failed to fetch warehouses', {
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch warehouses',
      });
    }
  }

  /**
   * Get warehouse by ID
   */
  async getWarehouseById(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    const { id } = req.params;
    logger.info('Fetching warehouse by ID', { id });

    try {
      const warehouse = await this.warehouseService.getWarehouseById(id);

      logger.info('Successfully fetched warehouse', {
        id: warehouse.id,
        name: warehouse.name,
      });

      res.status(200).json(WarehouseMapper.toResponseDto(warehouse));
    } catch (error: any) {
      logger.error('Failed to fetch warehouse', {
        error: error.message,
        stack: error.stack,
        id,
      });

      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to fetch warehouse',
      });
    }
  }

  /**
   * Update warehouse stock
   */
  async updateWarehouseStock(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    const { id } = req.params;
    const { stock } = req.body;

    logger.info('Updating warehouse stock', { id, stock });

    try {
      const warehouse = await this.warehouseService.updateWarehouseStock(id, { stock });

      logger.info('Warehouse stock updated successfully', {
        id: warehouse.id,
        newStock: warehouse.stock,
      });

      res.status(200).json(WarehouseMapper.toResponseDto(warehouse));
    } catch (error: any) {
      logger.error('Failed to update warehouse stock', {
        error: error.message,
        stack: error.stack,
        id,
        stock,
      });

      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to update warehouse stock',
      });
    }
  }

  /**
   * Delete warehouse
   */
  async deleteWarehouse(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    const { id } = req.params;
    logger.info('Deleting warehouse', { id });

    try {
      await this.warehouseService.deleteWarehouse(id);

      logger.info('Warehouse deleted successfully', { id });

      res.status(204).send();
    } catch (error: any) {
      logger.error('Failed to delete warehouse', {
        error: error.message,
        stack: error.stack,
        id,
      });

      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to delete warehouse',
      });
    }
  }
}

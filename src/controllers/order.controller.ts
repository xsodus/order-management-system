import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderMapper } from '../dtos/order.dto';
import { getRequestLogger } from '../utils/logger/get-request-logger';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Verify an order without submitting
   */
  async verifyOrder(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    logger.info('Verifying order', { query: req.query });

    try {
      const { quantity, latitude, longitude } = req.query;

      logger.debug('Calling order service to verify order', {
        quantity: Number(quantity),
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      const result = await this.orderService.verifyOrder({
        quantity: Number(quantity),
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      logger.info('Order verified successfully', {
        totalPrice: result.totalPrice,
      });
      res.status(200).json(OrderMapper.toResponseDto(result));
    } catch (error: any) {
      logger.error('Failed to verify order', {
        error: error.message,
        stack: error.stack,
      });

      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to verify order',
      });
    }
  }

  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    logger.info('Creating new order', { body: req.body });

    try {
      const { quantity, latitude, longitude } = req.body;

      logger.debug('Calling order service to create order', {
        quantity: Number(quantity),
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      const order = await this.orderService.createOrder({
        quantity: Number(quantity),
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      logger.info('Order created successfully', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      });

      res.status(201).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
      logger.error('Failed to create order', {
        error: error.message,
        stack: error.stack,
      });

      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to create order',
      });
    }
  }

  /**
   * Get all orders
   */
  async getOrders(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    logger.info('Retrieving orders');
    try {
      const { orders, total } = await this.orderService.getOrders();
      // Merge warehouse data into each order's items
      const warehouseIds = Array.from(
        new Set(
          orders.flatMap((order: any) => (order.items || []).map((item: any) => item.warehouseId)),
        ),
      );
      // Fetch all warehouses in one query
      const warehouses = await (
        await import('../models/warehouse.model')
      ).default.findAll({
        where: { id: warehouseIds },
        raw: true,
      });
      const warehouseMap = new Map(warehouses.map((w: any) => [w.id, w]));
      // Attach warehouse info to each item
      for (const order of orders) {
        if (order.items) {
          for (const item of order.items) {
            const warehouse = warehouseMap.get(item.warehouseId);
            if (warehouse) {
              item.warehouseName = warehouse.name;
              item.latitude = warehouse.latitude;
              item.longitude = warehouse.longitude;
              item.stock = warehouse.stock;
            }
          }
        }
      }
      res.status(200).json(OrderMapper.toListResponseDto(orders, total));
    } catch (error: any) {
      logger.error('Failed to retrieve orders', {
        error: error.message,
        stack: error.stack,
      });
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to retrieve orders',
      });
    }
  }
}

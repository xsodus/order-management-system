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

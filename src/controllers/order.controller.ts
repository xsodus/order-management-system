import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderMapper } from '../dtos/order.dto';
import { OrderStatus } from '../models/order.model';
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

      if (!quantity || !latitude || !longitude) {
        logger.warn('Missing required parameters for order verification', {
          quantity: quantity || 'missing',
          latitude: latitude || 'missing',
          longitude: longitude || 'missing',
        });

        res.status(400).json({
          status: 'error',
          message: 'Quantity, latitude and longitude are required',
        });
        return;
      }

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

      if (!quantity || !latitude || !longitude) {
        logger.warn('Missing required parameters for order creation', {
          quantity: quantity || 'missing',
          latitude: latitude || 'missing',
          longitude: longitude || 'missing',
        });

        res.status(400).json({
          status: 'error',
          message: 'Quantity, latitude and longitude are required',
        });
        return;
      }

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
   * Get all orders with optional filtering
   */
  async getOrders(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    logger.info('Retrieving orders', { query: req.query });

    try {
      const filters = {
        status: req.query.status as OrderStatus,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      logger.debug('Applying filters to order query', { filters });
      const { orders, total } = await this.orderService.getOrders(filters);

      logger.info('Orders retrieved successfully', {
        count: orders.length,
        total,
        page: filters.page,
        limit: filters.limit,
      });

      res
        .status(200)
        .json(OrderMapper.toListResponseDto(orders, total, filters.page, filters.limit));
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

  /**
   * Get a specific order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    const orderId = req.params.id;

    logger.info('Retrieving order by ID', { orderId });

    try {
      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        logger.warn('Order not found', { orderId });
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }

      logger.info('Order retrieved successfully', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      });

      res.status(200).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
      logger.error('Failed to retrieve order', {
        orderId,
        error: error.message,
        stack: error.stack,
      });

      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to retrieve order',
      });
    }
  }

  /**
   * Update an order's status
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    const orderId = req.params.id;

    logger.info('Updating order status', {
      orderId,
      newStatus: req.body.status,
    });

    try {
      const order = await this.orderService.updateOrderStatus(orderId, req.body);

      if (!order) {
        logger.warn('Order not found for status update', { orderId });
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }

      logger.info('Order status updated successfully', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        newStatus: order.status,
      });

      res.status(200).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
      logger.error('Failed to update order status', {
        orderId,
        error: error.message,
        stack: error.stack,
      });

      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update order status',
      });
    }
  }

  /**
   * Delete an order
   */
  async deleteOrder(req: Request, res: Response): Promise<void> {
    const logger = getRequestLogger(req);
    const orderId = req.params.id;

    logger.info('Deleting order', { orderId });

    try {
      const success = await this.orderService.deleteOrder(orderId);

      if (!success) {
        logger.warn('Order not found for deletion', { orderId });
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }

      logger.info('Order deleted successfully', { orderId });
      res.status(204).send();
    } catch (error: any) {
      logger.error('Failed to delete order', {
        orderId,
        error: error.message,
        stack: error.stack,
      });
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to delete order',
      });
    }
  }
}

import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderMapper } from '../dtos/order.dto';
import { OrderStatus } from '../models/order.model';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await this.orderService.createOrder(req.body);
      res.status(201).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
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
    try {
      const filters = {
        customerId: req.query.customerId as string,
        status: req.query.status as OrderStatus,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const { orders, total } = await this.orderService.getOrders(filters);

      res
        .status(200)
        .json(OrderMapper.toListResponseDto(orders, total, filters.page, filters.limit));
    } catch (error: any) {
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
    try {
      const orderId = req.params.id;
      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
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
    try {
      const orderId = req.params.id;
      const order = await this.orderService.updateOrderStatus(orderId, req.body);

      if (!order) {
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update order status',
      });
    }
  }

  /**
   * Add an item to an existing order
   */
  async addOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const order = await this.orderService.addOrderItem(orderId, req.body);

      if (!order) {
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to add order item',
      });
    }
  }

  /**
   * Update an existing order item
   */
  async updateOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const itemId = req.params.itemId;

      const order = await this.orderService.updateOrderItem(orderId, {
        itemId,
        ...req.body,
      });

      if (!order) {
        res.status(404).json({
          status: 'error',
          message: 'Order or order item not found',
        });
        return;
      }

      res.status(200).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update order item',
      });
    }
  }

  /**
   * Remove an item from an order
   */
  async removeOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const itemId = req.params.itemId;

      const order = await this.orderService.removeOrderItem(orderId, itemId);

      if (!order) {
        res.status(404).json({
          status: 'error',
          message: 'Order or order item not found',
        });
        return;
      }

      res.status(200).json(OrderMapper.toResponseDto(order));
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to remove order item',
      });
    }
  }

  /**
   * Delete an order
   */
  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const success = await this.orderService.deleteOrder(orderId);

      if (!success) {
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to delete order',
      });
    }
  }
}

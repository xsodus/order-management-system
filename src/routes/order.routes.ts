import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateVerifyOrder,
  validateGetOrderById,
  validateDeleteOrder,
  validateOrderFilters,
} from '../middlewares/order.validation';

const router = Router();
const orderController = new OrderController();

// Verify order without submitting
router.get('/verify', validateVerifyOrder, orderController.verifyOrder.bind(orderController));

// Create a new order
router.post('/', validateCreateOrder, orderController.createOrder.bind(orderController));

// Get all orders with optional filtering
router.get('/', validateOrderFilters, orderController.getOrders.bind(orderController));

// Get a specific order
router.get('/:id', validateGetOrderById, orderController.getOrderById.bind(orderController));

// Update order status
router.patch(
  '/:id/status',
  validateUpdateOrderStatus,
  orderController.updateOrderStatus.bind(orderController),
);

// Delete an order
router.delete('/:id', validateDeleteOrder, orderController.deleteOrder.bind(orderController));

export default router;

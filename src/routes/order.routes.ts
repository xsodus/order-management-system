import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateAddOrderItem,
  validateUpdateOrderItem,
  validateRemoveOrderItem,
  validateGetOrderById,
  validateDeleteOrder,
  validateOrderFilters,
} from '../middlewares/order.validation';

const router = Router();
const orderController = new OrderController();

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

// Add item to order
router.post('/:id/items', validateAddOrderItem, orderController.addOrderItem.bind(orderController));

// Update order item
router.patch(
  '/:id/items/:itemId',
  validateUpdateOrderItem,
  orderController.updateOrderItem.bind(orderController),
);

// Remove item from order
router.delete(
  '/:id/items/:itemId',
  validateRemoveOrderItem,
  orderController.removeOrderItem.bind(orderController),
);

// Delete an order
router.delete('/:id', validateDeleteOrder, orderController.deleteOrder.bind(orderController));

export default router;

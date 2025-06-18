import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();
const orderController = new OrderController();

// Create a new order
router.post('/', orderController.createOrder.bind(orderController));

// Get all orders with optional filtering
router.get('/', orderController.getOrders.bind(orderController));

// Get a specific order
router.get('/:id', orderController.getOrderById.bind(orderController));

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus.bind(orderController));

// Add item to order
router.post('/:id/items', orderController.addOrderItem.bind(orderController));

// Update order item
router.patch('/:id/items/:itemId', orderController.updateOrderItem.bind(orderController));

// Remove item from order
router.delete('/:id/items/:itemId', orderController.removeOrderItem.bind(orderController));

// Delete an order
router.delete('/:id', orderController.deleteOrder.bind(orderController));

export default router;

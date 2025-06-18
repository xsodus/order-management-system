import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateCreateOrder, validateVerifyOrder } from '../middlewares/order.validation';

const router = Router();
const orderController = new OrderController();

/**
 * @openapi
 * /orders/verify:
 *   get:
 *     summary: Verify a potential order without submitting
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of devices to order
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: double
 *         required: true
 *         description: Latitude of the shipping address
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: double
 *         required: true
 *         description: Longitude of the shipping address
 *     responses:
 *       200:
 *         description: Order verification result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDto'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/verify', validateVerifyOrder, orderController.verifyOrder.bind(orderController));

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDto'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDto'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', validateCreateOrder, orderController.createOrder.bind(orderController));

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderResponseDto'
 */
router.get('/', orderController.getOrders.bind(orderController));

export default router;

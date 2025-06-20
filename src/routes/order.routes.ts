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
 *     description: |
 *       Calculates pricing, shipping costs, and warehouse allocation for a potential order without actually creating it.
 *       This endpoint helps users understand the total cost and delivery logistics before placing an order.
 *
 *       **Pricing Rules:**
 *       - Base price: $150 per device
 *       - Quantity discounts: 5% (25+), 10% (50+), 15% (100+), 20% (250+)
 *
 *       **Shipping Calculation:**
 *       - Rate: $0.01 per kg per km
 *       - Device weight: 365g
 *       - Optimized warehouse allocation to minimize shipping costs
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: Number of devices to order
 *         example: 100
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         required: true
 *         description: Latitude of the shipping address (decimal degrees)
 *         example: 40.712776
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         required: true
 *         description: Longitude of the shipping address (decimal degrees)
 *         example: -74.005974
 *     responses:
 *       200:
 *         description: Order verification result with pricing and warehouse allocation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDto'
 *             example:
 *               quantity: 100
 *               latitude: 40.712776
 *               longitude: -74.005974
 *               basePrice: 15000.0
 *               totalPrice: 12750.0
 *               discount: 2250.0
 *               shippingCost: 45.2
 *               items:
 *                 - warehouseId: "warehouse-1"
 *                   warehouseName: "NYC Warehouse"
 *                   quantity: 60
 *                   distance: 15.2
 *                   shippingCost: 33.3
 *                   latitude: 40.7589
 *                   longitude: -73.9851
 *                 - warehouseId: "warehouse-2"
 *                   warehouseName: "NJ Warehouse"
 *                   quantity: 40
 *                   distance: 25.8
 *                   shippingCost: 11.9
 *                   latitude: 40.6892
 *                   longitude: -74.0445
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/verify', validateVerifyOrder, orderController.verifyOrder.bind(orderController));

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: |
 *       Creates a new order in the system with optimized warehouse allocation and pricing.
 *       The order will be saved with status 'PENDING' and can be tracked using the returned order ID.
 *
 *       **Important:** This endpoint will actually create the order and allocate inventory.
 *       Use the verify endpoint first to preview costs and allocation.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDto'
 *           example:
 *             quantity: 50
 *             latitude: 40.712776
 *             longitude: -74.005974
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDto'
 *             example:
 *               id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *               orderNumber: "ORD-123456"
 *               quantity: 50
 *               latitude: 40.712776
 *               longitude: -74.005974
 *               basePrice: 7500.0
 *               totalPrice: 6750.0
 *               discount: 750.0
 *               shippingCost: 22.6
 *               status: "PENDING"
 *               items:
 *                 - warehouseId: "warehouse-1"
 *                   warehouseName: "NYC Warehouse"
 *                   quantity: 50
 *                   distance: 15.2
 *                   shippingCost: 22.6
 *                   latitude: 40.7589
 *                   longitude: -73.9851
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', validateCreateOrder, orderController.createOrder.bind(orderController));

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Get all orders
 *     description: |
 *       Retrieves a list of all orders in the system with their complete details including
 *       warehouse allocations, pricing information, and current status.
 *
 *       Orders are returned with full warehouse information merged into the items array.
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders with complete details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderResponseDto'
 *             example:
 *               - id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                 orderNumber: "ORD-123456"
 *                 quantity: 50
 *                 latitude: 40.712776
 *                 longitude: -74.005974
 *                 basePrice: 7500.0
 *                 totalPrice: 6750.0
 *                 discount: 750.0
 *                 shippingCost: 22.6
 *                 status: "PENDING"
 *                 items:
 *                   - warehouseId: "warehouse-1"
 *                     warehouseName: "NYC Warehouse"
 *                     quantity: 50
 *                     distance: 15.2
 *                     shippingCost: 22.6
 *                     latitude: 40.7589
 *                     longitude: -73.9851
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *               - id: "4gb96g75-6828-5673-c4gd-3d074g77bgb7"
 *                 orderNumber: "ORD-789012"
 *                 quantity: 25
 *                 latitude: 34.052235
 *                 longitude: -118.243683
 *                 basePrice: 3750.0
 *                 totalPrice: 3562.5
 *                 discount: 187.5
 *                 shippingCost: 18.3
 *                 status: "COMPLETED"
 *                 items:
 *                   - warehouseId: "warehouse-3"
 *                     warehouseName: "LA Warehouse"
 *                     quantity: 25
 *                     distance: 12.7
 *                     shippingCost: 18.3
 *                     latitude: 34.0522
 *                     longitude: -118.2437
 *                 createdAt: "2024-01-14T14:20:00.000Z"
 *                 updatedAt: "2024-01-14T15:45:00.000Z"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', orderController.getOrders.bind(orderController));

export default router;

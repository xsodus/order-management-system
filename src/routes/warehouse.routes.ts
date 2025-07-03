import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller';
import {
  validateCreateWarehouse,
  validateUpdateWarehouseStock,
  validateWarehouseId,
} from '../middlewares/warehouse.validation';

const router = Router();
const warehouseController = new WarehouseController();

/**
 * @openapi
 * /warehouses:
 *   post:
 *     summary: Create a new warehouse
 *     description: |
 *       Creates a new warehouse in the system with the specified location and initial stock.
 *       The warehouse location is automatically converted to PostGIS geography format for
 *       spatial distance calculations.
 *
 *       **Important Notes:**
 *       - Warehouse names must be unique across the system
 *       - Coordinates will be validated and used for shipping cost calculations
 *       - Initial stock must be non-negative
 *     tags: [Warehouses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWarehouseDto'
 *           example:
 *             name: "Seattle Distribution Center"
 *             latitude: 47.608013
 *             longitude: -122.335167
 *             stock: 500
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponseDto'
 *             example:
 *               id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *               name: "Seattle Distribution Center"
 *               latitude: 47.608013
 *               longitude: -122.335167
 *               stock: 500
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/',
  validateCreateWarehouse,
  warehouseController.createWarehouse.bind(warehouseController),
);

/**
 * @openapi
 * /warehouses:
 *   get:
 *     summary: Get all warehouses
 *     description: |
 *       Retrieves a list of all warehouses in the system with their current stock levels
 *       and location information. Warehouses are sorted alphabetically by name.
 *
 *       This endpoint is useful for:
 *       - Viewing inventory across all locations
 *       - Planning warehouse operations
 *       - Monitoring stock distribution
 *     tags: [Warehouses]
 *     responses:
 *       200:
 *         description: List of all warehouses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WarehouseResponseDto'
 *             example:
 *               - id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                 name: "Hong Kong"
 *                 latitude: 22.308889
 *                 longitude: 113.914444
 *                 stock: 419
 *                 createdAt: "2024-01-10T08:00:00.000Z"
 *                 updatedAt: "2024-01-15T14:30:00.000Z"
 *               - id: "4gb96g75-6828-5673-c4gd-3d074g77bgb7"
 *                 name: "Los Angeles"
 *                 latitude: 33.9425
 *                 longitude: -118.408056
 *                 stock: 355
 *                 createdAt: "2024-01-10T08:00:00.000Z"
 *                 updatedAt: "2024-01-14T12:15:00.000Z"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', warehouseController.getAllWarehouses.bind(warehouseController));

/**
 * @openapi
 * /warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     description: |
 *       Retrieves detailed information about a specific warehouse including
 *       current stock levels and location coordinates.
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the warehouse
 *         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *     responses:
 *       200:
 *         description: Warehouse details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponseDto'
 *             example:
 *               id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *               name: "New York"
 *               latitude: 40.639722
 *               longitude: -73.778889
 *               stock: 578
 *               createdAt: "2024-01-10T08:00:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: Warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Warehouse with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' not found"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/:id',
  validateWarehouseId,
  warehouseController.getWarehouseById.bind(warehouseController),
);

/**
 * @openapi
 * /warehouses/{id}/stock:
 *   put:
 *     summary: Update warehouse stock
 *     description: |
 *       Updates the stock level for a specific warehouse. This endpoint allows
 *       warehouse managers to adjust inventory levels after receiving shipments
 *       or conducting stock audits.
 *
 *       **Use Cases:**
 *       - Restocking after supplier deliveries
 *       - Inventory adjustments after stock audits
 *       - Correcting stock discrepancies
 *
 *       **Important:** This operation directly sets the stock level rather than
 *       adding or subtracting from the current level.
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the warehouse
 *         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWarehouseStockDto'
 *           example:
 *             stock: 750
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponseDto'
 *             example:
 *               id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *               name: "New York"
 *               latitude: 40.639722
 *               longitude: -73.778889
 *               stock: 750
 *               createdAt: "2024-01-10T08:00:00.000Z"
 *               updatedAt: "2024-01-15T15:45:00.000Z"
 *       404:
 *         description: Warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Warehouse with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' not found"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  '/:id/stock',
  validateUpdateWarehouseStock,
  warehouseController.updateWarehouseStock.bind(warehouseController),
);

/**
 * @openapi
 * /warehouses/{id}:
 *   delete:
 *     summary: Delete warehouse
 *     description: |
 *       Permanently removes a warehouse from the system. This operation cannot be undone.
 *
 *       **Warning:** Only delete warehouses that are no longer in use and have no
 *       associated orders or active inventory. This operation should be used with caution
 *       in production environments.
 *
 *       **Prerequisites:**
 *       - Warehouse should have zero stock or stock should be transferred elsewhere
 *       - No active orders should be associated with this warehouse
 *       - Consider deactivating instead of deleting for audit trail purposes
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the warehouse to delete
 *         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *     responses:
 *       204:
 *         description: Warehouse deleted successfully
 *       404:
 *         description: Warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Warehouse with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' not found"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  '/:id',
  validateWarehouseId,
  warehouseController.deleteWarehouse.bind(warehouseController),
);

export default router;

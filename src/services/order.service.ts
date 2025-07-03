import Order, { OrderItem, OrderStatus } from '../models/order.model';
import Warehouse from '../models/warehouse.model';
import { QueryTypes, Transaction } from 'sequelize';
import Decimal from 'decimal.js';
import { sequelize } from '../config/database';
import logger from '../utils/logger';

interface VerifyOrderDto {
  quantity: number;
  latitude: number;
  longitude: number;
}

interface CreateOrderDto {
  quantity: number;
  latitude: number;
  longitude: number;
}

interface OrderResult {
  id?: string;
  orderNumber?: string;
  quantity: number;
  latitude: number;
  longitude: number;
  basePrice: Decimal;
  totalPrice: Decimal;
  discount: Decimal;
  shippingCost: Decimal;
  status?: OrderStatus;
  items?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface WarehouseAllocation {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  distance: number;
  shippingCost: Decimal;
  latitude: number;
  longitude: number;
}

export class OrderService {
  private SHIPPING_RATE = new Decimal(0.01); // $0.01 per kg per km
  private DEVICE_WEIGHT_KG = new Decimal(0.365); // 365g in kg
  private DEVICE_PRICE = new Decimal(150); // $150

  /**
   * Calculate discount based on quantity
   */
  private calculateDiscount(quantity: number): Decimal {
    if (quantity >= 250) return new Decimal(0.2);
    if (quantity >= 100) return new Decimal(0.15);
    if (quantity >= 50) return new Decimal(0.1);
    if (quantity >= 25) return new Decimal(0.05);
    return new Decimal(0);
  }

  /**
   * Find optimal warehouse allocation to minimize shipping cost
   * Uses SQL-based distance calculation for better performance
   * Now supports transactions with row locking
   */
  private async findOptimalWarehouses(
    quantity: number,
    latitude: number,
    longitude: number,
    transaction?: Transaction,
  ): Promise<WarehouseAllocation[]> {
    // Use SQL query to calculate distances and sort warehouses by proximity
    // This is much more efficient than fetching all warehouses and calculating distances in JavaScript
    const warehousesWithDistance = await this.getWarehousesByDistance(
      latitude,
      longitude,
      transaction,
    );

    logger.debug(
      `Found ${warehousesWithDistance.length} warehouses with stock for allocation` +
        JSON.stringify(warehousesWithDistance, null, 2),
    );
    // Allocate products from warehouses
    const allocations: WarehouseAllocation[] = [];
    let remainingQuantity = quantity;

    for (const warehouseData of warehousesWithDistance) {
      if (remainingQuantity <= 0) break;

      // Determine how many can be shipped from this warehouse
      const quantityFromWarehouse = Math.min(warehouseData.stock, remainingQuantity);

      if (quantityFromWarehouse > 0) {
        // Calculate shipping cost for this allocation
        const shippingCost = this.SHIPPING_RATE.mul(new Decimal(quantityFromWarehouse))
          .mul(this.DEVICE_WEIGHT_KG)
          .mul(new Decimal(warehouseData.distance));

        allocations.push({
          warehouseId: warehouseData.id,
          warehouseName: warehouseData.name,
          quantity: quantityFromWarehouse,
          distance: warehouseData.distance,
          latitude: warehouseData.latitude,
          longitude: warehouseData.longitude,
          shippingCost,
        });

        remainingQuantity -= quantityFromWarehouse;
      }
    }

    // Check if all requested quantity could be allocated
    if (remainingQuantity > 0) {
      throw new Error(
        `Cannot fulfill order: ${remainingQuantity} units couldn't be allocated due to insufficient stock`,
      );
    }

    return allocations;
  }

  /**
   * Get warehouses ordered by distance using PostGIS spatial calculations
   * Optimized for PostgreSQL with PostGIS extension
   * Now supports transactions with row locking for consistent reads
   */
  private async getWarehousesByDistance(
    targetLat: number,
    targetLng: number,
    transaction?: Transaction,
  ): Promise<
    Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      stock: number;
      distance: number;
    }>
  > {
    // Use PostgreSQL with PostGIS for distance calculation
    // Add FOR UPDATE to lock rows when in a transaction (for createOrder)
    const lockClause = transaction ? 'FOR UPDATE' : '';

    const query = `
      SELECT 
        id,
        name,
        latitude,
        longitude,
        stock,
        -- Use ST_Distance with the geography type for accurate distance in meters
        -- Divide by 1000 to convert to kilometers
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(:targetLng, :targetLat), 4326)::geography
          ) / 1000 AS distance
        FROM warehouses
        WHERE stock > 0
        ORDER BY distance ASC
        ${lockClause}
      `;
    const replacements = { targetLat, targetLng };

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
      transaction,
    });

    return results as Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      stock: number;
      distance: number;
    }>;
  }

  /**
   * Calculate total price, discount, and shipping cost
   */
  private calculateOrderCosts(
    quantity: number,
    allocations: WarehouseAllocation[],
  ): { basePrice: Decimal; totalPrice: Decimal; discount: Decimal; shippingCost: Decimal } {
    // Calculate base price
    const basePrice = this.DEVICE_PRICE.mul(new Decimal(quantity));

    // Calculate discount
    const discountRate = this.calculateDiscount(quantity);
    const discount = basePrice.mul(discountRate);

    // Calculate shipping cost (sum of shipping costs from all warehouses)
    const shippingCost = allocations.reduce(
      (sum, allocation) => sum.add(allocation.shippingCost),
      new Decimal(0),
    );

    // Calculate total price after discount
    const totalPrice = basePrice.minus(discount);

    return {
      basePrice,
      totalPrice,
      discount,
      shippingCost,
    };
  }

  /**
   * Check if shipping cost exceeds limit
   */
  private validateShippingCost(totalPrice: Decimal, shippingCost: Decimal): void {
    // Order is invalid if shipping cost exceeds 15% of order amount after discount
    if (shippingCost.gt(totalPrice.mul(new Decimal(0.15)))) {
      throw new Error('Order is invalid: shipping cost exceeds 15% of order amount');
    }
  }

  /**
   * Verify a potential order without submitting
   * Now supports transactions for consistency when called within createOrder
   */
  async verifyOrder(orderData: VerifyOrderDto, transaction?: Transaction): Promise<OrderResult> {
    try {
      const { quantity, latitude, longitude } = orderData;

      // Find optimal warehouse allocation
      const allocations = await this.findOptimalWarehouses(
        quantity,
        latitude,
        longitude,
        transaction,
      );

      // Calculate costs
      const { basePrice, totalPrice, discount, shippingCost } = this.calculateOrderCosts(
        quantity,
        allocations,
      );

      // Validate shipping cost - will throw error if invalid
      this.validateShippingCost(totalPrice, shippingCost);

      return {
        quantity,
        latitude,
        longitude,
        basePrice,
        totalPrice,
        discount,
        shippingCost,
        items: allocations,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Error verifying order');
    }
  }

  /**
   * Create a new order with transaction and row locking for inventory consistency
   */
  async createOrder(orderData: CreateOrderDto): Promise<OrderResult> {
    // Use a transaction to ensure data consistency and prevent race conditions
    return await sequelize.transaction(async (transaction: Transaction) => {
      try {
        const { quantity, latitude, longitude } = orderData;

        // Verify the order within the transaction with row locking
        // This will lock warehouse rows to prevent concurrent modifications
        const verification = await this.verifyOrder(orderData, transaction);

        // Create order in database within the transaction
        const order = await Order.create(
          {
            quantity,
            latitude,
            longitude,
            totalPrice: verification.totalPrice,
            discount: verification.discount,
            shippingCost: verification.shippingCost,
            status: OrderStatus.PENDING,
          },
          { transaction },
        );

        // Create order items and update warehouse inventory within the transaction
        const allocations = verification.items as WarehouseAllocation[];

        for (const allocation of allocations) {
          // Create order item within the transaction
          await OrderItem.create(
            {
              orderId: order.id,
              warehouseId: allocation.warehouseId,
              quantity: allocation.quantity,
              shippingCost: allocation.shippingCost, // Store shippingCost per item
            },
            { transaction },
          );

          // Find and lock the warehouse row for update
          const warehouse = await Warehouse.findByPk(allocation.warehouseId, {
            transaction,
            lock: transaction.LOCK.UPDATE, // Lock the row for update
          });

          if (!warehouse) {
            throw new Error(`Warehouse ${allocation.warehouseId} not found`);
          }

          // Double-check stock availability after locking (in case it changed)
          if (warehouse.stock < allocation.quantity) {
            throw new Error(
              `Insufficient stock in warehouse ${warehouse.name}. Available: ${warehouse.stock}, Required: ${allocation.quantity}`,
            );
          }

          // Update warehouse inventory within the transaction
          await warehouse.updateStock(allocation.quantity, transaction);
        }

        // Return the created order with all details
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          quantity: order.quantity,
          latitude: order.latitude,
          longitude: order.longitude,
          basePrice: verification.basePrice,
          totalPrice:
            order.totalPrice instanceof Decimal ? order.totalPrice : new Decimal(order.totalPrice),
          discount:
            order.discount instanceof Decimal ? order.discount : new Decimal(order.discount),
          shippingCost:
            order.shippingCost instanceof Decimal
              ? order.shippingCost
              : new Decimal(order.shippingCost),
          status: order.status,
          items: allocations,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      } catch (error: any) {
        // Transaction will be automatically rolled back
        logger.error('Error creating order, transaction rolled back', {
          error: error.message,
          stack: error.stack,
        });
        transaction.rollback();
        throw new Error(error.message || 'Failed to create order');
      }
    });
  }

  /**
   * Get all orders (no filtering)
   */
  async getOrders(): Promise<{ orders: Order[]; total: number }> {
    const { count, rows } = await Order.findAndCountAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return {
      orders: rows,
      total: count,
    };
  }
}

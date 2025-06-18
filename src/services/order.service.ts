import Order, { OrderItem, OrderStatus } from '../models/order.model';
import Product from '../models/product.model';
import Warehouse from '../models/warehouse.model';
import { Op, QueryTypes } from 'sequelize';
import { OrderFilterDto } from '../dtos/order.dto';
import Decimal from 'decimal.js';
import { sequelize } from '../config/database';

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
}

export class OrderService {
  private SHIPPING_RATE = new Decimal(0.01); // $0.01 per kg per km
  private DEVICE_WEIGHT_KG = new Decimal(0.365); // 365g in kg
  private DEVICE_PRICE = new Decimal(150); // $150

  /**
   * Calculate distance between two points using Haversine formula
   * @param lat1 Latitude of point 1
   * @param lon1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lon2 Longitude of point 2
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

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
   */
  private async findOptimalWarehouses(
    quantity: number,
    latitude: number,
    longitude: number,
  ): Promise<WarehouseAllocation[]> {
    // Use SQL query to calculate distances and sort warehouses by proximity
    // This is much more efficient than fetching all warehouses and calculating distances in JavaScript
    const warehousesWithDistance = await this.getWarehousesByDistance(latitude, longitude);

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
   */
  private async getWarehousesByDistance(
    targetLat: number,
    targetLng: number,
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
      `;
    const replacements = { targetLat, targetLng };

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
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
   */
  async verifyOrder(orderData: VerifyOrderDto): Promise<OrderResult> {
    try {
      const { quantity, latitude, longitude } = orderData;

      // Find optimal warehouse allocation
      const allocations = await this.findOptimalWarehouses(quantity, latitude, longitude);

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
   * Create a new order
   */
  async createOrder(orderData: CreateOrderDto): Promise<OrderResult> {
    try {
      const { quantity, latitude, longitude } = orderData;

      // First verify the order - this will throw an error if invalid
      const verification = await this.verifyOrder(orderData);

      // Create order in database
      const order = await Order.create({
        quantity,
        latitude,
        longitude,
        totalPrice: verification.totalPrice,
        discount: verification.discount,
        shippingCost: verification.shippingCost,
        status: OrderStatus.PENDING,
      });

      // Create order items and update warehouse inventory
      const allocations = verification.items as WarehouseAllocation[];

      for (const allocation of allocations) {
        // Create order item
        await OrderItem.create({
          orderId: order.id,
          warehouseId: allocation.warehouseId,
          quantity: allocation.quantity,
        });

        // Update warehouse inventory
        const warehouse = await Warehouse.findByPk(allocation.warehouseId);
        if (warehouse) {
          await warehouse.updateStock(allocation.quantity);
        }
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
        discount: order.discount instanceof Decimal ? order.discount : new Decimal(order.discount),
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
      throw new Error(error.message || 'Failed to create order');
    }
  }

  /**
   * Get all orders with optional filtering
   */
  async getOrders(filterDto: OrderFilterDto = {}): Promise<{ orders: any[]; total: number }> {
    const { startDate, endDate, status, page = 1, limit = 10 } = filterDto;

    // Build where clause based on filters
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.gte]: new Date(startDate),
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate),
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Find orders
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      orders: rows,
      total: count,
    };
  }

  /**
   * Get a specific order by ID
   */
  async getOrderById(id: string): Promise<any | null> {
    return Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });
  }

  /**
   * Update an order's status
   */
  async updateOrderStatus(id: string, { status }: { status: OrderStatus }): Promise<any | null> {
    const order = await Order.findByPk(id);

    if (!order) {
      return null;
    }

    await order.updateStatus(status);
    return this.getOrderById(id);
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<boolean> {
    const result = await Order.destroy({ where: { id } });
    return result > 0;
  }
}

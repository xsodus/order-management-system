import { OrderStatus } from '../models/order.model';
import Decimal from 'decimal.js';

// DTO for verifying an order without submitting
export interface VerifyOrderDto {
  quantity: number;
  latitude: number;
  longitude: number;
}

// DTO for creating a new order
export interface CreateOrderDto {
  quantity: number;
  latitude: number;
  longitude: number;
}

// DTO for updating order status
export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

// Warehouse allocation in response
export interface WarehouseAllocationDto {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  distance: number;
  shippingCost: number; // Using number for API responses
}

// Response DTO for verification and creation
export interface OrderResponseDto {
  id?: string;
  orderNumber?: string;
  quantity: number;
  latitude: number;
  longitude: number;
  basePrice: number; // Using number for API responses
  totalPrice: number; // Using number for API responses
  discount: number; // Using number for API responses
  shippingCost: number; // Using number for API responses
  status?: OrderStatus;
  items?: WarehouseAllocationDto[];
  createdAt?: string;
  updatedAt?: string;
}

// Response DTO for a list of orders
export interface OrdersListResponseDto {
  total: number;
  page: number;
  limit: number;
  orders: OrderResponseDto[];
}

// Filter DTO for getting orders
export interface OrderFilterDto {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class OrderMapper {
  static toResponseDto(order: any): OrderResponseDto {
    // Calculate basePrice if not available (for backward compatibility with existing orders)
    const basePrice = order.basePrice || order.quantity * 150; // 150 is the device price

    // Function to round to 4 decimal places to ensure consistency with database precision
    const roundTo4 = (num: number) => Math.round(num * 10000) / 10000;

    // Convert Decimal objects to numbers with consistent precision
    const baseNumber = basePrice instanceof Decimal ? basePrice.toNumber() : Number(basePrice);
    const totalNumber =
      order.totalPrice instanceof Decimal ? order.totalPrice.toNumber() : Number(order.totalPrice);
    const discountNumber =
      order.discount instanceof Decimal ? order.discount.toNumber() : Number(order.discount);
    const shippingCostNumber =
      order.shippingCost instanceof Decimal
        ? order.shippingCost.toNumber()
        : Number(order.shippingCost);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      quantity: order.quantity,
      latitude: order.latitude,
      longitude: order.longitude,
      basePrice: roundTo4(baseNumber),
      totalPrice: roundTo4(totalNumber),
      discount: roundTo4(discountNumber),
      shippingCost: roundTo4(shippingCostNumber),
      status: order.status,
      items: order.items?.map((item: any) => {
        const itemShippingCost =
          item.shippingCost instanceof Decimal
            ? item.shippingCost.toNumber()
            : Number(item.shippingCost);

        return {
          warehouseId: item.warehouseId,
          warehouseName: item.warehouseName,
          quantity: item.quantity,
          distance: item.distance,
          shippingCost: roundTo4(itemShippingCost),
        };
      }),
      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
    };
  }

  static toListResponseDto(
    orders: any[],
    total: number,
    page: number,
    limit: number,
  ): OrdersListResponseDto {
    return {
      total,
      page,
      limit,
      orders: orders.map(order => this.toResponseDto(order)),
    };
  }
}

import { OrderStatus } from '../models/order.model';

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
  shippingCost: number;
}

// Response DTO for verification and creation
export interface OrderResponseDto {
  id?: string;
  orderNumber?: string;
  quantity: number;
  latitude: number;
  longitude: number;
  totalPrice: number;
  discount: number;
  shippingCost: number;
  isValid: boolean;
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
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      quantity: order.quantity,
      latitude: order.latitude,
      longitude: order.longitude,
      totalPrice: order.totalPrice,
      discount: order.discount,
      shippingCost: order.shippingCost,
      isValid: order.isValid !== undefined ? order.isValid : true,
      status: order.status,
      items: order.items,
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

import { OrderStatus, OrderItem } from '../models/order.model';

export interface CreateOrderDto {
  customerId: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface AddOrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateOrderItemDto {
  itemId: string;
  quantity?: number;
  unitPrice?: number;
}

export interface OrderResponseDto {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersListResponseDto {
  total: number;
  page: number;
  limit: number;
  orders: OrderResponseDto[];
}

export interface OrderFilterDto {
  customerId?: string;
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
      customerId: order.customerId,
      customerName: order.customerName,
      orderDate: order.orderDate.toISOString(),
      status: order.status,
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
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

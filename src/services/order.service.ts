import { v4 as uuidv4 } from 'uuid';
import { OrderModel, OrderStatus, OrderItem, Order } from '../models/order.model';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  AddOrderItemDto,
  UpdateOrderItemDto,
  OrderFilterDto,
} from '../dtos/order.dto';

// In-memory data store for demonstration
let orders: Order[] = [];

export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    // Map order items with calculated total price per item
    const orderItems: OrderItem[] = orderData.items.map(item => ({
      id: uuidv4(),
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    }));

    // Create new order
    const order = new OrderModel(orderData.customerId, orderData.customerName, orderItems);

    // Save to our in-memory store
    orders.push(order);

    return order;
  }

  /**
   * Get all orders with optional filtering
   */
  async getOrders(filterDto: OrderFilterDto): Promise<{ orders: Order[]; total: number }> {
    let filteredOrders = [...orders];

    // Apply filters
    if (filterDto.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customerId === filterDto.customerId);
    }

    if (filterDto.status) {
      filteredOrders = filteredOrders.filter(order => order.status === filterDto.status);
    }

    if (filterDto.startDate) {
      const startDate = new Date(filterDto.startDate);
      filteredOrders = filteredOrders.filter(order => order.orderDate >= startDate);
    }

    if (filterDto.endDate) {
      const endDate = new Date(filterDto.endDate);
      filteredOrders = filteredOrders.filter(order => order.orderDate <= endDate);
    }

    // Apply pagination
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      orders: paginatedOrders,
      total: filteredOrders.length,
    };
  }

  /**
   * Get a specific order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    const order = orders.find(order => order.id === id);
    return order || null;
  }

  /**
   * Update an order's status
   */
  async updateOrderStatus(id: string, updateData: UpdateOrderStatusDto): Promise<Order | null> {
    const orderIndex = orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return null;
    }

    const order = orders[orderIndex] as OrderModel;
    order.updateStatus(updateData.status);

    return order;
  }

  /**
   * Add an item to an existing order
   */
  async addOrderItem(id: string, itemData: AddOrderItemDto): Promise<Order | null> {
    const orderIndex = orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return null;
    }

    const order = orders[orderIndex] as OrderModel;

    // Create new order item
    const newItem: OrderItem = {
      id: uuidv4(),
      productId: itemData.productId,
      productName: itemData.productName,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      totalPrice: itemData.quantity * itemData.unitPrice,
    };

    order.addItem(newItem);

    return order;
  }

  /**
   * Update an existing order item
   */
  async updateOrderItem(orderId: string, itemData: UpdateOrderItemDto): Promise<Order | null> {
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return null;
    }

    const order = orders[orderIndex] as OrderModel;
    const itemIndex = order.items.findIndex(item => item.id === itemData.itemId);

    if (itemIndex === -1) {
      return null;
    }

    // Update item properties
    const currentItem = order.items[itemIndex];
    const updatedItem: OrderItem = {
      ...currentItem,
      quantity: itemData.quantity !== undefined ? itemData.quantity : currentItem.quantity,
      unitPrice: itemData.unitPrice !== undefined ? itemData.unitPrice : currentItem.unitPrice,
      totalPrice:
        (itemData.quantity !== undefined ? itemData.quantity : currentItem.quantity) *
        (itemData.unitPrice !== undefined ? itemData.unitPrice : currentItem.unitPrice),
    };

    order.updateItem(updatedItem);

    return order;
  }

  /**
   * Remove an item from an order
   */
  async removeOrderItem(orderId: string, itemId: string): Promise<Order | null> {
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return null;
    }

    const order = orders[orderIndex] as OrderModel;

    // Check if item exists
    const itemIndex = order.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return null;
    }

    order.removeItem(itemId);

    return order;
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<boolean> {
    const initialLength = orders.length;
    orders = orders.filter(order => order.id !== id);

    return orders.length < initialLength;
  }
}

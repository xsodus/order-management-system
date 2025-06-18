import { v4 as uuidv4 } from 'uuid';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  orderNumber: string;
  orderDate: Date;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderModel implements Order {
  id: string;
  customerId: string;
  customerName: string;
  orderNumber: string;
  orderDate: Date;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(customerId: string, customerName: string, items: OrderItem[]) {
    this.id = uuidv4();
    this.customerId = customerId;
    this.customerName = customerName;
    this.orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    this.orderDate = new Date();
    this.status = OrderStatus.PENDING;
    this.items = items;
    this.totalAmount = this.calculateTotalAmount();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private calculateTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  updateStatus(status: OrderStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  addItem(item: OrderItem): void {
    this.items.push(item);
    this.totalAmount = this.calculateTotalAmount();
    this.updatedAt = new Date();
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter(item => item.id !== itemId);
    this.totalAmount = this.calculateTotalAmount();
    this.updatedAt = new Date();
  }

  updateItem(updatedItem: OrderItem): void {
    const index = this.items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      this.items[index] = updatedItem;
      this.totalAmount = this.calculateTotalAmount();
      this.updatedAt = new Date();
    }
  }
}

import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Order Item model
export interface OrderItemAttributes {
  id?: string;
  orderId: string;
  quantity: number;
  warehouseId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id'> {}

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  public id!: string;
  public orderId!: string;
  public quantity!: number;
  public warehouseId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    warehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    tableName: 'order_items',
  },
);

// Main Order model
export interface OrderAttributes {
  id?: string;
  orderNumber: string;
  quantity: number;
  latitude: number;
  longitude: number;
  totalPrice: number;
  discount: number;
  shippingCost: number;
  isValid: boolean;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    'id' | 'orderNumber' | 'totalPrice' | 'discount' | 'shippingCost' | 'isValid' | 'status'
  > {}

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: string;
  public orderNumber!: string;
  public quantity!: number;
  public latitude!: number;
  public longitude!: number;
  public totalPrice!: number;
  public discount!: number;
  public shippingCost!: number;
  public isValid!: boolean;
  public status!: OrderStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to update the order status
  public async updateStatus(status: OrderStatus): Promise<void> {
    this.status = status;
    await this.save();
  }
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => `ORD-${Date.now().toString().slice(-6)}`,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    shippingCost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
  },
  {
    sequelize,
    tableName: 'orders',
  },
);

// Define associations
Order.hasMany(OrderItem, {
  sourceKey: 'id',
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  targetKey: 'id',
});

export default Order;

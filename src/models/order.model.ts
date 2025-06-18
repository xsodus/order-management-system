import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Decimal from 'decimal.js';

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
  shippingCost: Decimal; // Added shippingCost field
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
  public shippingCost!: Decimal; // Added shippingCost property
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
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = (this as any).getDataValue('shippingCost');
        return value === null ? null : new Decimal(value);
      },
      set(value: string | number | Decimal) {
        if (Decimal.isDecimal(value)) {
          (this as any).setDataValue('shippingCost', value.toString());
        } else {
          (this as any).setDataValue('shippingCost', value);
        }
      },
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    timestamps: true,
  },
);

// Main Order model
// Define special type for database columns that are DECIMAL but represented as Decimal.js objects in code
export type DecimalColumn = Decimal;

export interface OrderAttributes {
  id?: string;
  orderNumber: string;
  quantity: number;
  latitude: number;
  longitude: number;
  totalPrice: DecimalColumn; // Using Decimal.js for financial calculations
  discount: DecimalColumn;
  shippingCost: DecimalColumn;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    'id' | 'orderNumber' | 'totalPrice' | 'discount' | 'shippingCost' | 'status'
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
  public totalPrice!: Decimal;
  public discount!: Decimal;
  public shippingCost!: Decimal;
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
      type: DataTypes.DECIMAL(15, 4), // Higher precision for financial calculations
      allowNull: false,
      defaultValue: 0,
      // We need to override the default getters and setters
      get() {
        const rawValue = this.getDataValue('totalPrice');
        // Return Decimal instance
        return rawValue === null ? null : new Decimal(rawValue.toString());
      },
      set(value: number | string | Decimal) {
        // Store as string in DB but ensure proper conversion
        const stringValue = value instanceof Decimal ? value.toString() : String(value);
        // Use type assertion to handle the mismatch
        this.setDataValue('totalPrice', stringValue as any);
      },
    },
    discount: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      get() {
        const rawValue = this.getDataValue('discount');
        // Return Decimal instance
        return rawValue === null ? null : new Decimal(rawValue.toString());
      },
      set(value: number | string | Decimal) {
        // Store as string in DB but ensure proper conversion
        const stringValue = value instanceof Decimal ? value.toString() : String(value);
        // Use type assertion to handle the mismatch
        this.setDataValue('discount', stringValue as any);
      },
    },
    shippingCost: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      get() {
        const rawValue = this.getDataValue('shippingCost');
        // Return Decimal instance
        return rawValue === null ? null : new Decimal(rawValue.toString());
      },
      set(value: number | string | Decimal) {
        // Store as string in DB but ensure proper conversion
        const stringValue = value instanceof Decimal ? value.toString() : String(value);
        // Use type assertion to handle the mismatch
        this.setDataValue('shippingCost', stringValue as any);
      },
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
    timestamps: true,
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

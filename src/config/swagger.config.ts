import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Management API Documentation',
      version,
      description: `
API documentation for the Order Management System. This system allows you to verify order pricing and warehouse allocation, create orders, and retrieve order history. The system automatically calculates optimal warehouse distribution to minimize shipping costs and applies quantity-based discounts.

## Features

### 🎯 Order Verification
- Preview pricing and shipping costs before placing orders
- See optimal warehouse allocation strategy
- No inventory impact - perfect for cost estimation

### 📦 Order Creation  
- Create orders with automatic inventory allocation
- Optimized shipping cost calculation
- Real-time stock validation

### 📊 Order Management
- Retrieve all orders with complete details
- Track order status and fulfillment progress
- View historical order data

## Business Logic

### Pricing Structure
- **Base Price**: $150 per device
- **Quantity Discounts**:
  - 25-49 devices: 5% discount
  - 50-99 devices: 10% discount  
  - 100-249 devices: 15% discount
  - 250+ devices: 20% discount

### Shipping Calculation
- **Rate**: $0.01 per kg per kilometer
- **Device Weight**: 365 grams
- **Distance**: Calculated using PostGIS spatial functions with WGS84 ellipsoid for high accuracy
- **Optimization**: Automatic warehouse allocation to minimize total shipping cost

### Warehouse Allocation Strategy
1. Calculate distance from customer to all warehouses
2. Sort warehouses by proximity
3. Allocate stock from nearest warehouses first
4. Minimize total shipping cost across all allocations
      `,
      contact: {
        name: 'API Support',
        email: 'akkapondev@gmail.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      schemas: {
        OrderStatus: {
          type: 'string',
          enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
          description: 'Current status of the order in the fulfillment process',
          example: 'PENDING',
        },
        WarehouseAllocationDto: {
          type: 'object',
          properties: {
            warehouseId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the warehouse',
              example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            warehouseName: {
              type: 'string',
              description: 'Name of the warehouse',
              example: 'Warehouse A',
            },
            quantity: {
              type: 'integer',
              description: 'Quantity allocated from this warehouse',
              minimum: 1,
              example: 2,
            },
            distance: {
              type: 'number',
              format: 'double',
              description:
                'Distance from the customer in kilometers (calculated using PostGIS spatial functions)',
              minimum: 0,
              example: 12.5,
            },
            shippingCost: {
              type: 'number',
              format: 'double',
              description:
                'Shipping cost from this warehouse ($0.01 per kg per km, device weight: 365g)',
              minimum: 0,
              example: 25.0,
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude of the warehouse',
              minimum: -90,
              maximum: 90,
              example: 13.7563,
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude of the warehouse',
              minimum: -180,
              maximum: 180,
              example: 100.5018,
            },
          },
          required: [
            'warehouseId',
            'warehouseName',
            'quantity',
            'distance',
            'shippingCost',
            'latitude',
            'longitude',
          ],
        },
        OrderResponseDto: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the order (only present for created orders)',
              example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            orderNumber: {
              type: 'string',
              description: 'Unique order number (only present for created orders)',
              example: 'ORD-123456',
            },
            quantity: {
              type: 'integer',
              description: 'Total quantity of devices ordered',
              minimum: 1,
              example: 10,
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude of the shipping address',
              minimum: -90,
              maximum: 90,
              example: 40.712776,
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude of the shipping address',
              minimum: -180,
              maximum: 180,
              example: -74.005974,
            },
            basePrice: {
              type: 'number',
              format: 'double',
              description: 'Base price before discount (quantity × $150 unit price)',
              minimum: 0,
              example: 1500.0,
            },
            totalPrice: {
              type: 'number',
              format: 'double',
              description: 'Total price of the order after discount (not including shipping)',
              minimum: 0,
              example: 1350.0,
            },
            discount: {
              type: 'number',
              format: 'double',
              description: 'Discount amount applied to the order (5-20% based on quantity tiers)',
              minimum: 0,
              example: 150.0,
            },
            shippingCost: {
              type: 'number',
              format: 'double',
              description: 'Total shipping cost for the order based on distance and weight',
              minimum: 0,
              example: 15.0,
            },
            status: {
              $ref: '#/components/schemas/OrderStatus',
              description: 'Current status of the order (only present for created orders)',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/WarehouseAllocationDto',
              },
              description: 'Warehouse allocations for this order showing optimal distribution',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description:
                'Date and time when the order was created (only present for created orders)',
              example: '2024-01-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description:
                'Date and time when the order was last updated (only present for created orders)',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
          required: [
            'quantity',
            'latitude',
            'longitude',
            'basePrice',
            'totalPrice',
            'discount',
            'shippingCost',
          ],
        },
        VerifyOrderDto: {
          type: 'object',
          properties: {
            quantity: {
              type: 'integer',
              description: 'Number of devices to order',
              minimum: 1,
              example: 10,
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude of the shipping address',
              minimum: -90,
              maximum: 90,
              example: 40.712776,
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude of the shipping address',
              minimum: -180,
              maximum: 180,
              example: -74.005974,
            },
          },
          required: ['quantity', 'latitude', 'longitude'],
        },
        CreateOrderDto: {
          type: 'object',
          properties: {
            quantity: {
              type: 'integer',
              description: 'Number of devices to order',
              minimum: 1,
              example: 10,
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude of the shipping address',
              minimum: -90,
              maximum: 90,
              example: 40.712776,
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude of the shipping address',
              minimum: -180,
              maximum: 180,
              example: -74.005974,
            },
          },
          required: ['quantity', 'latitude', 'longitude'],
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Error status',
              example: 'error',
            },
            message: {
              type: 'string',
              description: 'Error message describing what went wrong',
              example: 'Order not found',
            },
          },
          required: ['status', 'message'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Error status',
              example: 'error',
            },
            message: {
              type: 'string',
              description: 'Validation error message',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that failed validation',
                    example: 'quantity',
                  },
                  message: {
                    type: 'string',
                    description: 'Validation error message for the field',
                    example: 'Quantity must be at least 1',
                  },
                },
              },
              description: 'List of validation errors',
            },
          },
          required: ['status', 'message'],
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input data or validation errors',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/Error' },
                  { $ref: '#/components/schemas/ValidationError' },
                ],
              },
              examples: {
                invalidInput: {
                  summary: 'Invalid input data',
                  value: {
                    status: 'error',
                    message: 'Insufficient stock available for the requested quantity',
                  },
                },
                validationError: {
                  summary: 'Validation error',
                  value: {
                    status: 'error',
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'quantity',
                        message: 'Quantity must be at least 1',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Order not found',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'An unexpected error occurred',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Orders',
        description:
          'Order management operations including verification, creation, and retrieval. The system supports device orders with automatic warehouse allocation optimization and quantity-based pricing.',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);

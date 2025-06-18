import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Management API Documentation',
      version,
      description:
        'API documentation for the Order Management System. This system allows you to verify, create, and list orders.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
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
        },
        WarehouseAllocationDto: {
          type: 'object',
          properties: {
            warehouseId: {
              type: 'string',
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
              example: 2,
            },
            distance: {
              type: 'number',
              format: 'double',
              description: 'Distance from the customer in kilometers',
              example: 12.5,
            },
            shippingCost: {
              type: 'number',
              format: 'double',
              description: 'Shipping cost from this warehouse',
              example: 25.0,
            },
          },
        },
        OrderResponseDto: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the order',
              example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            orderNumber: {
              type: 'string',
              description: 'Unique order number',
              example: 'ORD-123456',
            },
            quantity: {
              type: 'integer',
              description: 'Total quantity of devices ordered',
              example: 10,
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude of the shipping address',
              example: 40.712776,
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude of the shipping address',
              example: -74.005974,
            },
            basePrice: {
              type: 'number',
              format: 'double',
              description: 'Base price before discount (quantity × unit price)',
              example: 1500.0,
            },
            totalPrice: {
              type: 'number',
              format: 'double',
              description: 'Total price of the order after discount (not including shipping)',
              example: 1350.0,
            },
            discount: {
              type: 'number',
              format: 'double',
              description: 'Discount amount applied to the order',
              example: 150.0,
            },
            shippingCost: {
              type: 'number',
              format: 'double',
              description: 'Total shipping cost for the order',
              example: 15.0,
            },
            status: {
              $ref: '#/components/schemas/OrderStatus',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/WarehouseAllocationDto',
              },
              description: 'Warehouse allocations for this order',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time when the order was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time when the order was last updated',
            },
          },
        },
        VerifyOrderDto: {
          type: 'object',
          properties: {
            quantity: {
              type: 'integer',
              description: 'Number of devices to order',
              example: 10,
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude of the shipping address',
              example: 40.712776,
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude of the shipping address',
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
              example: 10,
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude of the shipping address',
              example: 40.712776,
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude of the shipping address',
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
              description: 'Error message',
              example: 'Order not found',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
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
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Orders',
        description: 'Order management operations',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);

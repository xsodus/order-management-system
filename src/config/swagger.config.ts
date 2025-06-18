import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Management API Documentation',
      version,
      description:
        'API documentation for the Order Management System. This system allows you to create, read, update, and delete orders and their items.',
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
        OrderItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the order item',
              example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            productId: {
              type: 'string',
              description: 'Unique identifier for the product',
              example: 'prod-123',
            },
            productName: {
              type: 'string',
              description: 'Name of the product',
              example: 'Mechanical Keyboard',
            },
            quantity: {
              type: 'integer',
              description: 'Quantity of the product',
              example: 2,
            },
            unitPrice: {
              type: 'number',
              format: 'double',
              description: 'Price per unit',
              example: 129.99,
            },
            totalPrice: {
              type: 'number',
              format: 'double',
              description: 'Total price for the item (quantity * unitPrice)',
              example: 259.98,
            },
          },
          required: ['productId', 'productName', 'quantity', 'unitPrice'],
        },
        Order: {
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
            customerId: {
              type: 'string',
              description: 'Unique identifier for the customer',
              example: 'cust-987',
            },
            customerName: {
              type: 'string',
              description: 'Name of the customer',
              example: 'John Doe',
            },
            orderDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time when the order was placed',
            },
            status: {
              $ref: '#/components/schemas/OrderStatus',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
            totalAmount: {
              type: 'number',
              format: 'double',
              description: 'Total amount of the order',
              example: 259.98,
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
        CreateOrderDto: {
          type: 'object',
          properties: {
            customerId: {
              type: 'string',
              description: 'Unique identifier for the customer',
              example: 'cust-987',
            },
            customerName: {
              type: 'string',
              description: 'Name of the customer',
              example: 'John Doe',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                    description: 'Unique identifier for the product',
                    example: 'prod-123',
                  },
                  productName: {
                    type: 'string',
                    description: 'Name of the product',
                    example: 'Mechanical Keyboard',
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Quantity of the product',
                    example: 2,
                  },
                  unitPrice: {
                    type: 'number',
                    format: 'double',
                    description: 'Price per unit',
                    example: 129.99,
                  },
                },
                required: ['productId', 'productName', 'quantity', 'unitPrice'],
              },
            },
          },
          required: ['customerId', 'customerName', 'items'],
        },
        UpdateOrderStatusDto: {
          type: 'object',
          properties: {
            status: {
              $ref: '#/components/schemas/OrderStatus',
            },
          },
          required: ['status'],
        },
        AddOrderItemDto: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Unique identifier for the product',
              example: 'prod-123',
            },
            productName: {
              type: 'string',
              description: 'Name of the product',
              example: 'Mechanical Keyboard',
            },
            quantity: {
              type: 'integer',
              description: 'Quantity of the product',
              example: 2,
            },
            unitPrice: {
              type: 'number',
              format: 'double',
              description: 'Price per unit',
              example: 129.99,
            },
          },
          required: ['productId', 'productName', 'quantity', 'unitPrice'],
        },
        UpdateOrderItemDto: {
          type: 'object',
          properties: {
            quantity: {
              type: 'integer',
              description: 'Quantity of the product',
              example: 3,
            },
            unitPrice: {
              type: 'number',
              format: 'double',
              description: 'Price per unit',
              example: 119.99,
            },
          },
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
        OrdersListResponseDto: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of orders available',
              example: 42,
            },
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Number of orders per page',
              example: 10,
            },
            orders: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Order',
              },
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
      {
        name: 'Order Items',
        description: 'Order items operations',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);

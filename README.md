# Order Management System API

A RESTful API for managing orders, built with Node.js, Express, and TypeScript following the MVCS (Model-View-Controller-Service) architecture.

## Architecture Overview

This project follows the MVCS (Model-View-Controller-Service) architecture:

- **Models**: Core business entities and data structures
- **Views**: Not applicable for this API (would be client-side in a full-stack app)
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic and operations

Additionally, it includes:

- **DTOs (Data Transfer Objects)**: For input validation and output formatting
- **Middlewares**: For request validation, error handling, etc.
- **Routes**: To define API endpoints
- **Config**: For application configuration
- **Logging**: Winston-based logging system with request tracking

## API Endpoints

### Orders

- **GET /api/orders** - Get all orders with filtering and pagination
- **GET /api/orders/:id** - Get a specific order by ID
- **POST /api/orders** - Create a new order
- **PATCH /api/orders/:id/status** - Update order status
- **DELETE /api/orders/:id** - Delete an order

## Logging System

The application uses Winston for logging with the following features:

- **Request ID Tracking**: Each request is assigned a unique ID that is tracked throughout the request lifecycle
- **Log Levels**: Different log levels (debug, info, warn, error) for different types of messages
- **Timestamps**: All logs include timestamps in ISO format
- **Console Output**: Development logs are output to console with colors
- **File Output**: Logs are also saved to files in the `logs` directory
  - `logs/combined.log`: All logs
  - `logs/error.log`: Error logs only

Example usage in controllers:

```typescript
// Get a logger with request context
const logger = getRequestLogger(req);

// Log at different levels
logger.debug('Processing data', { someData: data });
logger.info('Operation completed', { resultId: result.id });
logger.warn('Something unusual happened', { details: details });
logger.error('Operation failed', { error: error.message });
```

### Order Items

- **POST /api/orders/:id/items** - Add item to an order
- **PATCH /api/orders/:id/items/:itemId** - Update an order item
- **DELETE /api/orders/:id/items/:itemId** - Remove an item from an order

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- Yarn or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/order-management-system.git
cd order-management-system
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Start the development server:

```bash
yarn dev
# or
npm run dev
```

The server will start at http://localhost:3000.

### Running Tests

Run the integration tests:

```bash
yarn test
```

Run tests with coverage:

```bash
yarn test:coverage
```

For more details on the integration tests, see [Integration Tests Documentation](docs/INTEGRATION_TESTS.md).

### API Documentation

The API documentation is available via Swagger UI at:

```
http://localhost:3000/api-docs
```

This provides interactive documentation where you can explore and test all available endpoints.

## Project Structure

```
src/
├── config/             # Application configuration
│   ├── index.ts        # Main config file
│   └── swagger.config.ts # Swagger documentation config
├── controllers/        # Request handlers
│   └── order.controller.ts
├── dtos/              # Data Transfer Objects
│   └── order.dto.ts
├── middlewares/       # Express middlewares
│   ├── error.middleware.ts
│   └── order.validation.ts
├── models/            # Domain models
│   └── order.model.ts
├── routes/            # API routes
│   ├── order.routes.ts
│   └── order.routes.docs.ts  # Routes with Swagger documentation
├── services/          # Business logic
│   └── order.service.ts
├── utils/             # Utility functions
├── app.ts             # Express application setup
└── server.ts          # Server entry point

## Scalability

The application is designed with scalability in mind:

1. **Modular Architecture**: The MVCS pattern enables easy addition of new features
2. **Separated Business Logic**: Service layer allows for easy swapping of data sources (e.g., from in-memory to database)
3. **DTOs**: Ensures proper data validation and transformation
4. **Pagination**: API supports pagination for large datasets

## Future Enhancements

- Add persistent storage (MongoDB, PostgreSQL, etc.)
- Implement user authentication and authorization
- Add caching layer for improved performance
- Implement event-based architecture for order processing
- Create Docker setup for containerization
```

2. Install dependencies:

```bash
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
```

### Running the API

#### Development mode:

```bash
yarn dev
```

#### Production mode:

```bash
yarn build
yarn start
```

## Project Structure

```
src/
├── config/           # Application configuration
├── controllers/      # Request handlers
├── dtos/             # Data Transfer Objects
├── middlewares/      # Express middlewares
├── models/           # Data models and entities
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── app.ts            # Express app setup
└── server.ts         # Server entry point
```

## Future Enhancements

- Implement database persistence (MongoDB, PostgreSQL, etc.)
- Add authentication and authorization
- Add unit and integration tests
- Set up CI/CD pipeline
- Add API documentation with Swagger/OpenAPI
- Implement caching mechanism

## Financial Calculations

### Using Decimal.js for Financial Precision

To ensure accurate financial calculations without floating-point precision issues, this application uses [Decimal.js](https://mikemcl.github.io/decimal.js/) for all financial operations. This provides several benefits:

- Precise decimal arithmetic for monetary values
- Avoids floating-point rounding errors that can cause financial calculation inaccuracies
- Allows for reliable comparison of monetary values
- Maintains exact precision during calculations involving multiplication, division, and percentage calculations

The following values in the application are now handled using Decimal.js:

- Product prices
- Order total prices
- Discounts
- Shipping costs
- All financial calculations in the order processing workflow

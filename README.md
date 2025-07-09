# Order Management System API

A RESTful API for managing orders, built with Node.js, Express, and TypeScript following the MVCS (Model-View-Controller-Service) architecture.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Business Logic](#business-logic)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Database & Docker](#database--docker)
- [Logging System](#logging-system)
- [Testing](#testing)
- [Deployment & CI/CD](#deployment--cicd)

## Architecture Overview

This project follows the MVCS (Model-View-Controller-Service) architecture:

- **Models**: Core business entities and data structures
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic and operations
- **DTOs (Data Transfer Objects)**: For input validation and output formatting
- **Middlewares**: For request validation, error handling, etc.
- **Routes**: To define API endpoints
- **Config**: For application configuration (including database, environment, and swagger)
- **Logging**: Winston-based logging system with request tracking

### Project Structure

```
order-management-system/
├── data/                  # Database data (PostgreSQL volume)
├── docs/                  # Documentation
├── logs/                  # Winston log output
├── src/
│   ├── __tests__/         # Integration and unit tests
│   ├── config/            # App, DB, and Swagger config
│   ├── controllers/       # Request handlers
│   ├── dtos/              # Data Transfer Objects
│   ├── middlewares/       # Express middlewares
│   ├── models/            # Data models and entities
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions (logger, etc.)
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── .env*                  # Environment variable files
├── docker-compose.yml     # Docker Compose for Postgres
├── package.json           # Project manifest
├── tsconfig.json          # TypeScript config
└── README.md
```

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

### Financial Calculations

This application uses [Decimal.js](https://mikemcl.github.io/decimal.js/) for all financial operations to ensure precise decimal arithmetic for monetary values and avoid floating-point rounding errors.

## Getting Started

### Prerequisites

- Node.js (v20.18.3 or higher)
- Yarn or npm
- Docker (for local Postgres)

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

3. Create a `.env` file in the root directory (or use `.env.development`, `.env.production`, etc.) with at least:

```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_management_db
DB_USER=order_user
DB_PASSWORD=order-management
```

4. Start the database:

```bash
yarn db:up
```

5. Run the API in development mode:

```bash
yarn dev
```

## API Endpoints

All endpoints are prefixed with `/api`.

### Orders

- **GET /api/orders** — List all orders with complete warehouse allocation details
- **GET /api/orders/verify** — Verify an order (calculate price, shipping, allocation) without creating it
- **POST /api/orders** — Create a new order with optimized warehouse allocation

### Endpoint Features

#### GET /api/orders/verify

- **Purpose**: Preview order costs and warehouse allocation without creating an order
- **Features**:
  - Calculates optimal warehouse distribution
  - Shows quantity-based discount application
  - Provides shipping cost breakdown by warehouse
  - No inventory impact - perfect for cost estimation

#### POST /api/orders

- **Purpose**: Create a new order with automatic optimization
- **Features**:
  - Real-time stock validation
  - Automatic inventory allocation
  - Order status tracking (PENDING → PROCESSING → COMPLETED)
  - Optimized shipping cost calculation

#### GET /api/orders

- **Purpose**: Retrieve all orders with complete details
- **Features**:
  - Includes warehouse information merged into order items
  - Shows historical pricing and allocation data
  - Displays order status and fulfillment progress

### Request/Response Schemas

#### CreateOrderDto & VerifyOrderDto

```json
{
  "quantity": 10,
  "latitude": 40.712776,
  "longitude": -74.005974
}
```

**Validation Rules:**

- `quantity`: Integer and it must be higher than 0
- `latitude`: Number between -90 and 90 (decimal degrees)
- `longitude`: Number between -180 and 180 (decimal degrees)

#### OrderResponseDto

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "orderNumber": "ORD-123456",
  "quantity": 100,
  "latitude": 40.712776,
  "longitude": -74.005974,
  "basePrice": 15000.0,
  "totalPrice": 12750.0,
  "discount": 2250.0,
  "shippingCost": 45.2,
  "status": "PENDING",
  "items": [
    {
      "warehouseId": "warehouse-1",
      "warehouseName": "NYC Warehouse",
      "quantity": 60,
      "distance": 15.2,
      "shippingCost": 33.3,
      "latitude": 40.7589,
      "longitude": -73.9851
    },
    {
      "warehouseId": "warehouse-2",
      "warehouseName": "NJ Warehouse",
      "quantity": 40,
      "distance": 25.8,
      "shippingCost": 11.9,
      "latitude": 40.6892,
      "longitude": -74.0445
    }
  ],
  "createdAt": "2024-06-20T12:34:56.000Z",
  "updatedAt": "2024-06-20T12:34:56.000Z"
}
```

**Field Descriptions:**

- `basePrice`: Quantity × $150 (before discount)
- `totalPrice`: Base price after quantity discount applied
- `discount`: Amount saved through quantity discount (5%-20%)
- `shippingCost`: Total shipping cost optimized across warehouses
- `items`: Array of warehouse allocations with individual shipping costs

#### WarehouseAllocationDto

```json
{
  "warehouseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "warehouseName": "NYC Warehouse",
  "quantity": 60,
  "distance": 15.2,
  "shippingCost": 33.3,
  "latitude": 40.7589,
  "longitude": -73.9851
}
```

**Calculation Details:**

- `distance`: Calculated using PostGIS spatial functions with WGS84 ellipsoid (km)
- `shippingCost`: $0.01 × quantity × 0.365kg × distance (per warehouse)

#### Error Response Schemas

**Basic Error:**

```json
{
  "status": "error",
  "message": "Insufficient stock available for the requested quantity"
}
```

**Validation Error:**

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be at least 1"
    },
    {
      "field": "latitude",
      "message": "Latitude must be between -90 and 90"
    }
  ]
}
```

#### Order Status Enum

- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `CANCELLED`

## API Documentation (Swagger)

Access the interactive API documentation and testing interface via Swagger UI:

- **Local**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Production**: [https://akkapon-order-management-htd6hhgzg7arfyew.southeastasia-01.azurewebsites.net/api-docs](https://akkapon-order-management-htd6hhgzg7arfyew.southeastasia-01.azurewebsites.net/api-docs)

### Documentation Features

- **Complete Business Logic**: Detailed explanations of pricing rules, shipping calculations, and warehouse allocation strategies
- **Interactive Examples**: Real-world examples with multiple warehouses and discount scenarios
- **Validation Rules**: Complete input validation with min/max values and format requirements
- **Error Handling**: Comprehensive error response documentation with examples

## Database & Docker

Uses PostgreSQL (with PostGIS) via Docker Compose for local development. Database config is managed via environment variables and `src/config/`.

### Database Commands

```bash
# Start the database
yarn db:up

# Stop the database
yarn db:down

# Reset the database
yarn db:reset
```

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

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

### Test Structure

The integration tests check how the API endpoints, business logic, and database work together:

1. **orders.test.ts**: Tests the CRUD operations on orders
2. **order-pricing.test.ts**: Tests the discount and pricing logic
3. **error-handling.test.ts**: Tests the API error handling and validation
4. **warehouse-fixtures.test.ts**: Tests warehouse-related logic

The tests use Jest to run the tests and Supertest to send HTTP requests to the API.

### Test Coverage

Run the test coverage report to see which parts of the code are covered by the tests:

```bash
yarn test:coverage
```

This will generate a coverage report in the `coverage` directory.

## Deployment & CI/CD

This project uses GitHub Actions for automated deployment to Azure App Service. The workflow was set up by following [this Microsoft guide](https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions?tabs=openid%2Caspnetcore).

### Workflow Configuration

You can view the complete workflow configuration in: `./.github/workflows/main_akkapon-order-management.yml`

This workflow is triggered automatically whenever you push code to the `main` branch.

### Environment Variables Setup

**Before pushing code**, ensure these secret variables are configured in GitHub:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### Database Requirements

- The database specified by `DB_NAME` must already exist on your database server
- The database server must have the PostGIS extension enabled (required for geolocation functionality)

### Configuring Secrets

To verify or update your App Service environment variables:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add or update each environment secret (key/value pair) for your production environment

## Scalability

The application is designed with scalability in mind:

1. **Modular Architecture**: The MVCS pattern enables easy addition of new features
2. **Separated Business Logic**: Service layer allows for easy swapping of data sources (e.g., from in-memory to database)
3. **DTOs**: Ensures proper data validation and transformation

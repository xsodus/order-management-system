# Order Management System API

A RESTful API for managing orders, built with Node.js, Express, and TypeScript following the MVCS (Model-View-Controller-Service) architecture.

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

## Project Structure

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

## API Endpoints

### Orders

- **GET /api/orders** - Get all orders with filtering and pagination
- **GET /api/orders/:id** - Get a specific order by ID
- **POST /api/orders** - Create a new order
- **PATCH /api/orders/:id/status** - Update order status
- **DELETE /api/orders/:id** - Delete an order

### Order Items

- **POST /api/orders/:id/items** - Add item to an order
- **PATCH /api/orders/:id/items/:itemId** - Update an order item
- **DELETE /api/orders/:id/items/:itemId** - Remove an item from an order

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

## Database & Docker

- Uses PostgreSQL (with PostGIS) via Docker Compose for local development.
- Database config is managed via environment variables and `src/config/`.
- To start the database:

```bash
yarn db:up
```

- To stop the database:

```bash
yarn db:down
```

- To reset the database:

```bash
yarn db:reset
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
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

### Running the API

#### Development mode:

```bash
yarn dev
```

#### Production mode:

```bash
yarn build
yarn prod
```

## Financial Calculations

This application uses [Decimal.js](https://mikemcl.github.io/decimal.js/) for all financial operations to ensure precise decimal arithmetic for monetary values and avoid floating-point rounding errors.

## Running Tests

Run the integration tests:

```bash
yarn test
```

Run tests with coverage:

```bash
yarn test:coverage
```

#### Integration Tests

The integration tests check how the API endpoints, business logic, and database work together. This helps make sure the system behaves as it would for real users. The tests use Jest to run the tests and Supertest to send HTTP requests to the API.

**Test Structure**

The tests are organized into several files:

1. **orders.test.ts**: Tests the CRUD operations on orders
2. **order-pricing.test.ts**: Tests the discount and pricing logic
3. **error-handling.test.ts**: Tests the API error handling and validation
4. **warehouse-fixtures.test.ts**: Tests warehouse-related logic

**Running the Tests**

- Install dependencies:

  ```bash
  yarn install
  ```

- Run the tests:

  ```bash
  yarn test
  ```

- Run the tests with coverage:

  ```bash
  yarn test:coverage
  ```

- Run the tests in watch mode:

  ```bash
  yarn test:watch
  ```

**Test Coverage**

Run the test coverage report to see which parts of the code are covered by the tests:

```bash
yarn test:coverage
```

This will generate a coverage report in the `coverage` directory.

**Extending the Tests**

When adding new features to the API, also add corresponding tests in the appropriate test file. If a feature doesn't fit into the existing test files, create a new test file in the `src/__tests__` directory.

## Scalability

The application is designed with scalability in mind:

1. **Modular Architecture**: The MVCS pattern enables easy addition of new features
2. **Separated Business Logic**: Service layer allows for easy swapping of data sources (e.g., from in-memory to database)
3. **DTOs**: Ensures proper data validation and transformation

## API Documentation & Testing with Swagger

You can interactively explore and test the API using the built-in Swagger UI.

### Accessing Swagger UI

1. **Start the API server** (in development mode):

   ```bash
   yarn dev
   ```

   By default, the server runs on [http://localhost:3000](http://localhost:3000).

2. **Open your browser and go to:**
   [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

   This page displays the Swagger UI, which lists all available API endpoints, their parameters, request/response schemas, and example payloads.

## Deployment & CI/CD

This project uses GitHub Actions for automated deployment to Azure App Service.  
 The workflow was set up by following [this Microsoft guide](https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions?tabs=openid%2Caspnetcore).

You can view the complete workflow configuration in the file:  
 `./.github/workflows/main_akkapon-order-management.yml`

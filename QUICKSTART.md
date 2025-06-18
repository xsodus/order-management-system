# Quick Start Guide - Database Migration & Environment Configuration

## Summary of Changes

✅ **Database Migration Completed:**

- Migrated from SQLite in-memory to PostgreSQL with Docker Compose
- Added persistent data storage in `./data` directory
- Configured PostgreSQL 16 with proper UTF8 encoding
- Created database initialization scripts

✅ **Environment Configuration Completed:**

- Created separate environment files (`.env.development`, `.env.production`, `.env.test`)
- Implemented dynamic configuration loading based on NODE_ENV
- Added proper logging levels and database connection settings for each environment
- Made Swagger UI configurable per environment

✅ **Testing Infrastructure Completed:**

- Integrated testcontainers for PostgreSQL testing
- Added fallback to SQLite when Docker is unavailable
- Updated Jest configuration for better test isolation
- Created robust test setup with proper cleanup

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Start PostgreSQL Database (Optional - for development)

```bash
# Start PostgreSQL container
yarn db:up

# Run database migration to populate initial data
yarn migrate

# Check database logs (optional)
yarn db:logs
```

### 3. Run the Application

```bash
# Development mode (uses SQLite by default, PostgreSQL if Docker is running)
yarn dev

# Production mode
NODE_ENV=production yarn start
```

### 4. Run Tests

```bash
# Run tests with SQLite (fast, no Docker required)
yarn test

# Run tests with PostgreSQL containers (requires Docker)
yarn test:postgres

# Run with coverage
yarn test:coverage
```

### 5. Database Management Commands

```bash
# Stop database
yarn db:down

# Reset database (removes all data)
yarn db:reset

# View database logs
yarn db:logs
```

## Environment Variables

The application now supports three environments:

### Development (`.env.development`)

- Uses PostgreSQL if Docker is running, SQLite otherwise
- Debug logging enabled
- Swagger UI enabled

### Production (`.env.production`)

- Uses PostgreSQL database
- Info-level logging
- Swagger UI disabled

### Test (`.env.test`)

- Uses testcontainers for PostgreSQL when available
- SQLite fallback for CI/fast testing
- Error-level logging only

## Database Connection Details

When using PostgreSQL (development/production):

- **Host:** localhost
- **Port:** 3306
- **Database:** order_management_db
- **Username:** root
- **Password:** order-management

## File Structure Changes

```
├── .env.development     # Development environment config
├── .env.production      # Production environment config
├── .env.test           # Test environment config
├── docker-compose.yml  # PostgreSQL container definition
├── docker/
│   └── postgres/
│       └── init/       # Database initialization scripts
├── src/
│   ├── config/
│   │   ├── database.ts         # Updated database config
│   │   ├── index.ts           # Enhanced environment config
│   │   └── test-database.ts   # Testcontainers setup
│   ├── scripts/
│   │   └── migrate.ts         # Database migration script
│   └── __tests__/
│       └── setup.ts           # Enhanced test setup
└── docs/
    └── DATABASE_MIGRATION.md  # Detailed documentation
```

## Next Steps

The database migration and environment configuration are now complete. The application can:

1. ✅ Run with persistent PostgreSQL storage in development
2. ✅ Use environment-specific configurations
3. ✅ Run tests with both SQLite and PostgreSQL
4. ✅ Handle database initialization and migration
5. ✅ Support Docker-based development workflow

**What's Next:**

- Deploy to a cloud provider (AWS, Azure, GCP)
- Set up CI/CD pipeline
- Configure production database (managed service)
- Add monitoring and alerting
- Implement backup and disaster recovery

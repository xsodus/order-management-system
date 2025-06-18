# Database Migration and Environment Configuration

This document explains the database migration from SQLite to PostgreSQL and the new environment configuration system.

## Overview

The application has been migrated from using an in-memory SQLite database to a persistent PostgreSQL database with Docker Compose for local development and testcontainers for integration testing.

## Environment Configuration

The application now supports multiple environments with dedicated configuration files:

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings
- `.env.test` - Test environment settings

### Environment Variables

| Variable          | Description       | Development         | Production          | Test                  |
| ----------------- | ----------------- | ------------------- | ------------------- | --------------------- |
| `NODE_ENV`        | Environment name  | development         | production          | test                  |
| `DB_DIALECT`      | Database type     | postgres            | postgres            | postgres              |
| `DB_HOST`         | Database host     | localhost           | localhost           | localhost             |
| `DB_PORT`         | Database port     | 5432                | 5432                | 5432                  |
| `DB_NAME`         | Database name     | order_management_db | order_management_db | order_management_test |
| `DB_USER`         | Database user     | order_user          | postgres            | postgres              |
| `DB_PASSWORD`     | Database password | order-management    | order-management    | test-password         |
| `LOG_LEVEL`       | Logging level     | debug               | info                | error                 |
| `SWAGGER_ENABLED` | Enable Swagger UI | true                | false               | false                 |

## Database Setup

### Prerequisites

- Docker and Docker Compose
- Node.js (v20 or higher)
- Yarn or npm

### Local Development

1. **Start PostgreSQL Database:**

   ```bash
   yarn db:up
   ```

   This starts a PostgreSQL 16 container with persistent storage in the `./data` directory.

2. **Run Database Migration:**

   ```bash
   yarn migrate
   ```

   This creates the database schema and populates initial data (products and warehouses).

3. **Start the Application:**

   ```bash
   yarn dev
   ```

4. **Stop Database:**

   ```bash
   yarn db:down
   ```

5. **Reset Database (removes all data):**

   ```bash
   yarn db:reset
   ```

6. **View Database Logs:**
   ```bash
   yarn db:logs
   ```

### Database Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** order_management_db
- **Username:** order_user
- **Password:** order-management

You can connect to the database using any PostgreSQL client with these credentials.

## Testing Infrastructure

### Testcontainers Integration

The application uses testcontainers for integration testing, which automatically spins up isolated PostgreSQL containers for each test run.

### Running Tests

1. **Standard Tests (SQLite in-memory):**

   ```bash
   yarn test
   ```

2. **Tests with PostgreSQL Testcontainers:**

   ```bash
   yarn test:postgres
   ```

3. **Watch Mode:**

   ```bash
   yarn test:watch
   ```

4. **Coverage Report:**
   ```bash
   yarn test:coverage
   ```

### Test Configuration

- Tests automatically detect whether to use testcontainers or fallback to SQLite
- Testcontainers are used when `USE_TESTCONTAINERS=true` environment variable is set
- In CI environments, tests fallback to SQLite for faster execution
- Each test run gets a fresh database instance

## Docker Compose Configuration

The `docker-compose.yml` file includes:

- PostgreSQL 16 with persistent storage
- Health checks for database readiness
- Custom initialization scripts
- Volume mounting for data persistence

### Volume Structure

```
data/
└── postgres/       # PostgreSQL data directory (auto-created)
docker/
└── postgres/
    └── init/
        └── 01-init.sql  # Database initialization script
```

## Migration Script

The migration script (`src/scripts/migrate.ts`) handles:

- Database connection testing
- Table creation and schema synchronization
- Initial data population (products and warehouses)
- Idempotent operations (safe to run multiple times)

## Troubleshooting

### Common Issues

1. **Port 5432 already in use:**

   ```bash
   # Check what's using the port
   lsof -i :5432

   # Stop any existing PostgreSQL service
   brew services stop postgresql  # macOS
   sudo systemctl stop postgresql  # Linux
   ```

2. **Permission denied for data directory:**

   ```bash
   # Ensure proper permissions
   sudo chown -R $USER:$USER ./data
   ```

3. **Database connection timeout:**

   ```bash
   # Check if container is running
   docker-compose ps

   # Check container logs
   yarn db:logs
   ```

4. **Tests hanging with testcontainers:**

   ```bash
   # Ensure Docker is running
   docker info

   # Run tests without testcontainers
   yarn test
   ```

### Database Reset

If you encounter data corruption or need a fresh start:

```bash
# Complete reset (removes all data)
yarn db:down
sudo rm -rf ./data
yarn db:up
yarn migrate
```

## Production Deployment

For production deployment:

1. Use a managed database service (AWS RDS, Google Cloud SQL, Azure Database for PostgreSQL, etc.)
2. Update `.env.production` with production database credentials
3. Set `NODE_ENV=production`
4. Ensure proper security groups and firewall rules
5. Use environment variables or secret management instead of .env files
6. Enable SSL/TLS connections for PostgreSQL in production

## Security Considerations

- Never commit `.env` files containing real credentials
- Use different passwords for each environment
- Enable SSL/TLS for production database connections
- Implement proper backup and disaster recovery procedures
- Consider using database connection pooling for high-traffic applications

# Integration Tests for Order Management System

This document explains how to run integration tests for the Order Management System API.

## Overview

The integration tests are designed to test the API endpoints, business logic, and database interactions. The tests use Jest as the testing framework and Supertest for making HTTP requests to the API.

## Test Structure

The tests are organized into several files:

1. **orders.test.ts**: Tests the CRUD operations on orders
2. **order-pricing.test.ts**: Tests the discount and pricing logic
3. **error-handling.test.ts**: Tests the API error handling and validation

## Running the Tests

### Prerequisites

- Node.js (v20 or higher)
- Yarn or npm

### Option 1: Run Tests Locally

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Run the tests:

   ```bash
   yarn test
   ```

3. Run the tests with coverage:

   ```bash
   yarn test:coverage
   ```

4. Run the tests in watch mode:
   ```bash
   yarn test:watch
   ```

## Test Database

The tests use an in-memory SQLite database that is set up before the tests run and cleaned up after all tests are complete. Each test suite runs with a fresh database state.

## Test Fixtures

The test fixtures are set up in `src/__tests__/setup.ts`. This includes:

- A product with a price of $150 and weight of 365g
- Five warehouses in different locations with varying stock levels

## Test Coverage

Run the test coverage report to see which parts of the code are covered by the tests:

```bash
yarn test:coverage
```

This will generate a coverage report in the `coverage` directory.

## Extending the Tests

When adding new features to the API, also add corresponding tests in the appropriate test file. If a feature doesn't fit into the existing test files, create a new test file in the `src/__tests__` directory.

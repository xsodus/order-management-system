# Order System Management

## Overview

SCOS device is becoming increasingly popular, and to make sure we can handle future demand, we have decided to introduce a new order management system for our sales team.

### SCOS Device Information

| Name   | SCOS Station P1 Pro |
| ------ | ------------------- |
| Price  | $150                |
| Weight | 365g                |

#### Volume Discount

- 25+ units: 5% discount
- 50+ units: 10% discount
- 100+ units: 15% discount
- 250+ units: 20% discount

The device ships from 6 different warehouses around the world. Below is a list of warehouses with geographical location and current stock.

### Warehouses and Stock

| Name        | Coordinates (latitude/longitude) | Stock |
| ----------- | -------------------------------- | ----- |
| Los Angeles | 33.9425, -118.408056             | 355   |
| New York    | 40.639722, -73.778889            | 578   |
| São Paulo   | -23.435556, -46.473056           | 265   |
| Paris       | 49.009722, 2.547778              | 694   |
| Warsaw      | 52.165833, 20.967222             | 245   |
| Hong Kong   | 22.308889, 113.914444            | 419   |

> The cost of shipping an order is calculated based on the geographical distance between the warehouse and the shipping address, and the weight of the shipment.  
> The rate is **$0.01 per kilogram per kilometer**.

A single order can be shipped from multiple warehouses.  
However, the cost must be minimized.  
If **shipping cost exceeds 15% of the order amount after discount**, the order is **invalid** and should not be processed.

---

## Your Task

Design and implement the backend of the system.

### Functional Requirements

There are 2 API endpoints that we need to create

```
GET /orders
```

1. [x] A sales rep should be able to **verify** a potential order without submitting it, by inputting:

- Number of devices
- Coordinates (latitude/longitude) of the shipping address

The rep should be able to see:

- Total price
- Discount
- Shipping cost
- Order validity indication

```
POST /orders
```

2. [x] A sales rep should be able to **submit** an order by inputting:

- Number of devices
- Coordinates (latitude/longitude) of the shipping address  
  A successful order should:
- Update warehouse inventory immediately
- Assign an order number
- Store total price, discount and shipping cost as calculated at submission time

### Technical Tasks

- [x] Implement in **TypeScript**
- [x] Create a database structure based on SCOS Device Information, Warehouses and Stock, API endpoints
- [x] Expose a **well-documented API** with swagger API doc
- [x] Create integration tests againts API with Jest that focusing only main requirements
- [x] Approach the solution like a **production system**
- [x] Consider performance, scalability, consistency, extensibility
- [x] It should be **easy to start the application and run tests locally**
- [x] Deploying the app to Azure App service via GitHub workflow
- [x] Implement logging with timestamps with winston library for request tracking and debugging
- [x] Use decimal data type of decimal.js for financial number and calculation.
- [x] Add `basePrice` to display on the response of API
- [x] **Environment Configuration**:
  - Create separate environment files for production and development
  - Configure database connection settings in each environment
  - Set appropriate logging levels for each environment
- [x] **Testing Infrastructure**:
  - Integrate `testcontainers` library for running integration tests with PostgreSQL database
  - Configure tests to spin up isolated Docker containers for testing
  - Ensure tests can run independently of local environment
- [x] Update data warehouse to query data by using ST_Distance function from PostGIS extension

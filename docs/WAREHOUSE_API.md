# Warehouse API Examples

This document provides examples of how to use the Warehouse API endpoints.

## Base URL

```
http://localhost:3000/api/warehouses
```

## API Documentation

The full API documentation is available at:

```
http://localhost:3000/api-docs
```

## 1. Create a Warehouse

**Endpoint:** `POST /api/warehouses`

**Request Body:**

```json
{
  "name": "Seattle Distribution Center",
  "latitude": 47.608013,
  "longitude": -122.335167,
  "stock": 500
}
```

**Example using curl:**

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seattle Distribution Center",
    "latitude": 47.608013,
    "longitude": -122.335167,
    "stock": 500
  }'
```

**Response (201 Created):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Seattle Distribution Center",
  "latitude": 47.608013,
  "longitude": -122.335167,
  "stock": 500,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 2. Get All Warehouses

**Endpoint:** `GET /api/warehouses`

**Example using curl:**

```bash
curl http://localhost:3000/api/warehouses
```

**Response (200 OK):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Hong Kong",
    "latitude": 22.308889,
    "longitude": 113.914444,
    "stock": 419,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  },
  {
    "id": "4gb96g75-6828-5673-c4gd-3d074g77bgb7",
    "name": "Los Angeles",
    "latitude": 33.9425,
    "longitude": -118.408056,
    "stock": 355,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-14T12:15:00.000Z"
  }
]
```

## 3. Get Warehouse by ID

**Endpoint:** `GET /api/warehouses/{id}`

**Example using curl:**

```bash
curl http://localhost:3000/api/warehouses/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response (200 OK):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "New York",
  "latitude": 40.639722,
  "longitude": -73.778889,
  "stock": 578,
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 4. Update Warehouse Stock

**Endpoint:** `PUT /api/warehouses/{id}/stock`

**Request Body:**

```json
{
  "stock": 750
}
```

**Example using curl:**

```bash
curl -X PUT http://localhost:3000/api/warehouses/3fa85f64-5717-4562-b3fc-2c963f66afa6/stock \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 750
  }'
```

**Response (200 OK):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "New York",
  "latitude": 40.639722,
  "longitude": -73.778889,
  "stock": 750,
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-01-15T15:45:00.000Z"
}
```

## 5. Delete Warehouse

**Endpoint:** `DELETE /api/warehouses/{id}`

**Example using curl:**

```bash
curl -X DELETE http://localhost:3000/api/warehouses/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response (204 No Content):**

```
(No response body)
```

## Error Responses

### 400 Bad Request

```json
{
  "status": "error",
  "errors": [
    {
      "field": "stock",
      "message": "Stock must be a non-negative integer"
    }
  ]
}
```

### 404 Not Found

```json
{
  "status": "error",
  "message": "Warehouse with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' not found"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "message": "An unexpected error occurred"
}
```

## Validation Rules

- **name**: Required, string, 1-100 characters, must be unique
- **latitude**: Required, number between -90 and 90
- **longitude**: Required, number between -180 and 180
- **stock**: Required, non-negative integer
- **id**: Must be a valid UUID format for path parameters

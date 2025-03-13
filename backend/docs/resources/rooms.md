# Room Management API

This document details the endpoints for managing rooms in the Hotel Booking system.

## Endpoints

### Get All Rooms

Retrieve a list of all rooms.

```http
GET /api/rooms
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/rooms'
```

**Response** (200 OK)
```json
[
  {
    "idRoom": 1,
    "roomNumber": "101",
    "type": "Standard",
    "price": 100.00,
    "status": "Available",
    "description": "Comfortable standard room with queen bed"
  },
  {
    "idRoom": 2,
    "roomNumber": "201",
    "type": "Deluxe",
    "price": 200.00,
    "status": "Occupied",
    "description": "Luxurious deluxe room with king bed and city view"
  }
]
```

### Get Room by ID

Retrieve a specific room by its ID.

```http
GET /api/rooms/:id
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/rooms/1'
```

**Response** (200 OK)
```json
{
  "idRoom": 1,
  "roomNumber": "101",
  "type": "Standard",
  "price": 100.00,
  "status": "Available",
  "description": "Comfortable standard room with queen bed"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "Room not found"
}
```

### Create Room

Create a new room.

```http
POST /api/rooms
Content-Type: application/json
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| roomNumber | string | Yes | Unique room identifier |
| type | string | Yes | Room type (Standard, Deluxe, Suite) |
| price | number | Yes | Room price per night |
| status | string | Yes | Room status (Available, Occupied, Maintenance) |
| description | string | No | Room description |

**cURL Example**
```bash
curl -X POST \
  'http://localhost:5000/api/rooms' \
  -H 'Content-Type: application/json' \
  -d '{
    "roomNumber": "101",
    "type": "Standard",
    "price": 100.00,
    "status": "Available",
    "description": "Comfortable standard room with queen bed"
  }'
```

**Response** (201 Created)
```json
{
  "idRoom": 1,
  "roomNumber": "101",
  "type": "Standard",
  "price": 100.00,
  "status": "Available",
  "description": "Comfortable standard room with queen bed"
}
```

### Update Room

Update an existing room's information.

```http
PUT /api/rooms/:id
Content-Type: application/json
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| roomNumber | string | Yes | Unique room identifier |
| type | string | Yes | Room type (Standard, Deluxe, Suite) |
| price | number | Yes | Room price per night |
| status | string | Yes | Room status (Available, Occupied, Maintenance) |
| description | string | No | Room description |

**cURL Example**
```bash
curl -X PUT \
  'http://localhost:5000/api/rooms/1' \
  -H 'Content-Type: application/json' \
  -d '{
    "roomNumber": "101",
    "type": "Deluxe",
    "price": 150.00,
    "status": "Available",
    "description": "Upgraded to deluxe room with city view"
  }'
```

**Response** (200 OK)
```json
{
  "idRoom": 1,
  "roomNumber": "101",
  "type": "Deluxe",
  "price": 150.00,
  "status": "Available",
  "description": "Upgraded to deluxe room with city view"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "Room not found"
}
```

### Delete Room

Remove a room from the system.

```http
DELETE /api/rooms/:id
```

**cURL Example**
```bash
curl -X DELETE \
  'http://localhost:5000/api/rooms/1'
```

**Response** (200 OK)
```json
{
  "message": "Room deleted successfully"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "Room not found"
}
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "errors": [
    {
      "msg": "Room number is required",
      "param": "roomNumber",
      "location": "body"
    }
  ]
}
```

### Server Error (500 Internal Server Error)
```json
{
  "message": "Error processing request",
  "error": "Internal server error details"
}
```
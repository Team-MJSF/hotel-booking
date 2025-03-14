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

### Check Room Availability

Check availability of rooms for a specific date range with optional filtering by room type and guest capacity.

```http
GET /api/rooms/availability?checkInDate=YYYY-MM-DD&checkOutDate=YYYY-MM-DD&roomType=TYPE&maxGuests=NUMBER
```

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| checkInDate | string (YYYY-MM-DD) | Yes | The requested check-in date |
| checkOutDate | string (YYYY-MM-DD) | Yes | The requested check-out date |
| roomType | string | No | Filter by room type (Single, Double, Suite) |
| maxGuests | number | No | Filter by minimum guest capacity |

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/rooms/availability?checkInDate=2023-12-01&checkOutDate=2023-12-05&roomType=Double&maxGuests=2'
```

**Response** (200 OK)
```json
{
  "availableRooms": [
    {
      "roomId": 1,
      "roomNumber": "101",
      "roomType": "Double",
      "pricePerNight": 150.00,
      "maxGuests": 2,
      "description": "Comfortable double room with queen bed",
      "availabilityStatus": "Available",
      "amenities": ["TV", "WiFi", "Air Conditioning"]
    },
    {
      "roomId": 3,
      "roomNumber": "103",
      "roomType": "Double",
      "pricePerNight": 160.00,
      "maxGuests": 2,
      "description": "Spacious double room with city view",
      "availabilityStatus": "Available",
      "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar"]
    }
  ],
  "totalAvailable": 2
}
```

**Error Responses**

*Invalid Date Parameters (400 Bad Request)*
```json
{
  "message": "Both checkInDate and checkOutDate are required"
}
```

*Invalid Date Range (400 Bad Request)*
```json
{
  "message": "checkOutDate must be after checkInDate"
}
```

### Get Rooms by Amenities

Filter rooms based on specific amenities, with optional room type filtering.

```http
GET /api/rooms/amenities?amenities=AMENITY1,AMENITY2&roomType=TYPE
```

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| amenities | string | Yes | Comma-separated list of amenities to filter by (e.g., "wifi,minibar") |
| roomType | string | No | Optional filter for room type (Single, Double, Suite) |

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/rooms/amenities?amenities=wifi,minibar&roomType=Double'
```

**Response** (200 OK)
```json
{
  "rooms": [
    {
      "roomId": 2,
      "roomNumber": "102",
      "roomType": "Double",
      "pricePerNight": 150.00,
      "maxGuests": 2,
      "description": "Comfortable double room with amenities",
      "availabilityStatus": "Available",
      "amenities": ["wifi", "tv", "minibar"]
    }
  ],
  "totalRooms": 1,
  "requestedAmenities": ["wifi,minibar"]
}
```

**Error Response** (400 Bad Request)
```json
{
  "message": "Amenities parameter is required"
}
```

**Error Response** (500 Internal Server Error)
```json
{
  "message": "Error fetching rooms by amenities",
  "error": "Error details"
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
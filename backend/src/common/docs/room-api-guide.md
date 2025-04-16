# Room Management API Documentation

## Introduction

The Room Management API provides endpoints to manage both room types and individual rooms in the hotel. It allows browsing room listings, searching for available rooms, and checking real-time availability for specific date ranges.

## Authentication

Public endpoints like listing and searching rooms don't require authentication. Administrative operations (create, update, delete) require authentication with an admin role.

For admin operations, include a valid JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## API Endpoints

### Room Types

#### Get All Room Types

Retrieves a list of all available room types.

**Endpoint:** `GET /room-types`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Standard Single",
    "description": "Comfortable standard room with city view",
    "pricePerNight": 9999, // in cents
    "maxGuests": 2,
    "amenities": ["TV", "WiFi", "Air Conditioning"],
    "imageUrl": "https://example.com/rooms/standard-single.jpg",
    "createdAt": "2023-04-01T10:00:00Z",
    "updatedAt": "2023-04-01T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Deluxe Suite",
    "description": "Spacious deluxe room with ocean view",
    "pricePerNight": 14999, // in cents
    "maxGuests": 3,
    "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar", "Ocean View"],
    "imageUrl": "https://example.com/rooms/deluxe-suite.jpg",
    "createdAt": "2023-04-01T10:00:00Z",
    "updatedAt": "2023-04-01T10:00:00Z"
  }
]
```

#### Get Room Type Details

Retrieves detailed information about a specific room type.

**Endpoint:** `GET /room-types/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Standard Single",
  "description": "Comfortable standard room with city view",
  "pricePerNight": 9999, // in cents
  "maxGuests": 2,
  "amenities": ["TV", "WiFi", "Air Conditioning"],
  "imageUrl": "https://example.com/rooms/standard-single.jpg",
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-01T10:00:00Z"
}
```

#### Create a Room Type (Admin Only)

Creates a new room type in the hotel inventory.

**Endpoint:** `POST /room-types`

**Request Body:**
```json
{
  "name": "Executive Suite",
  "description": "Luxury suite with separate living area",
  "pricePerNight": 19999, // in cents
  "maxGuests": 4,
  "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar", "Jacuzzi"],
  "imageUrl": "https://example.com/rooms/executive-suite.jpg"
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "name": "Executive Suite",
  "description": "Luxury suite with separate living area",
  "pricePerNight": 19999,
  "maxGuests": 4,
  "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar", "Jacuzzi"],
  "imageUrl": "https://example.com/rooms/executive-suite.jpg",
  "createdAt": "2023-04-05T12:00:00Z",
  "updatedAt": "2023-04-05T12:00:00Z"
}
```

#### Update a Room Type (Admin Only)

Updates an existing room type.

**Endpoint:** `PATCH /room-types/{id}`

**Request Body:**
```json
{
  "pricePerNight": 22999,
  "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar", "Jacuzzi", "Ocean View"]
}
```

**Response:** `200 OK`
```json
{
  "id": 3,
  "name": "Executive Suite",
  "description": "Luxury suite with separate living area",
  "pricePerNight": 22999,
  "maxGuests": 4,
  "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar", "Jacuzzi", "Ocean View"],
  "imageUrl": "https://example.com/rooms/executive-suite.jpg",
  "createdAt": "2023-04-05T12:00:00Z",
  "updatedAt": "2023-04-05T14:30:00Z"
}
```

#### Delete a Room Type (Admin Only)

Deletes a room type from the inventory.

**Endpoint:** `DELETE /room-types/{id}`

**Response:** `204 No Content`

### Individual Rooms

#### Get All Rooms

Retrieves a list of all individual rooms.

**Endpoint:** `GET /rooms`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "roomNumber": "101",
    "roomType": {
      "id": 1,
      "name": "Standard Single",
      "pricePerNight": 9999
    },
    "floor": 1,
    "status": "available",
    "createdAt": "2023-04-01T10:00:00Z",
    "updatedAt": "2023-04-01T10:00:00Z"
  },
  {
    "id": 2,
    "roomNumber": "201",
    "roomType": {
      "id": 2,
      "name": "Deluxe Suite",
      "pricePerNight": 14999
    },
    "floor": 2,
    "status": "available",
    "createdAt": "2023-04-01T10:00:00Z",
    "updatedAt": "2023-04-01T10:00:00Z"
  }
]
```

#### Get Room Details

Retrieves detailed information about a specific room.

**Endpoint:** `GET /rooms/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "roomNumber": "101",
  "roomType": {
    "id": 1,
    "name": "Standard Single",
    "description": "Comfortable standard room with city view",
    "pricePerNight": 9999,
    "maxGuests": 2,
    "amenities": ["TV", "WiFi", "Air Conditioning"],
    "imageUrl": "https://example.com/rooms/standard-single.jpg"
  },
  "floor": 1,
  "status": "available",
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-01T10:00:00Z"
}
```

#### Create a Room (Admin Only)

Creates a new individual room in the hotel inventory.

**Endpoint:** `POST /rooms`

**Request Body:**
```json
{
  "roomNumber": "102",
  "roomTypeId": 1,
  "floor": 1,
  "status": "available"
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "roomNumber": "102",
  "roomType": {
    "id": 1,
    "name": "Standard Single"
  },
  "floor": 1,
  "status": "available",
  "createdAt": "2023-04-05T12:00:00Z",
  "updatedAt": "2023-04-05T12:00:00Z"
}
```

### Room Availability

#### Check Room Type Availability

Check availability of a specific room type for a date range.

**Endpoint:** `GET /room-types/{roomTypeId}/availability`

**Query Parameters:**
- `checkInDate` (required): ISO date string for check-in
- `checkOutDate` (required): ISO date string for check-out

**Example Request:**
```
GET /room-types/1/availability?checkInDate=2023-05-15&checkOutDate=2023-05-20
```

**Response:** `200 OK`
```json
{
  "roomTypeId": 1,
  "availableCount": 3,
  "totalRooms": 5,
  "checkInDate": "2023-05-15",
  "checkOutDate": "2023-05-20"
}
```

### Search for Available Rooms

Search for room types based on various criteria such as date range, capacity, and price range.

**Endpoint:** `GET /rooms/search`

**Query Parameters:**
- `checkInDate` (required): ISO date string for check-in
- `checkOutDate` (required): ISO date string for check-out
- `maxGuests` (optional): Minimum number of guests the room should accommodate
- `minPrice` (optional): Minimum price per night (in cents)
- `maxPrice` (optional): Maximum price per night (in cents)
- `sortBy` (optional): Field to sort by (price, maxGuests)
- `sortOrder` (optional): Sort direction (asc, desc)

**Example Request:**
```
GET /rooms/search?checkInDate=2023-05-15&checkOutDate=2023-05-20&maxGuests=2&maxPrice=15000&sortBy=price&sortOrder=asc
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Standard Single",
    "description": "Comfortable standard room with city view",
    "pricePerNight": 9999,
    "maxGuests": 2,
    "amenities": ["TV", "WiFi", "Air Conditioning"],
    "imageUrl": "https://example.com/rooms/standard-single.jpg",
    "availableCount": 3
  },
  {
    "id": 3,
    "name": "Standard Double",
    "description": "Comfortable standard room with two beds",
    "pricePerNight": 12999,
    "maxGuests": 2,
    "amenities": ["TV", "WiFi", "Air Conditioning", "Coffee Machine"],
    "imageUrl": "https://example.com/rooms/standard-double.jpg",
    "availableCount": 1
  }
]
```

## Error Handling

The Room API handles errors with appropriate HTTP status codes:

- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions (e.g., non-admin user attempting an admin operation)
- `404 Not Found`: Room or room type not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error

Error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Invalid input: checkOutDate must be after checkInDate",
  "error": "Bad Request"
}
```

## Rate Limiting

The API implements rate limiting to protect against excessive requests. If you exceed the rate limit, you'll receive a 429 response with a Retry-After header indicating when you can resume requests.

## Pagination

For endpoints that return lists, you can use pagination parameters:

- `page`: Page number (starting from 1)
- `limit`: Number of items per page

Example:
```
GET /room-types?page=1&limit=10
```

Response includes pagination metadata:
```json
{
  "items": [...],
  "meta": {
    "totalItems": 25,
    "itemCount": 10,
    "itemsPerPage": 10,
    "totalPages": 3,
    "currentPage": 1
  }
}
``` 
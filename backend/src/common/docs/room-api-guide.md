# Room API Documentation

## Introduction

The Room API provides endpoints to manage hotel rooms and search for available rooms. It allows browsing room listings, searching with specific criteria, and managing room inventory (admin only).

## Authentication

Public endpoints like listing and searching rooms don't require authentication. Administrative operations (create, update, delete) require authentication with an admin role.

For admin operations, include a valid JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## API Endpoints

### Get All Rooms

Retrieves a list of all available rooms.

**Endpoint:** `GET /rooms`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "roomNumber": "101",
    "type": "single",
    "pricePerNight": 99.99,
    "maxGuests": 2,
    "amenities": ["TV", "WiFi", "Air Conditioning"],
    "availabilityStatus": "available",
    "description": "Comfortable standard room with city view",
    "photos": [
      {
        "url": "https://example.com/rooms/101/main.jpg",
        "type": "main",
        "caption": "Room 101 - Single",
        "displayOrder": 1
      }
    ],
    "createdAt": "2023-04-01T10:00:00Z",
    "updatedAt": "2023-04-01T10:00:00Z"
  },
  {
    "id": 2,
    "roomNumber": "201",
    "type": "deluxe",
    "pricePerNight": 149.99,
    "maxGuests": 3,
    "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar", "Ocean View"],
    "availabilityStatus": "available",
    "description": "Spacious deluxe room with ocean view",
    "photos": [
      {
        "url": "https://example.com/rooms/201/main.jpg",
        "type": "main",
        "caption": "Room 201 - Deluxe",
        "displayOrder": 1
      }
    ],
    "createdAt": "2023-04-01T10:00:00Z",
    "updatedAt": "2023-04-01T10:00:00Z"
  }
]
```

### Search for Available Rooms

Search for rooms based on various criteria such as date range, capacity, price range, and room type.

**Endpoint:** `GET /rooms/search`

**Query Parameters:**
- `checkInDate` (optional): ISO date string for check-in
- `checkOutDate` (optional): ISO date string for check-out
- `maxGuests` (optional): Minimum number of guests the room should accommodate
- `minPrice` (optional): Minimum price per night
- `maxPrice` (optional): Maximum price per night
- `type` (optional): Type of room (single, double, suite, deluxe)
- `sortBy` (optional): Field to sort by (pricePerNight, maxGuests, type)
- `sortOrder` (optional): Sort direction (asc, desc)

**Example Request:**
```
GET /rooms/search?checkInDate=2023-05-15T00:00:00Z&checkOutDate=2023-05-20T00:00:00Z&maxGuests=2&maxPrice=150&type=single&sortBy=pricePerNight&sortOrder=asc
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "roomNumber": "101",
    "type": "single",
    "pricePerNight": 99.99,
    "maxGuests": 2,
    "amenities": ["TV", "WiFi", "Air Conditioning"],
    "availabilityStatus": "available",
    "description": "Comfortable standard room with city view"
  },
  {
    "id": 3,
    "roomNumber": "102",
    "type": "single",
    "pricePerNight": 109.99,
    "maxGuests": 2,
    "amenities": ["TV", "WiFi", "Air Conditioning", "Coffee Machine"],
    "availabilityStatus": "available",
    "description": "Comfortable standard room with garden view"
  }
]
```

### Get Room Details

Retrieves detailed information about a specific room.

**Endpoint:** `GET /rooms/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "roomNumber": "101",
  "type": "single",
  "pricePerNight": 99.99,
  "maxGuests": 2,
  "amenities": ["TV", "WiFi", "Air Conditioning"],
  "availabilityStatus": "available",
  "description": "Comfortable standard room with city view",
  "photos": [
    {
      "url": "https://example.com/rooms/101/main.jpg",
      "type": "main",
      "caption": "Room 101 - Single",
      "displayOrder": 1
    },
    {
      "url": "https://example.com/rooms/101/gallery1.jpg",
      "type": "gallery",
      "caption": "Bathroom",
      "displayOrder": 2
    }
  ],
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-01T10:00:00Z"
}
```

### Create a Room (Admin Only)

Creates a new room in the hotel inventory.

**Endpoint:** `POST /rooms`

**Request Body:**
```json
{
  "roomNumber": "102",
  "type": "single",
  "pricePerNight": 99.99,
  "maxGuests": 2,
  "amenities": ["TV", "WiFi", "Air Conditioning"],
  "description": "Comfortable standard room with city view",
  "photos": [
    {
      "url": "https://example.com/rooms/102/main.jpg",
      "type": "main",
      "caption": "Room 102 - Single",
      "displayOrder": 1
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "roomNumber": "102",
  "type": "single",
  "pricePerNight": 99.99,
  "maxGuests": 2,
  "amenities": ["TV", "WiFi", "Air Conditioning"],
  "availabilityStatus": "available",
  "description": "Comfortable standard room with city view",
  "photos": [
    {
      "url": "https://example.com/rooms/102/main.jpg",
      "type": "main",
      "caption": "Room 102 - Single",
      "displayOrder": 1
    }
  ],
  "createdAt": "2023-04-05T12:00:00Z",
  "updatedAt": "2023-04-05T12:00:00Z"
}
```

### Update a Room (Admin Only)

Updates an existing room's details.

**Endpoint:** `PATCH /rooms/{id}`

**Request Body:** (partial update)
```json
{
  "pricePerNight": 109.99,
  "amenities": ["TV", "WiFi", "Air Conditioning", "Coffee Machine"],
  "availabilityStatus": "maintenance"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "roomNumber": "101",
  "type": "single",
  "pricePerNight": 109.99,
  "maxGuests": 2,
  "amenities": ["TV", "WiFi", "Air Conditioning", "Coffee Machine"],
  "availabilityStatus": "maintenance",
  "description": "Comfortable standard room with city view",
  "photos": [
    {
      "url": "https://example.com/rooms/101/main.jpg",
      "type": "main",
      "caption": "Room 101 - Single",
      "displayOrder": 1
    }
  ],
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-05T12:00:00Z"
}
```

### Delete a Room (Admin Only)

Removes a room from the hotel inventory.

**Endpoint:** `DELETE /rooms/{id}`

**Response:** `200 OK`

## Room Types

The system supports various room types:

- **single**: Basic room with a single bed
- **double**: Room with a double bed or two single beds
- **suite**: Luxury suite with separate living area
- **deluxe**: Premium room with enhanced amenities and space

## Availability Status

Rooms can have the following availability statuses:

- **available**: Room is available for booking
- **occupied**: Room is currently occupied by guests
- **maintenance**: Room is under maintenance and not available for booking
- **cleaning**: Room is being cleaned and will be available soon

## Photo Types

Room photos can be of the following types:

- **main**: Main featured photo of the room
- **gallery**: Additional photos for the room gallery
- **amenity**: Photos specifically showing room amenities

## Amenities

Rooms can include various amenities:

- TV
- WiFi
- Air Conditioning
- Mini Bar
- Coffee Machine
- Ocean View
- Garden View
- City View
- Bathtub
- Balcony
- King Bed
- Queen Bed
- Twin Beds

## Validation Rules

When creating or updating rooms, the following validation rules apply:

1. Room number must be unique
2. Price per night must be positive
3. Maximum guests must be at least 1
4. Room must have a valid room type
5. Availability status must be one of the defined statuses

## Error Responses

The API returns standardized error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Room number must be unique"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Room with ID 999 not found",
  "error": "Not Found"
}
```

## Usage Examples

### Finding Available Rooms for a Stay

To find rooms available for a specific date range:

```
GET /rooms/search?checkInDate=2023-06-10T00:00:00Z&checkOutDate=2023-06-15T00:00:00Z
```

### Finding Affordable Rooms for a Family

To find rooms that can accommodate a family of 4 with a limited budget:

```
GET /rooms/search?maxGuests=4&maxPrice=200
```

### Finding Specific Room Types

To find deluxe rooms, sorted by price:

```
GET /rooms/search?type=deluxe&sortBy=pricePerNight&sortOrder=asc
```

### Finding Rooms Under Maintenance

For administrators to find rooms currently under maintenance:

```
GET /rooms/search?availabilityStatus=maintenance
``` 
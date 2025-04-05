# Booking API Documentation

## Introduction

The Booking API provides endpoints to manage hotel room bookings. It allows users to create, view, update, and cancel their bookings.

## Authentication

All booking endpoints require authentication. You must include a valid JWT token in the Authorization header of your requests.

```
Authorization: Bearer your_jwt_token
```

## API Endpoints

### Create a Booking

Creates a new booking for a hotel room.

**Endpoint:** `POST /bookings`

**Request Body:**
```json
{
  "roomId": 2,
  "checkInDate": "2023-05-15T14:00:00Z",
  "checkOutDate": "2023-05-20T11:00:00Z",
  "numberOfGuests": 2,
  "specialRequests": "Non-smoking room, high floor if possible"
}
```

> Note: The `userId` is automatically populated from the authenticated user's token.

**Response:** `201 Created`
```json
{
  "bookingId": 1,
  "checkInDate": "2023-05-15T14:00:00Z",
  "checkOutDate": "2023-05-20T11:00:00Z",
  "numberOfGuests": 2,
  "specialRequests": "Non-smoking room, high floor if possible",
  "status": "pending",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "room": {
    "id": 2,
    "roomNumber": "101",
    "roomType": "deluxe",
    "pricePerNight": 150.00
  },
  "createdAt": "2023-04-05T12:00:00Z",
  "updatedAt": "2023-04-05T12:00:00Z"
}
```

### Get All Bookings

Retrieves all bookings for the authenticated user. Admin users can see all bookings in the system.

**Endpoint:** `GET /bookings`

**Response:** `200 OK`
```json
[
  {
    "bookingId": 1,
    "checkInDate": "2023-05-15T14:00:00Z",
    "checkOutDate": "2023-05-20T11:00:00Z",
    "numberOfGuests": 2,
    "specialRequests": "Non-smoking room",
    "status": "confirmed",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "room": {
      "id": 2,
      "roomNumber": "101",
      "roomType": "deluxe"
    },
    "createdAt": "2023-04-05T12:00:00Z",
    "updatedAt": "2023-04-05T12:00:00Z"
  },
  {
    "bookingId": 2,
    "checkInDate": "2023-06-01T15:00:00Z",
    "checkOutDate": "2023-06-03T10:00:00Z",
    "numberOfGuests": 1,
    "status": "pending",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "room": {
      "id": 3,
      "roomNumber": "202",
      "roomType": "standard"
    },
    "createdAt": "2023-04-05T14:30:00Z",
    "updatedAt": "2023-04-05T14:30:00Z"
  }
]
```

### Get Booking Details

Retrieves detailed information about a specific booking.

**Endpoint:** `GET /bookings/{id}`

**Response:** `200 OK`
```json
{
  "bookingId": 1,
  "checkInDate": "2023-05-15T14:00:00Z",
  "checkOutDate": "2023-05-20T11:00:00Z",
  "numberOfGuests": 2,
  "specialRequests": "Non-smoking room",
  "status": "confirmed",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "room": {
    "id": 2,
    "roomNumber": "101",
    "roomType": "deluxe",
    "pricePerNight": 150.00
  },
  "payment": {
    "id": 1,
    "amount": 750.00,
    "status": "paid"
  },
  "createdAt": "2023-04-05T12:00:00Z",
  "updatedAt": "2023-04-05T12:00:00Z"
}
```

### Update a Booking

Updates an existing booking. You can update dates, number of guests, special requests, or change the booking status.

**Endpoint:** `PATCH /bookings/{id}`

**Request Body:** (partial update)
```json
{
  "checkInDate": "2023-05-16T14:00:00Z",
  "checkOutDate": "2023-05-21T11:00:00Z",
  "numberOfGuests": 3
}
```

**Response:** `200 OK`
```json
{
  "bookingId": 1,
  "checkInDate": "2023-05-16T14:00:00Z",
  "checkOutDate": "2023-05-21T11:00:00Z",
  "numberOfGuests": 3,
  "specialRequests": "Non-smoking room",
  "status": "confirmed",
  "createdAt": "2023-04-05T12:00:00Z",
  "updatedAt": "2023-04-05T15:30:00Z"
}
```

### Cancel a Booking

You can cancel a booking by updating its status:

**Endpoint:** `PATCH /bookings/{id}`

**Request Body:**
```json
{
  "status": "cancelled"
}
```

**Response:** `200 OK`
```json
{
  "bookingId": 1,
  "checkInDate": "2023-05-16T14:00:00Z",
  "checkOutDate": "2023-05-21T11:00:00Z",
  "numberOfGuests": 3,
  "specialRequests": "Non-smoking room",
  "status": "cancelled",
  "createdAt": "2023-04-05T12:00:00Z",
  "updatedAt": "2023-04-05T16:45:00Z"
}
```

### Delete a Booking

Soft-deletes a booking from the system. The booking will remain in the database but marked as deleted.

**Endpoint:** `DELETE /bookings/{id}`

**Response:** `200 OK`

## Booking Status

A booking can have one of the following statuses:

- **pending**: Initial state when a booking is created
- **confirmed**: Booking has been confirmed (typically after payment)
- **cancelled**: Booking has been cancelled by the user or system
- **completed**: Booking stay period has ended

## Validation Rules

When creating or updating bookings, the following validation rules apply:

1. Check-in date must be before check-out date
2. Check-in date must be in the future
3. The room must be available for the requested dates
4. The number of guests must not exceed the room capacity

## Error Responses

The API returns standardized error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Check-in date must be before check-out date"],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Booking with ID 123 not found",
  "error": "Not Found"
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

## Testing in Swagger

1. First authenticate using the `/auth/login` endpoint
2. Click the "Authorize" button at the top of the Swagger UI
3. Enter your token in the format: `Bearer your_access_token_here`
4. Now you can test the booking endpoints with your authentication applied 
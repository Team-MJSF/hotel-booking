# Booking Management API

This document details the endpoints for managing bookings in the Hotel Booking system.

## Endpoints

### Get All Bookings

Retrieve a list of all bookings.

```http
GET /api/bookings
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/bookings'
```

**Response** (200 OK)
```json
[
  {
    "idBooking": 1,
    "idUser": 1,
    "idRoom": 101,
    "checkInDate": "2024-02-01",
    "checkOutDate": "2024-02-05",
    "totalPrice": 400.00,
    "status": "Confirmed",
    "specialRequests": "Early check-in requested"
  },
  {
    "idBooking": 2,
    "idUser": 2,
    "idRoom": 102,
    "checkInDate": "2024-02-10",
    "checkOutDate": "2024-02-15",
    "totalPrice": 750.00,
    "status": "Pending",
    "specialRequests": null
  }
]
```

### Get Booking by ID

Retrieve a specific booking by its ID.

```http
GET /api/bookings/:id
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/bookings/1'
```

**Response** (200 OK)
```json
{
  "idBooking": 1,
  "idUser": 1,
  "idRoom": 101,
  "checkInDate": "2024-02-01",
  "checkOutDate": "2024-02-05",
  "totalPrice": 400.00,
  "status": "Confirmed",
  "specialRequests": "Early check-in requested"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "Booking not found"
}
```

### Create Booking

Create a new booking.

```http
POST /api/bookings
Content-Type: application/json
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idUser | integer | Yes | ID of the user making the booking |
| idRoom | integer | Yes | ID of the room being booked |
| checkInDate | string | Yes | Check-in date (YYYY-MM-DD) |
| checkOutDate | string | Yes | Check-out date (YYYY-MM-DD) |
| specialRequests | string | No | Any special requests or notes |

**cURL Example**
```bash
curl -X POST \
  'http://localhost:5000/api/bookings' \
  -H 'Content-Type: application/json' \
  -d '{
    "idUser": 1,
    "idRoom": 101,
    "checkInDate": "2024-02-01",
    "checkOutDate": "2024-02-05",
    "specialRequests": "Early check-in requested"
  }'
```

**Response** (201 Created)
```json
{
  "idBooking": 1,
  "idUser": 1,
  "idRoom": 101,
  "checkInDate": "2024-02-01",
  "checkOutDate": "2024-02-05",
  "totalPrice": 400.00,
  "status": "Confirmed",
  "specialRequests": "Early check-in requested"
}
```

### Update Booking

Update an existing booking's information.

```http
PUT /api/bookings/:id
Content-Type: application/json
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| checkInDate | string | No | Updated check-in date |
| checkOutDate | string | No | Updated check-out date |
| status | string | No | Booking status (Confirmed, Pending, Cancelled) |
| specialRequests | string | No | Updated special requests |

**cURL Example**
```bash
curl -X PUT \
  'http://localhost:5000/api/bookings/1' \
  -H 'Content-Type: application/json' \
  -d '{
    "checkInDate": "2024-02-02",
    "checkOutDate": "2024-02-06",
    "status": "Confirmed",
    "specialRequests": "Late check-out requested"
  }'
```

**Response** (200 OK)
```json
{
  "idBooking": 1,
  "idUser": 1,
  "idRoom": 101,
  "checkInDate": "2024-02-02",
  "checkOutDate": "2024-02-06",
  "totalPrice": 400.00,
  "status": "Confirmed",
  "specialRequests": "Late check-out requested"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "Booking not found"
}
```

### Delete Booking

Cancel and remove a booking from the system.

```http
DELETE /api/bookings/:id
```

**cURL Example**
```bash
curl -X DELETE \
  'http://localhost:5000/api/bookings/1'
```

**Response** (200 OK)
```json
{
  "message": "Booking deleted successfully"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "Booking not found"
}
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "errors": [
    {
      "msg": "Check-in date must be before check-out date",
      "param": "checkInDate",
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
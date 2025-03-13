# Payment Management API

This document details the endpoints for managing payments in the Hotel Booking system.

## Endpoints

### Get All Payments

Retrieve a list of all payments.

```http
GET /api/payments
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/payments'
```

**Response** (200 OK)
```json
[
  {
    "idPayment": 1,
    "idBooking": 1,
    "amount": 400.00,
    "paymentMethod": "Credit Card",
    "status": "Completed",
    "transactionDate": "2024-02-01T10:30:00Z"
  },
  {
    "idPayment": 2,
    "idBooking": 2,
    "amount": 750.00,
    "paymentMethod": "PayPal",
    "status": "Pending",
    "transactionDate": "2024-02-01T11:15:00Z"
  }
]
```

### Get Payment by ID

Retrieve a specific payment by its ID.

```http
GET /api/payments/:id
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/payments/1'
```

**Response** (200 OK)
```json
{
  "idPayment": 1,
  "idBooking": 1,
  "amount": 400.00,
  "paymentMethod": "Credit Card",
  "status": "Completed",
  "transactionDate": "2024-02-01T10:30:00Z"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "Payment not found"
}
```

### Create Payment

Create a new payment for a booking.

```http
POST /api/payments
Content-Type: application/json
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idBooking | integer | Yes | ID of the booking being paid for |
| amount | number | Yes | Payment amount |
| paymentMethod | string | Yes | Payment method (Credit Card, PayPal, Bank Transfer) |
| paymentDetails | object | Yes | Payment method specific details |

**cURL Example**
```bash
curl -X POST \
  'http://localhost:5000/api/payments' \
  -H 'Content-Type: application/json' \
  -d '{
    "idBooking": 1,
    "amount": 400.00,
    "paymentMethod": "Credit Card",
    "paymentDetails": {
      "cardNumber": "**** **** **** 1234",
      "expiryDate": "12/25",
      "cardHolderName": "John Doe"
    }
  }'
```

**Response** (201 Created)
```json
{
  "idPayment": 1,
  "idBooking": 1,
  "amount": 400.00,
  "paymentMethod": "Credit Card",
  "status": "Completed",
  "transactionDate": "2024-02-01T10:30:00Z"
}
```

### Update Payment

Update an existing payment's information.

```http
PUT /api/payments/:id
Content-Type: application/json
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | Payment status (Completed, Pending, Failed) |
| paymentDetails | object | No | Updated payment details |

**cURL Example**
```bash
curl -X PUT \
  'http://localhost:5000/api/payments/1' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Completed",
    "paymentDetails": {
      "transactionId": "txn_123456789"
    }
  }'
```

**Response** (200 OK)
```json
{
  "idPayment": 1,
  "idBooking": 1,
  "amount": 400.00,
  "paymentMethod": "Credit Card",
  "status": "Completed",
  "transactionDate": "2024-02-01T10:30:00Z"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "Payment not found"
}
```

### Delete Payment

Remove a payment record from the system.

```http
DELETE /api/payments/:id
```

**cURL Example**
```bash
curl -X DELETE \
  'http://localhost:5000/api/payments/1'
```

**Response** (200 OK)
```json
{
  "message": "Payment deleted successfully"
}
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "errors": [
    {
      "msg": "Invalid payment amount",
      "param": "amount",
      "location": "body"
    }
  ]
}
```

### Server Error (500 Internal Server Error)
```json
{
  "message": "Error processing payment",
  "error": "Internal server error details"
}
```
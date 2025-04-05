# Payment API Documentation

## Introduction

The Payment API provides endpoints for processing and managing payments for hotel bookings. It supports features like payment processing, transaction history, payment verification, and refunds.

## Authentication

All payment endpoints require authentication. Users can only access their own payment information, while admins can access all payment records.

For all endpoints, include a valid JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## API Endpoints

### Process Payment

Processes a payment for a booking.

**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "bookingId": 123,
  "amount": 299.99,
  "paymentMethod": "creditCard",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123",
    "cardholderName": "John Doe"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "bookingId": 123,
  "amount": 299.99,
  "paymentMethod": "creditCard",
  "status": "completed",
  "transactionId": "txn_1234567890",
  "userId": 1,
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-01T10:00:00Z"
}
```

### Get All Payments (Admin Only)

Retrieves a list of all payments in the system.

**Endpoint:** `GET /payments`

**Query Parameters:**
- `status` (optional): Filter by payment status (completed, pending, failed, refunded)
- `startDate` (optional): Filter payments made after this date
- `endDate` (optional): Filter payments made before this date
- `userId` (optional): Filter payments by specific user

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "bookingId": 123,
    "amount": 299.99,
    "paymentMethod": "creditCard",
    "status": "completed",
    "transactionId": "txn_1234567890",
    "userId": 1,
    "createdAt": "2023-04-01T10:00:00Z",
    "updatedAt": "2023-04-01T10:00:00Z"
  },
  {
    "id": 2,
    "bookingId": 124,
    "amount": 199.99,
    "paymentMethod": "paypal",
    "status": "completed",
    "transactionId": "txn_0987654321",
    "userId": 2,
    "createdAt": "2023-04-02T11:00:00Z",
    "updatedAt": "2023-04-02T11:00:00Z"
  }
]
```

### Get Payment by ID

Retrieves details of a specific payment. Users can only view their own payments, while admins can view any payment.

**Endpoint:** `GET /payments/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "bookingId": 123,
  "amount": 299.99,
  "paymentMethod": "creditCard",
  "status": "completed",
  "transactionId": "txn_1234567890",
  "userId": 1,
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-01T10:00:00Z",
  "cardDetails": {
    "lastFourDigits": "1111",
    "cardType": "Visa"
  }
}
```

### Get User's Payment History

Retrieves the payment history for the currently authenticated user.

**Endpoint:** `GET /payments/my-payments`

**Query Parameters:**
- `status` (optional): Filter by payment status
- `startDate` (optional): Filter payments made after this date
- `endDate` (optional): Filter payments made before this date

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "bookingId": 123,
    "amount": 299.99,
    "paymentMethod": "creditCard",
    "status": "completed",
    "transactionId": "txn_1234567890",
    "createdAt": "2023-04-01T10:00:00Z"
  },
  {
    "id": 3,
    "bookingId": 125,
    "amount": 349.99,
    "paymentMethod": "creditCard",
    "status": "completed",
    "transactionId": "txn_5678901234",
    "createdAt": "2023-04-05T14:00:00Z"
  }
]
```

### Process Refund (Admin Only)

Processes a refund for a payment.

**Endpoint:** `POST /payments/{id}/refund`

**Request Body:**
```json
{
  "amount": 299.99,
  "reason": "Booking cancelled by customer"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "bookingId": 123,
  "amount": 299.99,
  "paymentMethod": "creditCard",
  "status": "refunded",
  "transactionId": "txn_1234567890",
  "refundId": "ref_1234567890",
  "refundAmount": 299.99,
  "refundReason": "Booking cancelled by customer",
  "userId": 1,
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-10T09:00:00Z"
}
```

### Verify Payment Status

Verifies the status of a payment.

**Endpoint:** `GET /payments/{id}/verify`

**Response:** `200 OK`
```json
{
  "paymentId": 1,
  "status": "completed",
  "verified": true,
  "transactionId": "txn_1234567890",
  "verificationTimestamp": "2023-04-01T10:05:00Z"
}
```

## Payment Methods

The system supports the following payment methods:

- **creditCard**: Payment using credit or debit card
- **paypal**: Payment using PayPal
- **bankTransfer**: Payment via bank transfer
- **cash**: Cash payment (only for in-person payments)

## Payment Statuses

Payments can have the following statuses:

- **pending**: Payment is being processed
- **completed**: Payment has been successfully processed
- **failed**: Payment processing failed
- **refunded**: Payment has been refunded
- **partiallyRefunded**: Payment has been partially refunded

## Validation Rules

When processing payments, the following validation rules apply:

1. Amount must be positive and match the booking total
2. Payment method must be one of the supported methods
3. Payment details must be valid and appropriate for the payment method
4. Booking must exist and be in a valid state for payment processing

## Error Responses

The API returns standardized error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Invalid payment details", "Amount does not match booking total"],
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
  "message": "You do not have permission to process this payment",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Payment with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Payment already processed for this booking",
  "error": "Conflict"
}
```

### 422 Unprocessable Entity
```json
{
  "statusCode": 422,
  "message": "Payment processing failed: Insufficient funds",
  "error": "Unprocessable Entity"
}
```

## Usage Examples

### Processing a Payment for a Booking

To process a payment for a booking:

```
POST /payments
```
With request body:
```json
{
  "bookingId": 123,
  "amount": 299.99,
  "paymentMethod": "creditCard",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123",
    "cardholderName": "John Doe"
  }
}
```

### Checking User's Payment History

To view a user's payment history:

```
GET /payments/my-payments
```

### Viewing Recent Payments (Admin Only)

To view all payments made in the last 30 days:

```
GET /payments?startDate=2023-03-01T00:00:00Z&endDate=2023-04-01T00:00:00Z
```

### Processing a Refund

For an admin to process a refund:

```
POST /payments/1/refund
```
With request body:
```json
{
  "amount": 299.99,
  "reason": "Customer requested cancellation"
}
```

## Security Considerations

- All payment data is encrypted in transit using TLS
- Sensitive payment details (full card numbers, CVV) are never stored
- The API implements rate limiting to prevent abuse
- User authentication and authorization are enforced for all endpoints
- Payment verification steps are in place to prevent fraud 
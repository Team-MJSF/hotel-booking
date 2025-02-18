# User Management API

This document details the endpoints for managing users in the Hotel Booking system.

## Endpoints

### Get All Users

Retrieve a list of all users.

```http
GET /api/v1/users
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/v1/users'
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "idUser": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "1234567890",
      "role": "Guest"
    },
    {
      "idUser": 2,
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "phoneNumber": "0987654321",
      "role": "Customer"
    }
  ],
  "message": "Users retrieved successfully"
}
```

### Get User by ID

Retrieve a specific user by their ID.

```http
GET /api/v1/users/:id
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/v1/users/1'
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "idUser": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "role": "Guest"
  },
  "message": "User retrieved successfully"
}
```

### Create User

Create a new user account.

```http
POST /api/v1/users
Content-Type: application/json
```

**cURL Example**
```bash
curl -X POST \
  'http://localhost:5000/api/v1/users' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "1234567890",
    "role": "Guest"
  }'
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | Yes | User's full name |
| email | string | Yes | Valid email address |
| password | string | Yes | Minimum 8 characters |
| phoneNumber | string | Yes | Contact number |
| role | string | No | One of: Guest, Customer, Admin |

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "idUser": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "role": "Guest"
  },
  "message": "User created successfully"
}
```

### Update User

Update an existing user's information.

```http
PUT /api/v1/users/:id
Content-Type: application/json
```

**cURL Example**
```bash
curl -X PUT \
  'http://localhost:5000/api/v1/users/1' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "John Doe Updated",
    "email": "john.updated@example.com",
    "password": "newpassword123",
    "phoneNumber": "0987654321",
    "role": "Customer"
  }'
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "idUser": 1,
    "fullName": "John Doe Updated",
    "email": "john.updated@example.com",
    "phoneNumber": "0987654321",
    "role": "Customer"
  },
  "message": "User updated successfully"
}
```

### Delete User

Remove a user from the system.

```http
DELETE /api/v1/users/:id
```

**cURL Example**
```bash
curl -X DELETE \
  'http://localhost:5000/api/v1/users/1'
```

**Response** (200 OK)
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "errors": [
    {
      "field": "fullName",
      "message": "Full name is required"
    },
    {
      "field": "email",
      "message": "Must be a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    },
    {
      "field": "phoneNumber",
      "message": "Phone number is required"
    },
    {
      "field": "role",
      "message": "Invalid role"
    }
  ]
}
```

### Duplicate Email Error (400 Bad Request)
```json
{
  "message": "Email already exists"
}
```

### Not Found Error (404)
```json
{
  "message": "User not found"
}
```

### Server Error (500)
```json
{
  "message": "Error creating user",
  "error": "Error details message"
}
```

Note: Similar server error responses exist for fetching, updating, and deleting users, with appropriate error messages for each operation.
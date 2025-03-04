# User Management API

This document details the endpoints for managing users in the Hotel Booking system.

## Endpoints

### Get All Users

Retrieve a list of all users.

```http
GET /api/users
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/users'
```

**Response** (200 OK)
```json
[
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
]
```

### Get User by ID

Retrieve a specific user by their ID.

```http
GET /api/users/:id
```

**cURL Example**
```bash
curl -X GET \
  'http://localhost:5000/api/users/1'
```

**Response** (200 OK)
```json
{
  "idUser": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "role": "Guest"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "User not found"
}
```

### Create User

Create a new user account.

```http
POST /api/users
Content-Type: application/json
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | Yes | User's full name |
| email | string | Yes | Valid email address |
| password | string | Yes | Minimum 8 characters |
| phoneNumber | string | Yes | Contact number |
| role | string | No | One of: Guest, Customer, Admin (defaults to Guest) |

**cURL Example**
```bash
curl -X POST \
  'http://localhost:5000/api/users' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "1234567890",
    "role": "Guest"
  }'
```

**Response** (201 Created)
```json
{
  "idUser": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "role": "Guest"
}
```

### Update User

Update an existing user's information.

```http
PUT /api/users/:id
Content-Type: application/json
```

**Request Body Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | Yes | User's full name |
| email | string | Yes | Valid email address |
| password | string | Yes | Minimum 8 characters |
| phoneNumber | string | Yes | Contact number |
| role | string | No | One of: Guest, Customer, Admin |

**cURL Example**
```bash
curl -X PUT \
  'http://localhost:5000/api/users/1' \
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
  "idUser": 1,
  "fullName": "John Doe Updated",
  "email": "john.updated@example.com",
  "phoneNumber": "0987654321",
  "role": "Customer"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "User not found"
}
```

### Delete User

Remove a user from the system.

```http
DELETE /api/users/:id
```

**cURL Example**
```bash
curl -X DELETE \
  'http://localhost:5000/api/users/1'
```

**Response** (200 OK)
```json
{
  "message": "User deleted successfully"
}
```

**Error Response** (404 Not Found)
```json
{
  "message": "User not found"
}
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "errors": [
    {
      "msg": "Full name is required",
      "param": "fullName",
      "location": "body"
    },
    {
      "msg": "Must be a valid email address",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be at least 8 characters long",
      "param": "password",
      "location": "body"
    },
    {
      "msg": "Phone number is required",
      "param": "phoneNumber",
      "location": "body"
    },
    {
      "msg": "Invalid role",
      "param": "role",
      "location": "body"
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

### Server Error (500 Internal Server Error)
```json
{
  "message": "Error [operation] user",
  "error": "[error details]"
}
```
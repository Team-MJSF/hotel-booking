# User API Documentation

## Introduction

The User API provides endpoints to manage user accounts, authenticate users, and manage user profiles. The API supports features like user registration, authentication, profile management, and role-based access control.

## Authentication

Most endpoints related to user management require authentication. Administrative operations require an admin role.

For protected endpoints, include a valid JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## API Endpoints

### User Registration

Registers a new user in the system.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "role": "user",
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-01T10:00:00Z"
}
```

### User Login

Authenticates a user and provides a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Get All Users (Admin Only)

Retrieves a list of all users in the system.

**Endpoint:** `GET /users`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "role": "user",
    "createdAt": "2023-04-01T10:00:00Z",
    "updatedAt": "2023-04-01T10:00:00Z"
  },
  {
    "id": 2,
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phoneNumber": "+9876543210",
    "role": "admin",
    "createdAt": "2023-04-01T11:00:00Z",
    "updatedAt": "2023-04-01T11:00:00Z"
  }
]
```

### Get User by ID

Retrieves a specific user by their ID. Users can only view their own profile, while admins can view any user.

**Endpoint:** `GET /users/{id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "role": "user",
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-01T10:00:00Z"
}
```

### Update User

Updates an existing user's profile. Users can only update their own profile, while admins can update any user.

**Endpoint:** `PATCH /users/{id}`

**Request Body:** (partial update)
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phoneNumber": "+1987654321"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "firstName": "Johnny",
  "lastName": "Doe",
  "phoneNumber": "+1987654321",
  "role": "user",
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-05T12:00:00Z"
}
```

### Delete User

Removes a user from the system. Users can only delete their own account, while admins can delete any user.

**Endpoint:** `DELETE /users/{id}`

**Response:** `200 OK`
```json
{
  "message": "User successfully deleted"
}
```

### Change User Role (Admin Only)

Changes a user's role in the system.

**Endpoint:** `PATCH /users/{id}/role`

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "firstName": "Johnny",
  "lastName": "Doe",
  "role": "admin",
  "updatedAt": "2023-04-06T09:00:00Z"
}
```

### Get Current User Profile

Retrieves the profile of the currently authenticated user.

**Endpoint:** `GET /users/profile`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "firstName": "Johnny",
  "lastName": "Doe",
  "phoneNumber": "+1987654321",
  "role": "user",
  "createdAt": "2023-04-01T10:00:00Z",
  "updatedAt": "2023-04-05T12:00:00Z"
}
```

## User Roles

The system supports the following user roles:

- **user**: Regular user with basic privileges
- **admin**: Administrator with full system access

## Password Reset

### Request Password Reset

Initiates a password reset process for a user.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

### Reset Password

Resets a user's password using a valid reset token.

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_received_via_email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password successfully reset"
}
```

## Validation Rules

When creating or updating users, the following validation rules apply:

1. Email must be valid and unique
2. Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character
3. First name and last name are required
4. Phone number must be in a valid format

## Error Responses

The API returns standardized error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Email must be a valid email address", "Password is too weak"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already in use",
  "error": "Conflict"
}
```

## Usage Examples

### Registering a New User

To register a new user in the system:

```
POST /auth/register
```
With request body:
```json
{
  "email": "new.user@example.com",
  "password": "SecurePassword123!",
  "firstName": "New",
  "lastName": "User",
  "phoneNumber": "+1234567890"
}
```

### Authenticating a User

To authenticate a user and obtain a JWT token:

```
POST /auth/login
```
With request body:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

### Updating User Profile

To update a user's profile information:

```
PATCH /users/1
```
With request body:
```json
{
  "firstName": "Jonathan",
  "phoneNumber": "+1987654321"
}
```

### Searching for Admin Users (Admin Only)

To find all users with admin roles:

```
GET /users?role=admin
``` 
# User API Documentation

This documentation provides details about the user-related endpoints in the Hotel Booking System API.

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
   - [Register](#register)
   - [Create Admin](#create-admin)
   - [Login](#login)
   - [Get Profile](#get-profile)
   - [Refresh Token](#refresh-token)
   - [Logout](#logout)
   
2. [User Management Endpoints](#user-management-endpoints)
   - [List Users](#list-users)
   - [Get User by ID](#get-user-by-id)
   - [Create User](#create-user)
   - [Update User](#update-user)
   - [Delete User](#delete-user)

## Authentication Endpoints

These endpoints handle user registration, authentication, and profile management.

### Register

Creates a new user account with the provided details. All user accounts created through this endpoint are assigned the USER role. Admin accounts can only be created by existing administrators.

**Endpoint:** `POST /auth/register`

**Authentication:** None (public endpoint)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "phoneNumber": "+1234567890",    // Optional
  "address": "123 Main St"         // Optional
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "createdAt": "2023-05-01T12:00:00Z",
  "updatedAt": "2023-05-01T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists

### Create Admin

Creates a new admin user account with the provided details. Only existing administrators can access this endpoint.

**Endpoint:** `POST /auth/create-admin`

**Authentication:** JWT (Bearer token) with Admin role

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!",
  "phoneNumber": "+1234567890",    // Optional
  "address": "123 Main St"         // Optional
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "role": "admin",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "createdAt": "2023-05-01T12:00:00Z",
  "updatedAt": "2023-05-01T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User is not an admin
- `409 Conflict` - Email already exists

### Login

Authenticates a user and returns access and refresh tokens.

**Endpoint:** `POST /auth/login`

**Authentication:** None (public endpoint)

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6g7h8i9j0..."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

### Get Profile

Returns the profile information of the currently authenticated user.

**Endpoint:** `GET /auth/profile`

**Authentication:** JWT (Bearer token)

**Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "createdAt": "2023-05-01T12:00:00Z",
  "updatedAt": "2023-05-01T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - User not found

### Refresh Token

Creates a new access token using a valid refresh token.

**Endpoint:** `POST /auth/refresh`

**Authentication:** None (uses refresh token)

**Request Body:**
```json
{
  "refresh_token": "a1b2c3d4e5f6g7h8i9j0..."
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "k9l8m7n6o5p4q3r2s1t0..."  // Optional, if token rotation is enabled
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

### Logout

Invalidates the provided refresh token, effectively logging out the user from that session.

**Endpoint:** `POST /auth/logout`

**Authentication:** JWT (Bearer token)

**Request Body:**
```json
{
  "refresh_token": "a1b2c3d4e5f6g7h8i9j0..."
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token or user not authenticated
- `404 Not Found` - Refresh token not found

## User Management Endpoints

These endpoints are primarily for administrators to manage user accounts.

### List Users

Retrieves a list of all users. Only accessible by administrators.

**Endpoint:** `GET /users`

**Authentication:** JWT (Bearer token) with Admin role

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "admin",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "isActive": true,
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-02T12:00:00Z"
  },
  {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "role": "user",
    "phoneNumber": "+0987654321",
    "address": "456 Elm St",
    "isActive": true,
    "createdAt": "2023-01-03T12:00:00Z",
    "updatedAt": "2023-01-04T12:00:00Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User is not an admin

### Get User by ID

Retrieves detailed information for a specific user. Users can only access their own profile, while admins can access any profile.

**Endpoint:** `GET /users/:id`

**Authentication:** JWT (Bearer token)

**Path Parameters:**
- `id` - User ID

**Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "isActive": true,
  "bookings": [
    {
      "bookingId": 1,
      "checkInDate": "2023-05-15T14:00:00Z",
      "checkOutDate": "2023-05-20T11:00:00Z",
      "numberOfGuests": 2,
      "status": "confirmed",
      "createdAt": "2023-04-05T12:00:00Z",
      "updatedAt": "2023-04-05T12:00:00Z"
    }
  ],
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-02T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Can only access own profile unless admin
- `404 Not Found` - User not found

### Create User

Creates a new user with the specified details. Only accessible by administrators.

**Endpoint:** `POST /users`

**Authentication:** JWT (Bearer token) with Admin role

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "user",
  "phoneNumber": "+1234567890",
  "address": "123 Main St"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "isActive": true,
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User is not an admin
- `409 Conflict` - Email already exists

### Update User

Updates an existing user with the provided details. Users can only update their own profile, while admins can update any profile.

**Endpoint:** `PATCH /users/:id`

**Authentication:** JWT (Bearer token)

**Path Parameters:**
- `id` - User ID

**Request Body (all fields optional):**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "new.email@example.com",
  "password": "NewPassword123!",
  "role": "admin",
  "phoneNumber": "+9876543210",
  "address": "New Address, City"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "Updated",
  "lastName": "Name",
  "email": "new.email@example.com",
  "role": "admin",
  "phoneNumber": "+9876543210",
  "address": "New Address, City",
  "isActive": true,
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-05T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Can only update own profile unless admin
- `404 Not Found` - User not found
- `409 Conflict` - Email already exists

### Delete User

Soft-deletes a user. The record remains in the database but is marked as inactive. Only accessible by administrators.

**Endpoint:** `DELETE /users/:id`

**Authentication:** JWT (Bearer token) with Admin role

**Path Parameters:**
- `id` - User ID

**Response (200 OK):**
```json
{
  "message": "User successfully deleted"
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User is not an admin or trying to delete own account
- `404 Not Found` - User not found

## Authentication Flow

1. Register a user using `/auth/register`
2. Login using `/auth/login` to receive access and refresh tokens
3. Use the access token for authenticated requests by including it in the Authorization header:
   ```
   Authorization: Bearer your_access_token_here
   ```
4. When the access token expires, use `/auth/refresh` with your refresh token to get a new access token
5. Use `/auth/logout` to invalidate a refresh token when done

## Role-Based Access

The API implements role-based access control with two roles:

1. **User** - Regular user who can:
   - View and update their own profile
   - Create and manage their own bookings

2. **Admin** - Administrator who can:
   - View and update any user profile
   - Create new users
   - Delete users
   - View all users
   - Manage all bookings and rooms

## Data Validation

All endpoints perform validation on input data:

- Email addresses must be valid
- Passwords must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
- Phone numbers must be in a valid format
- User roles must be either 'user' or 'admin' 
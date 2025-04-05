# Swagger API Documentation Guide

## Introduction

This project uses Swagger (OpenAPI) for API documentation. Swagger provides a user-friendly interface for exploring and testing the API endpoints.

## Accessing Swagger Documentation

When the application is running in development mode, the Swagger documentation is available at:

```
http://localhost:5000/api
```

## Authentication in Swagger

The API uses JWT (JSON Web Token) for authentication. To authenticate in Swagger:

1. First, get an access token by using the `/auth/login` endpoint
2. Click the "Authorize" button at the top of the Swagger UI 
3. Enter your token in the format: `Bearer your_access_token_here`
4. Click "Authorize" to apply the token to all subsequent requests

## Available API Endpoints

The API is organized into the following sections:

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user account |
| POST | `/auth/login` | Login and receive access/refresh tokens |
| POST | `/auth/refresh` | Refresh an expired access token |
| POST | `/auth/logout` | Invalidate a refresh token |
| GET | `/auth/profile` | Get current user profile |

#### Registration Process

The registration endpoint accepts both required and optional fields:

**Required Fields:**
- firstName
- lastName
- email
- password
- confirmPassword (must match password)

**Optional Fields:**
- role (default: 'user')
- phoneNumber
- address

Example request:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

#### Authentication Flow

1. Register a user using `/auth/register`
2. Login using `/auth/login` to receive access and refresh tokens
3. Use the access token for authenticated requests
4. When the access token expires, use `/auth/refresh` with your refresh token to get a new access token
5. Use `/auth/logout` to invalidate a refresh token when done

#### Response Examples

**Login Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6g7h8i9j0..."
}
```

**Profile Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City, Country",
  "createdAt": "2023-04-01T12:00:00Z",
  "updatedAt": "2023-04-01T12:00:00Z"
}
```

## Error Responses

The API returns standardized error responses:

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required or invalid credentials |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server-side error |

Example error response:
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

## Swagger Configuration

The Swagger configuration is in `main.ts` and includes:

- Descriptive API information
- Authentication mechanisms
- Organized endpoint tags
- Request/response examples
- Detailed error responses

## Best Practices for API Testing

1. Start by registering a user or logging in
2. Use the returned tokens for authenticated endpoints
3. Test each endpoint with valid and invalid data
4. Pay attention to returned HTTP status codes
5. Check error messages for validation failures

## Security Considerations

- Access tokens expire after a short period (default: 1 hour)
- Refresh tokens have a longer lifespan (default: 7 days)
- All passwords are securely hashed before storage
- Rate limiting is applied to sensitive endpoints
- Use HTTPS in production environments 
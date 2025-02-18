# Hotel Booking API Resources

Welcome to the Hotel Booking API documentation. This API provides endpoints for managing hotel bookings, users, and related resources.

## Available Resources

### User Management
- [User API Documentation](./resources/users.md)
  - Create, read, update, and delete users
  - Manage user roles and permissions
  - User authentication

## Base URL

```
http://localhost:5000/api
```

## Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

## Error Handling

Errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Versioning

The current API version is v1. Include the version in the URL:

```
http://localhost:5000/api/v1/resource
```
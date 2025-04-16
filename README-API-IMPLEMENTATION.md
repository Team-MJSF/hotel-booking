# API Implementation Documentation

## Overview

This document outlines the changes made to migrate the hotel booking application from using localStorage-based mock data to a proper backend API implementation, following best practices.

## Changes Made

### Frontend API Service

1. Removed all localStorage fallbacks in `api.ts`, ensuring all data is fetched from the backend API
2. Standardized error handling for API requests
3. Implemented environment variable configuration for API connection
4. Created a reusable storage mechanism that can be configured via environment variables

### Authentication Improvements

1. Moved token storage from hardcoded localStorage/sessionStorage to a configurable environment-based approach
2. Enhanced security by removing unnecessary user data stored in localStorage
3. Improved error handling for authentication failures

### Bookings Management

1. Removed mock booking data generation and storage in localStorage
2. Updated booking management to interact solely with the backend API
3. Improved error handling for booking operations
4. Updated UI to reflect proper API-based data flow

### Backend API Enhancements

1. Added a dedicated `/bookings/user` endpoint to retrieve bookings for the authenticated user
2. Implemented a booking cancellation endpoint at `/bookings/:id/cancel`
3. Enhanced error handling and validation

### Configuration Management

1. Added proper environment configuration files:
   - `.env.local` for local development settings
   - `.env.example` for documentation
2. Configured API timeouts and base URLs via environment variables

## Environment Variables

The application uses the following environment variables:

### Frontend (in `.env.local`)

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_ENV=development

# Auth settings
NEXT_PUBLIC_AUTH_STORAGE=sessionStorage
```

### Backend (in `.env.development`)

```
# Server Configuration
NODE_ENV=development

# Backend API settings
PORT=5000
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Security settings
JWT_SECRET=your-secret-key-here-change-for-production
JWT_EXPIRATION=1h
```

## Security Improvements

1. **Token Management**: Now using secure token storage with sessionStorage by default
2. **API Authentication**: All API requests now properly include authentication headers
3. **Error Handling**: Improved error handling to prevent leakage of sensitive information
4. **User Validation**: Enhanced user permission checks for booking operations

## Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run start:dev
   ```

2. Start the frontend application:
   ```
   cd frontend
   npm run dev
   ```

3. Access the application at http://localhost:3000

## Testing

For testing, you can use the provided NestJS test endpoints:

```
# Register a test user
POST /auth/register

# Log in with the test user
POST /auth/login

# Create a booking
POST /bookings
``` 
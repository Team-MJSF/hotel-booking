# Hotel Booking System Backend

A robust NestJS backend API powering the hotel booking application with comprehensive room management, booking, and payment functionality.

## 🏨 Overview

This backend provides a complete REST API for hotel booking operations, featuring:

- **User Management**: Registration, authentication, and user profiles
- **Room Management**: Room types, individual rooms, and availability
- **Booking System**: Create, manage, and cancel bookings
- **Payment Processing**: Mock payment system with multiple fallback strategies
- **API Documentation**: Comprehensive Swagger documentation

## 🔧 Technology Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) with [TypeORM](https://typeorm.io/)
- **Authentication**: JWT with refresh tokens
- **Validation**: Class Validator & Transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with separate unit and integration tests

## 📋 Prerequisites

- Node.js v18+ 
- npm

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hotel-booking/backend

# Install dependencies
npm install
```

### Environment Setup

```bash
# Create development and test environment files
cp .env.example .env.development
cp .env.example .env.test

# Edit the environment variables as needed
```

### Database Initialization

```bash
# Initialize development database with seed data
npm run init:dev

# Initialize test database
npm run init:test
```

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm run start:prod
```

## 📁 Project Structure

```
src/
├── auth/              # Authentication and authorization
│   ├── dto/           # Data Transfer Objects
│   ├── guards/        # JWT Auth Guards
│   └── strategies/    # Passport strategies
├── bookings/          # Booking management
│   ├── dto/           # Booking DTOs
│   ├── entities/      # Booking entity
│   └── services/      # Booking business logic
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── dto/           # Shared DTOs
│   ├── entities/      # Base entities
│   ├── exceptions/    # Custom exceptions
│   ├── filters/       # Exception filters
│   └── interfaces/    # Shared interfaces
├── config/            # Application configuration
├── database/          # Database configuration
│   ├── migrations/    # TypeORM migrations
│   └── seeds/         # Database seed data
├── payments/          # Payment processing (mock)
│   ├── dto/           # Payment DTOs
│   ├── entities/      # Payment entity
│   └── services/      # Payment business logic
├── refresh-tokens/    # Refresh token management
├── rooms/             # Room and room type management
│   ├── dto/           # Room DTOs
│   ├── entities/      # Room entities
│   └── services/      # Room services
├── users/             # User management
│   ├── dto/           # User DTOs
│   ├── entities/      # User entity
│   └── services/      # User services
├── app.module.ts      # Main application module
└── main.ts            # Application entry point
```

## 🔄 Core Features

### Authentication

The system uses JWT-based authentication with refresh tokens:

- **Access Token**: Short-lived token (1 hour) for API access
- **Refresh Token**: Long-lived token (7 days) stored in database
- **Token Revocation**: Ability to invalidate refresh tokens

```typescript
// Example login request
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Room Management

The system manages both room types and individual rooms:

- **Room Types**: Categories of rooms with common attributes
- **Rooms**: Individual room instances with room numbers
- **Availability**: Advanced availability checking with date constraints

```typescript
// Example room type
{
  "id": 1,
  "name": "Deluxe King Room",
  "description": "Spacious room with king-sized bed",
  "basePrice": 150.00,
  "capacity": 2,
  "amenities": ["WiFi", "TV", "Mini-bar"]
}

// Example room
{
  "id": 101,
  "roomNumber": "101",
  "floor": 1,
  "roomTypeId": 1,
  "status": "available"
}
```

### Booking System

The booking system handles the entire booking lifecycle:

- **Create Booking**: Reserve a room for specific dates
- **Modify Booking**: Change dates or guest information
- **Cancel Booking**: Allow users to cancel with business rules
- **Availability Check**: Prevent double bookings

```typescript
// Example booking creation
POST /bookings
{
  "roomId": 101,
  "checkInDate": "2023-07-15T14:00:00.000Z",
  "checkOutDate": "2023-07-20T11:00:00.000Z",
  "numberOfGuests": 2,
  "specialRequests": "Room away from elevator"
}
```

### Payment Processing

The payment system provides a realistic mock implementation:

- **Process Payment**: Handle payment for bookings
- **Multiple Methods**: Support for credit cards, PayPal, etc.
- **Refunds**: Process refunds for cancelled bookings
- **Fallback Strategies**: Ensure payment success with multiple approaches

## 🧪 Testing Strategy

The project implements a comprehensive testing strategy:

### Unit Tests

Isolated tests for individual components:

```bash
# Run unit tests
npm run test:unit
```

### Integration Tests

End-to-end tests that verify complete workflows:

   ```bash
# Run integration tests
npm run test:integration
```

### Coverage

   ```bash
# Generate test coverage report
npm run test:cov
   ```

## 📚 API Documentation

The API is documented using Swagger/OpenAPI:

   ```bash
# Start the server
npm run start:dev

# Access Swagger UI
http://localhost:5000/api/docs
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start server with hot reload
- `npm run build` - Build application
- `npm run start:prod` - Start production server
- `npm run lint` - Run linter

### Testing
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:cov` - Generate coverage report

### Database
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:revert` - Revert last migration

## 🔐 Environment Variables

Key environment variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_NAME=data/hotel_booking_dev.sqlite

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=20
```

## 🔍 Advanced Features

### Rate Limiting

The API implements rate limiting to prevent abuse:

```typescript
// Configure in .env
THROTTLE_TTL=60  // Time window in seconds
THROTTLE_LIMIT=20  // Maximum number of requests in time window
```

### Error Handling

Standardized error responses across the API:

```json
{
  "statusCode": 400,
  "message": "Invalid booking dates",
  "error": "Bad Request",
  "timestamp": "2023-06-15T10:30:45.123Z",
  "path": "/bookings"
}
```

### Data Validation

Comprehensive input validation using class-validator:

```typescript
export class CreateBookingDto {
  @IsNumber()
  @ApiProperty({ description: 'Room ID for the booking' })
  roomId: number;

  @IsDateString()
  @ApiProperty({ description: 'Check-in date' })
  checkInDate: string;

  @IsDateString()
  @ApiProperty({ description: 'Check-out date' })
  checkOutDate: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({ description: 'Number of guests' })
  numberOfGuests: number;
}
```

## 🚀 Deployment

For production deployment:

1. Set up environment variables for production
2. Build the application: `npm run build`
3. Start with process manager: `pm2 start dist/main.js`

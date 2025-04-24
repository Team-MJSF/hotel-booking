# Hotel Booking System - Backend

## 🏨 Overview

A robust and scalable backend API for a modern hotel booking system. Built with NestJS, TypeORM, and TypeScript, this system provides a complete solution for managing hotel rooms, bookings, and payments.

## 🛠️ Technology Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Database**: SQLite (with easy migration path to PostgreSQL or MySQL)
- **Authentication**: JWT with refresh tokens
- **API Documentation**: OpenAPI/Swagger
- **Testing**: Jest
- **Validation**: class-validator
- **Error Handling**: Custom exception filters

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn

## 🔧 Project Structure

```
src/
├── auth/                  # Authentication module
├── bookings/              # Booking management
├── common/                # Shared resources
├── config/                # App configuration
├── database/              # Database setup and seeds
├── payments/              # Payment processing
├── refresh-tokens/        # Token management
├── rooms/                 # Room management
├── users/                 # User management
├── app.controller.ts      # Main app controller
├── app.module.ts          # Main app module
└── main.ts                # Application entry point
```

## 🚀 Core Features

### 👤 User Management

- User registration and authentication
- Role-based access control (Admin, User)
- JWT-based authorization with refresh tokens
- Profile management

### 🛏️ Room Management

- Room categories and types
- Room availability checking
- Room search with filters
- Room details and amenities

### 📅 Booking System

- Room reservation
- Booking lifecycle management
- Booking confirmation and cancellation
- Date range availability checking

### 💳 Payment Processing

- Multiple payment methods
- Payment status tracking
- Secure payment processing
- Receipt generation

## 🔒 Authentication Flow

1. **Registration**: Create a new user account
2. **Login**: Authenticate and receive JWT tokens
3. **Token Refresh**: Use refresh token to obtain a new JWT
4. **Protected Routes**: Access restricted endpoints with valid JWT

## 🧪 Testing Strategy

### Unit Tests

```bash
# Run unit tests
npm run test:unit
```

Unit tests focus on:
- Service methods
- Controller endpoints
- Validation logic
- Authentication guards

### Integration Tests

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
- `npm run db:seed:consolidated` - Seed database with consolidated data
- `npm run db:seed:quick` - Seed database with minimal data
- `npm run db:revert` - Revert last migration
- `npm run setup:dev` - Set up development environment
- `npm run dev:reset` - Reset development database

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
THROTTLE_LIMIT=100
```

## 🔍 Advanced Features

### Rate Limiting

The API implements rate limiting to prevent abuse:

```typescript
// Configured in app.module.ts
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
]),
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
  @IsNotEmpty()
  @IsDateString()
  checkInDate: string;

  @IsNotEmpty()
  @IsDateString()
  checkOutDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  numberOfGuests: number;
}
```

## 📦 Deployment

The application can be deployed to various environments:

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

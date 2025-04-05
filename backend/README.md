# Hotel Booking System - Backend

A NestJS-based backend for a hotel booking system with authentication, room management, and booking functionality. This project is part of a school assignment and uses mocked payment systems.

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm

## Features

- User authentication with JWT and refresh tokens
- Role-based access control (Admin, User)
- Room management with search and filtering
- Booking system with validation
- Mock payment processing
- Comprehensive test coverage with separated unit and integration tests
- API documentation with Swagger

## Technologies Used

### Core
- NestJS - Web framework
- TypeScript - Programming language
- TypeORM - Database ORM
- MySQL - Database
- JWT - Authentication
- Passport - Authentication middleware
- Bcrypt - Password hashing

### Development Tools
- Jest - Testing framework
- Swagger - API documentation
- ESLint - Code linting
- Prettier - Code formatting
- Class Validator & Transformer - Input validation and transformation

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/create-admin` - Create admin user (Admin only)
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (invalidate refresh token)

### Users
- `GET /users` - List all users (Admin only)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

### Rooms
- `GET /rooms` - List all rooms
- `GET /rooms/:id` - Get room details
- `GET /rooms/search` - Search available rooms
- `POST /rooms` - Create new room (Admin only)
- `PATCH /rooms/:id` - Update room (Admin only)
- `DELETE /rooms/:id` - Delete room (Admin only)

### Bookings
- `GET /bookings` - List user's bookings
- `GET /bookings/:id` - Get booking details
- `POST /bookings` - Create new booking
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Payments
- `GET /payments` - List all payments (Admin only)
- `GET /payments/:id` - Get payment details
- `GET /payments/booking/:bookingId` - Get payments for a booking
- `POST /payments` - Create new payment
- `PATCH /payments/:id` - Update payment status
- `DELETE /payments/:id` - Delete payment (Admin only)
- `POST /payments/:id/refund` - Process refund

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.development` for development
   - Copy `.env.example` to `.env.test` for testing
   - Update the variables with your configuration

4. Initialize the development database:
   ```bash
   npm run init:dev
   ```

5. Initialize the test database:
   ```bash
   npm run init:test
   ```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application (both app and migrations)
- `npm run build:app` - Build only the application
- `npm run build:migrations` - Build only the migrations
- `npm run start:dev` - Start development server
- `npm run start:debug` - Start server in debug mode
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run all tests (unit and integration)
- `npm run test:unit` - Run only unit tests (in parallel)
- `npm run test:integration` - Run only integration tests (sequentially)
- `npm run test:cov` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run test:debug` - Debug tests with Node inspector
- `npm run test:bootstrap` - Test the application bootstrap process

### Database Management
- `npm run db:create` - Create the database if it doesn't exist
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:test` - Run migrations for the test database
- `npm run db:revert` - Revert last migration
- `npm run db:revert:test` - Revert last test database migration
- `npm run db:seed` - Seed the database with initial data
- `npm run db:migrate:show` - Show pending migrations
- `npm run db:migrate:show:test` - Show pending test migrations

### Setup and Reset
- `npm run setup` - Initialize both dev and test environments
- `npm run setup:reset` - Reset both dev and test databases
- `npm run dev:setup` - Set up development environment
- `npm run dev:reset` - Reset development database
- `npm run test:setup` - Set up test environment
- `npm run test:reset` - Reset test database

## Environment Variables

Create `.env.development` and `.env.test` files:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=hotel_booking_dev
```

## Project Structure

```
src/
├── auth/           # Authentication related files
├── bookings/       # Booking management
├── common/         # Shared utilities and filters
├── config/         # Configuration files
├── database/       # Migration and seed files
├── payments/       # Payment processing (mocked)
├── refresh-tokens/ # Refresh token management
├── rooms/          # Room management
├── users/          # User management
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

## Testing

The project uses Jest for testing with two separate configurations:

### Unit Tests
- Located in `*.spec.ts` files outside of integration folders
- Run in parallel for faster execution
- Test individual components in isolation
- Mock dependencies to isolate components
- Command: `npm run test:unit`

### Integration Tests
- Located in `src/**/integration/*.spec.ts` files
- Run sequentially to avoid database conflicts
- Test complete flows through the system
- Use a real test database with proper cleanup between tests
- Command: `npm run test:integration`

### Test Configuration
- Unit and integration tests use different configurations in `jest.config.ts`
- Integration tests run with the `--runInBand` flag to prevent parallel execution
- Authentication is handled differently in tests with mockJwtAuthGuard when needed
- Each controller has comprehensive tests for all CRUD operations with various scenarios:
  - Success cases
  - Validation errors
  - Permission errors (ForbiddenException)
  - Not found cases (ResourceNotFoundException)
  - Database errors (DatabaseException)

### Coverage
Run `npm run test:cov` to generate a coverage report. Current coverage:
- All controllers have 100% test coverage
- Crucial services have 90%+ coverage
- DTOs and entities have validation/transformation tests
- Guards and decorators are properly tested

## API Documentation

### Swagger UI

The API documentation is available at the `/api/docs` endpoint when the server is running. This interactive documentation allows you to:

- View all available endpoints
- See request/response schemas
- Test API endpoints directly from the browser

### API Documentation Guides

Detailed API documentation guides are available for the following modules:

- [Room API Guide](src/common/docs/room-api-guide.md) - Comprehensive guide for room management endpoints
- [Booking API Guide](src/common/docs/booking-api-guide.md) - Detailed documentation for booking-related endpoints
- [User API Guide](src/common/docs/user-api-guide.md) - Guide for user management and authentication endpoints
- [Payment API Guide](src/common/docs/payment-api-guide.md) - Documentation for payment processing endpoints

These guides provide in-depth information about each API endpoint, including request/response formats, validation rules, error responses, and usage examples.

## Database Configuration

The project uses TypeORM with MySQL. Different configurations are available:

- **Development**: Used for local development
- **Test**: Used for running tests (automatically resets between test runs)
- **Production**: Used for production deployment

Migrations are handled automatically and can be run with the appropriate scripts.

## Note for School Project

This project is designed for educational purposes. The payment system is mocked, and certain optimizations are made to facilitate learning rather than production readiness.
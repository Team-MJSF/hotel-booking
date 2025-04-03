# Hotel Booking System - Backend

A NestJS-based backend for a hotel booking system with authentication, room management, and booking functionality.

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Features

- User authentication and authorization
- Room management (CRUD operations)
- Room availability tracking
- Booking management
- Room search with filters (date, type, price, amenities)
- Role-based access control (Admin, User)

## Technologies Used

### Core
- NestJS - Web framework
- TypeScript - Programming language
- TypeORM - Database ORM
- MySQL - Database
- JWT - Authentication
- Passport - Authentication middleware

### Development Tools
- Jest - Testing framework
- Swagger - API documentation
- ESLint - Code linting
- Prettier - Code formatting
- Class Validator - Input validation

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

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
   npm run dev:setup
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Database Management

- `npm run db:migrate` - Run database migrations
- `npm run db:revert` - Revert last migration
- `npm run db:seed` - Seed the database
- `npm run db:fresh` - Reset database and run migrations

## Environment Variables

Create `.env.development` or `.env.test` based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=hotel_booking_dev

# Logging Configuration
LOG_LEVEL=debug

# Feature Flags
ENABLE_SWAGGER=true
ENABLE_LOGGING=true
```

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:5000/api
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── services/       # Business logic
├── entities/       # Database models
├── dto/           # Data transfer objects
├── middleware/     # Custom middleware
└── common/         # Shared utilities
```

## Testing

The project uses Jest for testing. Tests are organized into:
- Unit tests
- Integration tests
- E2E tests

Run `npm run test:setup` before running tests to set up the test database.

## Contributing

1. Create a new branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request
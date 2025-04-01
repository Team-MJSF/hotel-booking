# Hotel Booking Backend

A NestJS-based backend service for a hotel booking system. Built with TypeScript, TypeORM, and MySQL.

## Technology Stack

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications
- **TypeScript**: For type-safe code and better developer experience
- **TypeORM**: For database management and ORM functionality
- **MySQL**: As the primary database
- **JWT**: For authentication and authorization
- **bcrypt**: For password hashing
- **class-validator**: For DTO validation
- **Swagger/OpenAPI**: For API documentation

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Protected routes with guards
  - Password hashing with bcrypt

- **User Management**
  - User registration and login
  - Profile management
  - Role-based permissions
  - Admin user management

- **Room Management**
  - Room CRUD operations
  - Room type management
  - Room availability tracking
  - Room pricing

- **Booking System**
  - Create and manage bookings
  - Check room availability
  - Booking status tracking

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-booking/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hotel_booking_dev

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d

# Server
PORT=5000
```

4. Run database migrations:
```bash
npm run db:migrate
```

## Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## API Documentation

The API documentation is available at `/api` when running the application. You can test the endpoints directly through the Swagger UI.

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (Protected)

#### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin or self only)
- `PATCH /users/:id` - Update user (Admin or self only)
- `DELETE /users/:id` - Delete user (Admin only)

#### Rooms
- `GET /rooms` - Get all rooms
- `GET /rooms/:id` - Get room by ID
- `POST /rooms` - Create new room (Admin only)
- `PATCH /rooms/:id` - Update room (Admin only)
- `DELETE /rooms/:id` - Delete room (Admin only)

#### Bookings
- `GET /bookings` - Get all bookings (Admin) or user's bookings
- `GET /bookings/:id` - Get booking by ID
- `POST /bookings` - Create new booking
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── decorators/      # Custom decorators
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Authentication guards
│   └── strategies/      # Passport strategies
├── users/               # User management module
│   ├── dto/            # User DTOs
│   └── entities/       # User entity
├── rooms/              # Room management module
│   ├── dto/           # Room DTOs
│   └── entities/      # Room entity
├── bookings/          # Booking management module
│   ├── dto/          # Booking DTOs
│   └── entities/     # Booking entity
├── common/           # Shared resources
│   ├── exceptions/   # Custom exceptions
│   └── filters/      # Exception filters
└── main.ts          # Application entry point
```

## Testing

Run unit tests:
```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
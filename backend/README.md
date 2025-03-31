# Hotel Booking Backend

A robust backend service for a hotel booking system built with NestJS, TypeORM, and PostgreSQL.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Secure password hashing with bcrypt
  - Protected routes with guards

- **User Management**
  - User registration and login
  - Profile management
  - Admin-only user management
  - Role-based permissions

- **Hotel Management**
  - Room management
  - Room type management
  - Room availability tracking
  - Room pricing

- **Booking System**
  - Create and manage bookings
  - Check room availability
  - Booking status tracking
  - Booking history

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
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
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=hotel_booking

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d

# Server
PORT=3000
```

4. Run database migrations:
```bash
npm run migration:run
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

The API documentation is available at `/api` when running the application.

### Authentication Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### User Management Endpoints

- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin or self only)
- `POST /users` - Create new user (Admin only)
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

### Room Management Endpoints

- `GET /rooms` - Get all rooms
- `GET /rooms/:id` - Get room by ID
- `POST /rooms` - Create new room (Admin only)
- `PATCH /rooms/:id` - Update room (Admin only)
- `DELETE /rooms/:id` - Delete room (Admin only)

### Room Type Endpoints

- `GET /room-types` - Get all room types
- `GET /room-types/:id` - Get room type by ID
- `POST /room-types` - Create new room type (Admin only)
- `PATCH /room-types/:id` - Update room type (Admin only)
- `DELETE /room-types/:id` - Delete room type (Admin only)

### Booking Endpoints

- `GET /bookings` - Get all bookings (Admin) or user's bookings
- `GET /bookings/:id` - Get booking by ID
- `POST /bookings` - Create new booking
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking (Admin only)

## Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── decorators/      # Custom decorators
│   ├── dto/            # Data transfer objects
│   ├── guards/         # Authentication guards
│   ├── strategies/     # Passport strategies
│   └── auth.service.ts # Authentication service
├── users/              # User management module
│   ├── dto/           # User DTOs
│   ├── entities/      # User entity
│   └── users.service.ts
├── rooms/             # Room management module
│   ├── dto/          # Room DTOs
│   ├── entities/     # Room entities
│   └── rooms.service.ts
├── bookings/         # Booking management module
│   ├── dto/         # Booking DTOs
│   ├── entities/    # Booking entities
│   └── bookings.service.ts
├── common/          # Common utilities and exceptions
└── main.ts         # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
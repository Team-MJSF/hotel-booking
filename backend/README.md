# Hotel Booking System Backend

A NestJS-based backend for a hotel booking system, designed for a school project with inexperienced developers.

## Features

### Room Management
- Create, read, update, and delete rooms
- Room types: Single, Double, Suite, Deluxe
- Room amenities support
- Room availability tracking
- Room search with advanced filtering and sorting:
  - Date range filtering
  - Room type filtering
  - Maximum guests filtering
  - Price range filtering
  - Amenities filtering
  - Sorting by:
    - Price (lowest/highest)
    - Room type
    - Maximum guests
    - Room number
  - Sort order (ascending/descending)

### Booking Management
- Create, read, update, and delete bookings
- Booking status tracking
- Date conflict prevention
- Guest information management

### User Management
- User registration and authentication
- Role-based access control (Admin, User)
- User profile management

## API Endpoints

### Rooms
- `GET /rooms` - Get all rooms
- `GET /rooms/:id` - Get a specific room
- `POST /rooms` - Create a new room
- `PATCH /rooms/:id` - Update a room
- `DELETE /rooms/:id` - Delete a room
- `GET /rooms/search` - Search available rooms with filters and sorting

### Bookings
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get a specific booking
- `POST /bookings` - Create a new booking
- `PATCH /bookings/:id` - Update a booking
- `DELETE /bookings/:id` - Delete a booking

### Users
- `POST /users/register` - Register a new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile

## Search Parameters

### Room Search
- `checkInDate`: Date - Check-in date for the booking
- `checkOutDate`: Date - Check-out date for the booking
- `roomType`: RoomType - Type of room to search for
- `maxGuests`: number - Maximum number of guests
- `minPrice`: number - Minimum price per night
- `maxPrice`: number - Maximum price per night
- `amenities`: string[] - List of required amenities
- `sortBy`: SortField - Field to sort results by
- `sortOrder`: SortOrder - Sort order (ASC/DESC)

### Sort Fields
- `price` - Sort by price per night
- `type` - Sort by room type
- `maxGuests` - Sort by maximum guests
- `roomNumber` - Sort by room number

### Sort Orders
- `ASC` - Ascending order (default)
- `DESC` - Descending order

## Technologies Used

- NestJS - Web framework
- TypeORM - Database ORM
- MySQL - Database
- JWT - Authentication
- Class Validator - Input validation
- Swagger - API documentation
- Jest - Testing framework

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=hotel_booking_dev
   JWT_SECRET=your_jwt_secret
   ```

4. Set up the database and run migrations:
   ```bash
   npm run dev:setup
   ```
   This will:
   - Create the database if it doesn't exist
   - Run all migrations
   - Seed the database with initial data

5. Start the development server:
   ```bash
   npm run start:dev
   ```

## Available Scripts

### Development
- `npm run dev:setup` - Build the project, create database, run migrations, and seed data
- `npm run dev:reset` - Reset the database (revert migrations, run migrations again, and seed data)
- `npm run dev:clean` - Clean the database (revert all migrations)
- `npm run start:dev` - Start the development server with hot-reload

### Database Management
- `npm run db:create` - Create the database if it doesn't exist
- `npm run db:migrate` - Run pending migrations
- `npm run db:revert` - Revert the last migration
- `npm run db:seed` - Seed the database with initial data
- `npm run db:reset` - Run migrations and seed data
- `npm run db:fresh` - Revert all migrations, run migrations again, and seed data

### Testing
- `npm run test:setup` - Set up the test database
- `npm run test:reset` - Reset the test database
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report

### Staging
- `npm run staging:setup` - Set up the staging database
- `npm run staging:reset` - Reset the staging database
- `npm run start:staging` - Start the staging server

### Production
- `npm run start:prod` - Start the production server

## Database Configuration

The application uses MySQL as the database. The database configuration is managed through environment variables and TypeORM. The system supports different environments (development, test, staging, production) with separate database instances.

### Database Features
- Automatic database creation
- Migration management
- Seeding support
- Environment-specific configurations
- Connection pooling
- Transaction support

## Project Structure

```
src/
├── common/           # Common utilities and exceptions
├── config/          # Configuration files
├── rooms/           # Room-related modules
├── bookings/        # Booking-related modules
├── users/           # User-related modules
└── main.ts          # Application entry point
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

This project is licensed under the MIT License.
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
- PostgreSQL - Database
- JWT - Authentication
- Class Validator - Input validation
- Swagger - API documentation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your database credentials

4. Run migrations:
   ```bash
   npm run migration:run
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

## Testing

Run all tests (unit tests in parallel, integration tests sequentially):
```bash
npm test
```

Run only unit tests (in parallel):
```bash
npm run test:unit
```

Run only integration tests (sequentially):
```bash
npm run test:integration
```

Run tests with coverage:
```bash
npm run test:cov
```

Run tests in watch mode (useful during development):
```bash
npm run test:watch
```

Note: Integration tests run sequentially to prevent database conflicts, while unit tests run in parallel for faster execution.

## API Documentation

Once the server is running, visit:
```
http://localhost:3000/api
```

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
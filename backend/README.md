# Hotel Booking Backend

This is the backend service for the Hotel Booking application, providing a robust RESTful API for managing hotel bookings, users, rooms, and payments.

## Features

- User Management (authentication, roles, and permissions)
- Room Management (availability, types, pricing)
- Booking Management (create, update, cancel bookings)
- Payment Processing (multiple payment methods)
- Input Validation and Error Handling
- Database Migrations
- Comprehensive Test Coverage
- Factory Pattern & Dependency Injection for testable controllers

## Tech Stack

- Node.js
- Express.js - Web framework
- Sequelize - ORM for MySQL
- MySQL - Database
- Jest - Testing framework
- Express Validator - Input validation
- bcryptjs - Password hashing

## Architecture

### Controller Design Pattern

This project uses the factory pattern with dependency injection for controllers, providing several benefits:

- **Testability**: Dependencies can be easily mocked for unit testing
- **Maintainability**: Clear separation of concerns and explicit dependencies
- **Flexibility**: Controllers can be instantiated with different configurations

Example of a controller using the factory pattern:

```javascript
// Controller factory function
export const createUsersController = (deps = {}) => {
  // Use provided dependencies or defaults
  const {
    Users = DefaultUsers,
    validator = validationResult
  } = deps;
  
  // Controller methods
  const getAllUsers = async (request, response) => {
    // Implementation using injected dependencies
  };
  
  // Return controller methods
  return {
    getAllUsers,
    // other methods...
  };
};

// For backward compatibility
const defaultController = createUsersController();
export const { getAllUsers, /*...*/ } = defaultController;
```

This pattern is used across all controllers (Users, Rooms, Bookings, Payments) for consistency.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL server

### Installation

1. Clone the repository and navigate to the backend directory

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
// APP
PORT=5000
NODE_ENV=development

// DB
DB_PORT=3306
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
```

4. Set up the database:
```bash
# Create and set up all databases (development, test, production)
npm run setup:db:all
```

5. Start the development server:
```bash
npm run dev
```

## Testing

The project includes comprehensive unit and integration tests using Jest.

### Running Tests

Run all tests:
```bash
npm test
```

Run specific test files:
```bash
npm test -- tests/controllers/users.controller.test.js
```

### Testing Approach

- **Unit Tests**: Each controller has dedicated test files that verify functionality in isolation
- **Dependency Injection**: Tests use mock implementations of models and services
- **Test Organization**: Tests are organized into describe blocks by function with clear setup, call, and assertion sections

Example test using dependency injection:

```javascript
// Mock dependencies
const mockUsersModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
};

// Create controller with mocks
const usersController = createUsersController({
  Users: mockUsersModel,
  validator: mockValidator
});

test('should return all users', async () => {
  // SETUP: Configure mock behavior
  mockUsersModel.findAll.mockResolvedValue([{ id: 1, name: 'Test User' }]);
  
  // CALL: Execute the function being tested
  await usersController.getAllUsers(req, res);
  
  // ASSERTION: Verify expected outcomes
  expect(mockUsersModel.findAll).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Test User' }]);
});
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Available Endpoints

#### Users
- GET /api/users - Get all users
- GET /api/users/:id - Get user by ID
- POST /api/users - Create new user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

#### Rooms
- GET /api/rooms - Get all rooms
- GET /api/rooms/:id - Get room by ID
- POST /api/rooms - Create new room
- PUT /api/rooms/:id - Update room
- DELETE /api/rooms/:id - Delete room
- GET /api/rooms/availability - Check room availability for date range
- GET /api/rooms/amenities - Filter rooms by amenities

#### Bookings
- GET /api/bookings - Get all bookings
- GET /api/bookings/:id - Get booking by ID
- POST /api/bookings - Create new booking
- PUT /api/bookings/:id - Update booking
- DELETE /api/bookings/:id - Delete booking

#### Payments
- GET /api/payments - Get all payments
- GET /api/payments/:id - Get payment by ID
- POST /api/payments - Create new payment
- PUT /api/payments/:id - Update payment
- DELETE /api/payments/:id - Delete payment
- POST /api/payments/:id/process - Process a payment

### Error Handling

All controllers implement consistent error handling:

- **400 Bad Request**: Validation errors or invalid input
- **404 Not Found**: Resource does not exist
- **500 Internal Server Error**: Database or processing errors

Example error response:
```json
{
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Development

### Running Tests
```bash
npm test
```

### Code Style
This project uses ESLint for code style enforcement. Run linting with:
```bash
npm run lint
```

## License

This project is licensed under the MIT License - see the LICENSE file for details
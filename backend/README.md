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

## Tech Stack

- Node.js
- Express.js - Web framework
- Sequelize - ORM for MySQL
- MySQL - Database
- Jest - Testing framework
- Express Validator - Input validation
- bcryptjs - Password hashing

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
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
```

4. Set up the database:
```bash
# Run migrations to create database tables
npm run migrate
```

5. Start the development server:
```bash
npm run dev
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

## Response Format

Successful Response:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error Response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
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
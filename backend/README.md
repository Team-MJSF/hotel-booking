# Hotel Booking Backend

This is the backend service for the Hotel Booking application, built with Express.js and Sequelize ORM.

## Features

- RESTful API endpoints for user management
- MySQL database integration with Sequelize ORM
- Input validation and error handling
- Comprehensive test coverage

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

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=hotel-booking
```

3. Start the development server:
```bash
npm run dev
```

## API Documentation

### User Management

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

Detailed API documentation can be found in the `/docs` directory.

## Testing

The project uses Jest for testing. Run the test suite with:

```bash
npm test
```

## Project Structure

```
backend/
├── config/         # Configuration files
├── models/         # Database models
├── routes/         # API routes
├── docs/           # API documentation
├── __tests__/      # Test files
└── server.js       # Entry point
```

## Database Schema

The application uses the following main tables:

- Users
- Bookings
- Rooms
- Payments

Refer to the models directory for detailed schema definitions.
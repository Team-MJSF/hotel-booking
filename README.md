# Hotel Booking System

A full-stack web application for hotel booking management, built with React and Express.js.

## Project Overview

This project is a modern hotel booking system that allows users to manage room reservations, user accounts, and payments. It consists of a React-based frontend for the user interface and an Express.js backend for API services.

## Tech Stack

### Frontend
- React (with Vite as build tool)
- JavaScript

### Backend
- Node.js with Express.js
- Sequelize ORM
- MySQL Database
- Jest for testing
- Factory pattern with dependency injection for controllers

## Architecture Highlights

### Backend Design

- **Controller Factory Pattern**: Uses factory functions with dependency injection for better testability and maintainability
- **Comprehensive Test Coverage**: Each controller has dedicated test suites
- **Consistent Error Handling**: Standardized approach across all endpoints
- **Model-Controller Separation**: Clear separation of concerns between data models and business logic

### Testing Approach

The project includes extensive unit tests for controllers and models:

- **Mocking Strategy**: Dependencies are mocked using Jest's mocking facilities
- **Test Organization**: Tests follow the setup-call-assertion pattern for clarity
- **Isolation**: Each test uses fresh instances of controllers with custom dependencies

## Project Structure

```
hotel-booking/
├── frontend/       # React frontend application
├── backend/        # Express.js backend API
│   ├── controllers/  # Business logic using factory pattern
│   ├── models/       # Sequelize data models
│   ├── routes/       # API routes
│   ├── tests/        # Jest test files
│   └── ...
└── README.md       # This file
```

Detailed documentation for each part can be found in their respective directories.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL server
- npm

### Installation

1. Clone the repository

2. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

3. Install Backend Dependencies:
```bash
cd backend
npm install
```

4. Configure Backend Environment:
Create a `.env` file in the backend directory with:
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

5. Set up the Database:
```bash
cd backend
# Create and set up all databases (development, test, production)
npm run setup:db:all
```

### Development

1. Start the Backend Server:
```bash
cd backend
npm run dev
```

2. Start the Frontend Development Server:
```bash
cd frontend
npm run dev
```

### Testing

Run backend tests:
```bash
cd backend
npm test
```

Run specific test files:
```bash
cd backend
npm test -- tests/controllers/users.controller.test.js
```

## API Documentation

For detailed API documentation, please see the [Backend README](backend/README.md).

## Development Resources

- React Documentation: https://react.dev/learn
- Express.js Learning Resources: https://expressjs.com/
- Sequelize Documentation: https://sequelize.org/docs/v6/getting-started/

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.


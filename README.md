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

## Project Structure

```
hotel-booking/
├── frontend/       # React frontend application
├── backend/        # Express.js backend API
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

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Configure backend environment:
Create a `.env` file in the backend directory with:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=hotel-booking
```

### Development

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

## Development Resources

- React documentation: https://react.dev/learn
- Express.js documentation: https://expressjs.com/
- Sequelize documentation: https://sequelize.org/docs/v6/getting-started/
- MySQL documentation: https://dev.mysql.com/doc/mysql-getting-started/en/
- Jest documentation: https://jestjs.io/docs/getting-started
- Express Validator documentation: https://express-validator.github.io/docs/guides/getting-started
- bcryptjs documentation: https://www.npmjs.com/package/bcrypt

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.


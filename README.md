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

## Development Resources

- React Documentation: https://react.dev/learn
- Express.js Learning Resources: https://expressjs.com/
- Sequelize Documentation: https://sequelize.org/docs/v6/getting-started/

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.


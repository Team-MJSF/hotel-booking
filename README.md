# Hotel Booking System

A full-stack hotel booking application built with NestJS (backend) and React (frontend).

## Project Structure

```
hotel-booking/
├── backend/                 # NestJS backend application
│   ├── src/                # Source code
│   │   ├── config/        # Configuration files
│   │   ├── users/         # User management module
│   │   ├── rooms/         # Room management module
│   │   ├── bookings/      # Booking management module
│   │   ├── payments/      # Payment processing module
│   │   └── migrations/    # Database migrations
│   ├── test/              # Test files
│   └── package.json       # Backend dependencies
└── frontend/              # React frontend application
    ├── src/              # Source code
    ├── public/           # Static files
    └── package.json      # Frontend dependencies
```

## Features

- User authentication and authorization
- Room management and availability tracking
- Booking system with real-time availability
- Payment processing integration
- Admin dashboard for hotel management
- Responsive design for all devices

## Tech Stack

### Backend
- NestJS (Node.js framework)
- TypeORM (ORM)
- MySQL (Database)
- JWT (Authentication)
- Swagger (API Documentation)

### Frontend
- React
- TypeScript
- Material-UI
- Redux Toolkit
- React Router

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hotel_booking
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   PORT=3000
   ```

4. Run database migrations:
   ```bash
   npm run migration:run
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

The backend API will be available at `http://localhost:3000`
API documentation will be available at `http://localhost:3000/api`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will be available at `http://localhost:3001`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## API Documentation

The API documentation is automatically generated using Swagger and is available at:
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Database Schema

The application uses the following main entities:

### Users
- id (Primary Key)
- firstName
- lastName
- email (Unique)
- password (Hashed)
- role (Enum: ADMIN, USER)
- createdAt
- updatedAt

### Rooms
- id (Primary Key)
- roomNumber (Unique)
- type (Enum: SINGLE, DOUBLE, SUITE, DELUXE)
- pricePerNight
- maxGuests
- description
- amenities (JSON)
- availabilityStatus (Enum: AVAILABLE, OCCUPIED, MAINTENANCE)
- isActive
- createdAt
- updatedAt

### Bookings
- id (Primary Key)
- userId (Foreign Key)
- roomId (Foreign Key)
- checkInDate
- checkOutDate
- numberOfGuests
- specialRequests
- status (Enum: PENDING, CONFIRMED, CANCELLED)
- createdAt
- updatedAt

### Payments
- id (Primary Key)
- bookingId (Foreign Key)
- amount
- currency
- paymentMethod (Enum: CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER)
- transactionId
- status (Enum: PENDING, COMPLETED, FAILED, REFUNDED)
- description
- createdAt
- updatedAt

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.


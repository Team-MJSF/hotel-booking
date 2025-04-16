# Hotel Booking System

A full-stack hotel booking application built with NestJS (backend) and Next.js (frontend).

## Project Structure

```
hotel-booking/
├── backend/                # NestJS backend application
│   ├── src/               # Source code
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management module
│   │   ├── rooms/         # Room management module
│   │   ├── bookings/      # Booking management module
│   │   ├── payments/      # Payment processing module (mocked)
│   │   └── database/      # Database migrations and configuration
│   └── package.json       # Backend dependencies
└── frontend/              # Next.js frontend application
    ├── src/               # Source code
    │   ├── app/           # Next.js App Router pages
    │   ├── components/    # UI components
    │   ├── services/      # API services
    │   └── lib/           # Utility functions
    ├── public/            # Static files
    └── package.json       # Frontend dependencies
```

## Features

- User authentication and authorization with JWT
- Room browsing and filtering
- Real-time room availability checking
- Booking management (create, view, cancel)
- Mock payment processing
- Responsive design for all devices
- Rate limit handling with exponential backoff

## Tech Stack

### Backend
- [NestJS](https://nestjs.com/) (Node.js framework)
- [TypeScript](https://www.typescriptlang.org/)
- [TypeORM](https://typeorm.io/) (ORM)
- [SQLite](https://www.sqlite.org/) (Database)
- [JWT](https://jwt.io/) (Authentication)
- [Passport](http://www.passportjs.org/) (Authentication middleware)
- [Swagger](https://swagger.io/) (API Documentation)

### Frontend
- [Next.js](https://nextjs.org/) (React framework)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (Styling)
- [shadcn/ui](https://ui.shadcn.com/) (UI Components)
- [Axios](https://axios-http.com/) (HTTP Client)
- [date-fns](https://date-fns.org/) (Date handling)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) & [Jest](https://jestjs.io/) (Testing)

## Prerequisites

- Node.js (v18 or higher)
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

3. Set up environment variables:
   - Copy `.env.example` to `.env.development` for development
   - Copy `.env.example` to `.env.test` for testing
   - Update the variables with your configuration

4. Initialize the development database:
   ```bash
   npm run init:dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`
API documentation will be available at `http://localhost:5000/api/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will be available at `http://localhost:3000`

## Running Both Services

You can run both the frontend and backend concurrently:

```bash
# From the root directory
npm install
npm run dev
```

## Testing

### Backend Tests
```bash
cd backend
npm test          # Run all tests
npm run test:unit # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:cov  # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm test
```

## API Documentation

The API documentation is automatically generated using Swagger and is available at:
- Development: `http://localhost:5000/api/docs`

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

### Room Types
- id (Primary Key)
- name
- description
- pricePerNight
- maxGuests
- amenities
- imageUrl
- createdAt
- updatedAt

### Rooms
- id (Primary Key)
- roomNumber (Unique)
- roomTypeId (Foreign Key)
- floor
- status (Available, Occupied, Maintenance)
- createdAt
- updatedAt

### Bookings
- id (Primary Key)
- userId (Foreign Key)
- roomId (Foreign Key)
- checkInDate
- checkOutDate
- numberOfGuests
- totalPrice
- status (Enum: PENDING, CONFIRMED, CANCELLED)
- createdAt
- updatedAt

### Payments
- id (Primary Key)
- bookingId (Foreign Key)
- amount
- paymentMethod
- transactionId
- status (Enum: PENDING, COMPLETED, FAILED, REFUNDED)
- createdAt
- updatedAt

## Notes

- This project is designed for educational purposes
- The payment system is mocked for demonstration
- All data operations are stored in SQLite database files

## License

This project is part of a school assignment and is not licensed for commercial use.


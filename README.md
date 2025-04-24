# Hotel Booking System

A full-stack hotel booking application built with NestJS (backend) and Next.js (frontend).

## Project Overview

This application provides a complete hotel booking solution with room browsing, booking management, and payment processing. The system follows a modern, scalable architecture with a clear separation between backend services and frontend presentation.

## Project Structure

```
hotel-booking/
├── backend/                # NestJS backend application
│   └── src/               # Source code
│       ├── auth/          # Authentication module
│       ├── users/         # User management module
│       ├── rooms/         # Room management module
│       ├── bookings/      # Booking management module
│       ├── payments/      # Payment processing module (mocked)
│       ├── common/        # Shared utilities, pipes and filters
│       └── database/      # Database configuration and migrations
└── frontend/              # Next.js frontend application
    ├── src/               # Source code
    │   ├── app/           # Next.js App Router pages
    │   ├── components/    # UI components
    │   ├── services/      # API services
    │   ├── types/         # TypeScript interfaces
    │   └── lib/           # Utility functions
    ├── public/            # Static files
    └── test/              # Test suite
```

## Key Features

- **User Management**: Registration, authentication, and profile management
- **Room Management**: Browse, search, and filter available rooms
- **Booking System**: Create, view, modify, and cancel bookings
- **Payment Processing**: Secure payment handling (mocked for demonstration)
- **Admin Dashboard**: Manage rooms, bookings, and user accounts
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **API Documentation**: Auto-generated Swagger documentation

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: TypeORM with SQLite
- **Authentication**: JWT, Passport.js
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: Next.js 14 with React and TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **Testing**: Jest, React Testing Library

## User Flow

1. Search and filter available rooms
2. Select a room and check availability for desired dates
3. Complete booking form with guest information
4. Enter payment information (mock payment)
5. Receive booking confirmation
6. View and manage bookings in user dashboard

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

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
   ```bash
   cp .env.example .env.development
   ```

4. Initialize the database:
   ```bash
   npm run init:dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`  
API documentation: `http://localhost:5000/api/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### Running Both Services

From the root directory:

```bash
npm install
npm run dev
```

## Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests
npm run test:cov        # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## Core Entities

### Users
- Authentication credentials and profile information
- Role-based access control (Admin/User)

### Room Types
- Categories of rooms with pricing and amenities
- Image galleries and detailed descriptions

### Rooms
- Individual rooms with unique identifiers
- Status tracking and availability management

### Bookings
- Reservation details with date ranges
- Status tracking throughout the booking lifecycle

### Payments
- Transaction records for bookings
- Support for multiple payment methods (mocked)

## API Architecture

The backend follows RESTful API design principles:

- **Authentication**: `/auth` - Login, registration, token refresh
- **Users**: `/users` - User management
- **Rooms**: `/rooms` - Room and room type operations
- **Bookings**: `/bookings` - Booking creation and management
- **Payments**: `/payments` - Payment processing operations

## Development Notes

- Authentication tokens are stored in memory and local storage
- The payment system is mocked but structured to support real gateway integration
- Development data is automatically seeded on initialization
- Frontend uses optimistic UI updates for better user experience

## Best Practices

- Comprehensive unit and integration testing
- TypeScript for type safety
- Error handling with appropriate status codes
- Form validation on both client and server
- Defensive programming with graceful fallbacks

## License

This project is part of a school assignment and is not licensed for commercial use.


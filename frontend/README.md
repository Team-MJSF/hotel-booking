# Hotel Booking Frontend

A modern, responsive hotel booking application built with Next.js, TypeScript, and shadcn/ui components.

## 🏨 Overview

This frontend application provides a complete hotel booking experience, allowing users to:

- Browse available room types
- Search and filter rooms based on date, occupancy, and price
- View detailed room information
- Make and manage bookings
- Process mock payments
- View booking history

The application connects to a NestJS backend API for data persistence and user authentication.

## 🔧 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React hooks
- **Date Handling**: [date-fns](https://date-fns.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Testing**: [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 📋 Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Backend API running on http://localhost:5000 (or configured via environment variables)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hotel-booking/frontend

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup

Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Adjust the URL if your backend is running on a different port or host.

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000.

### Build for Production

```bash
# Create an optimized production build
npm run build
# or
yarn build

# Start the production server
npm start
# or
yarn start
```

## 📁 Project Structure

```
frontend/
├── public/           # Static assets
│   └── images/       # Room and hotel images
├── src/              # Source code
│   ├── app/          # Next.js App Router pages
│   ├── components/   # Reusable components
│   │   ├── ui/       # shadcn/ui components
│   │   └── ...       # Application-specific components
│   ├── lib/          # Utility functions
│   ├── services/     # API services
│   └── types/        # TypeScript type definitions
├── .env.local        # Environment variables
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json     # TypeScript configuration
```

## 🔄 Main Features

### Authentication

- User registration and login
- JWT-based authentication
- Protected routes for authenticated users

### Room Browsing and Booking

- List all room types with filtering capabilities
- Detailed room view with amenities and policies
- Date-based availability checking
- Room number selection

### Booking Management

- View active and past bookings
- Cancel existing bookings
- Mock payment processing

### Error Handling

- Comprehensive error states
- Fallback strategies for API failures
- Rate limiting protection with exponential backoff

## 🧪 Testing

```bash
# Run all tests
npm test
# or
yarn test

# Run tests with coverage
npm test -- --coverage
# or
yarn test --coverage
```

## 🛡️ Error Handling Strategy

The application implements a robust error handling strategy:

1. API request errors are caught and displayed to the user
2. Unavailable API endpoints trigger fallback UI states
3. Rate limiting issues are handled with exponential backoff
4. Form validation provides immediate feedback

## 🔌 API Integration

The frontend connects to a NestJS backend with the following main endpoints:

- `/auth/*` - Authentication endpoints
- `/room-types/*` - Room type information
- `/rooms/*` - Room availability and details
- `/bookings/*` - Booking management

## 📝 Notes

- Payment processing is mocked for demonstration purposes
- For school project use only, not meant for production without additional security measures

## 📋 Future Improvements

- Add comprehensive test coverage
- Implement real payment gateway integration
- Add internationalization (i18n) support
- Implement advanced caching strategies
- Add accessibility improvements

## 📜 License

This project is part of a school assignment and is not licensed for commercial use.

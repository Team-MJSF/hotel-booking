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

- **Framework**: [Next.js](https://nextjs.org/) 14 with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context API and hooks
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
NEXT_PUBLIC_AUTH_STORAGE=sessionStorage
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
├── public/               # Static assets
│   └── images/           # Room and hotel images
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── about/        # About page
│   │   ├── account/      # User account management
│   │   ├── amenities/    # Hotel amenities page
│   │   ├── booking/      # Booking creation flow
│   │   ├── bookings/     # Booking management & details
│   │   ├── contact/      # Contact page
│   │   ├── login/        # User authentication
│   │   ├── my-bookings/  # User booking overview
│   │   ├── payment/      # Payment processing
│   │   ├── register/     # User registration
│   │   ├── rooms/        # Room listing and details
│   │   └── page.tsx      # Homepage
│   ├── components/       # Reusable components
│   │   ├── layout/       # Layout components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Application-specific components
│   ├── context/          # React Context providers
│   │   └── AuthContext.tsx # Authentication context
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── services/         # API services
│   │   └── api.ts        # API integration layer
│   └── types/            # TypeScript type definitions
├── .env.local            # Environment variables
├── jest.config.ts        # Jest configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔄 Application Flow

1. **User Journey**:
   - Users browse available rooms on the rooms page
   - Select a room and view detailed information
   - Choose dates and guest count
   - Click "Book Now" to proceed to payment
   - Complete mock payment process
   - View booking in "My Bookings" section

2. **Authentication Flow**:
   - JWT-based authentication stored in session/local storage
   - Protected routes redirect unauthenticated users to login
   - Auth state managed through React Context API
   - Token refresh handling for extended sessions

3. **Data Flow**:
   - API requests centralized in `services/api.ts`
   - Responses follow consistent `ApiResponse<T>` format
   - Error handling with graceful degradation
   - Multiple fallback strategies for robustness

## 🛡️ Authentication System

The application uses a JWT-based authentication system:

- **Storage**: Configurable via `NEXT_PUBLIC_AUTH_STORAGE` (sessionStorage/localStorage)
- **Context Provider**: `AuthContext` provides authentication state to all components
- **Protected Routes**: Redirect unauthenticated users
- **User Management**: Registration, login, and profile management

```tsx
// Example usage of authentication
const { user, login, logout, isAuthenticated } = useAuth();
```

## 💳 Payment Processing

The payment system is mocked for demonstration purposes:

- Credit card validation with proper formatting
- Multiple payment method options (Credit Card, Debit Card, PayPal)
- Robust error handling and validation
- Success/failure state management
- Integration with booking status updates

The payment workflow:
1. User enters payment details
2. Frontend validates card information
3. Payment request sent to backend
4. Backend processes mock payment
5. Booking status updated to "CONFIRMED"
6. User redirected to booking confirmation

## 📊 Data Models

Key TypeScript interfaces include:

- **User**: Authentication and profile information
- **Room/RoomType**: Room details, amenities, and pricing
- **Booking**: Reservation details with dates and status
- **Payment**: Transaction details for booking payments

## 🧪 Testing Strategy

The application uses Jest and React Testing Library for comprehensive testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test files
npm test -- payment
```

Testing principles:
- Component isolation with proper mocking
- User interaction simulation
- API service mocking
- Authentication state testing
- Form validation testing
- Error state verification

## 🚀 Deployment

The application can be deployed using:

```bash
# Build for production
npm run build

# Start production server
npm start
```

For cloud deployment, consider:
- Vercel (optimized for Next.js)
- Netlify
- AWS Amplify

## 🔍 Troubleshooting

Common issues and solutions:

1. **API Connection Issues**:
   - Verify backend is running
   - Check `.env.local` configuration
   - Examine browser console for CORS errors

2. **Authentication Failures**:
   - Clear browser storage
   - Verify token format
   - Check for expired tokens

3. **Test Failures**:
   - Run with `--detectOpenHandles` to find unresolved promises
   - Check mock implementations
   - Verify test environment setup

## 📝 Development Guidelines

- Follow TypeScript best practices with proper typing
- Use functional components with hooks
- Implement proper error handling
- Write tests for new components
- Follow the established component structure
- Use the shadcn/ui component library for consistency



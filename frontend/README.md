# Hotel Booking Frontend Application

## Overview
This Next.js frontend application provides a complete hotel booking experience. Users can browse available room types, make and manage bookings, process mock payments, and view their booking history.

## Features
- Room browsing with detailed information and images
- Date-based availability checking
- Secure booking process
- Mock payment processing
- User authentication and account management
- Booking history and management
- Responsive design for desktop and mobile devices

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Jest and React Testing Library
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- Backend API service running (see backend README)

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project folder
cd hotel-booking/frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
# or
yarn dev
```

## Project Structure
```
frontend/
├── app/                # Next.js App Router (pages)
├── components/         # UI components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── services/           # API services
├── types/              # TypeScript definitions
├── public/             # Static assets
└── __tests__/          # Test files
```

## Application Flow
1. **Homepage** - Browse featured rooms and promotions
2. **Room Listing** - View all available room types with filtering options
3. **Room Details** - See detailed information about a specific room
4. **Booking** - Select dates and guest information
5. **Payment** - Enter payment details (mock process)
6. **Confirmation** - View booking confirmation
7. **My Bookings** - Manage existing bookings

## Authentication
The application uses JWT-based authentication with these user flows:
- Registration
- Login
- Password reset
- Profile management

## Payment Processing
Payment processing is mocked in this application:
1. User enters card details
2. Frontend validates format
3. Mock payment is processed
4. Booking is marked as confirmed

## Data Models

### Room
```typescript
interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  imageUrl: string;
  amenities: string[];
}
```

### Booking
```typescript
interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
```

## Testing
The application includes:
- Unit tests for components and utilities
- Integration tests for key user flows
- Mock service workers for API testing

Run tests with:
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Deployment
The application can be deployed to various platforms:

### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel
```

### Static Export
```bash
npm run build
npm run export
# Deploy the 'out' directory to your hosting provider
```

## Troubleshooting

### Common Issues
- **API Connection Errors**: Ensure backend is running and NEXT_PUBLIC_API_URL is correct
- **Authentication Issues**: Clear browser storage and login again
- **Build Failures**: Check Node.js version compatibility

## Development Guidelines
- Follow the existing component structure
- Use TypeScript for all new code
- Write tests for new features
- Follow the established design patterns

## Additional Resources
- For detailed technical documentation, see [DEVELOPERS.md](./DEVELOPERS.md)
- Backend API documentation is available at [API_URL]/api/docs when running the backend

## License
This project is licensed under the MIT License - see the LICENSE file for details.



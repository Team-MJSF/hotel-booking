# Developer Documentation

This document provides technical details for developers working on the Hotel Booking frontend application.

## Architecture Overview

The application follows a modern React architecture with Next.js App Router, organized around feature-based modules:

```
src/
├── app/                # Next.js App Router (pages)
├── components/         # UI components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── services/           # API services
└── types/              # TypeScript type definitions
```

### Key Design Patterns

1. **Component Composition**: UI is built from small, composable components
2. **Context API**: Global state managed through React Context
3. **Custom Hooks**: Logic extraction for reusability
4. **Service Layer**: API communication centralized in services
5. **TypeScript Interfaces**: Strong typing throughout the application

## Core Services

### API Service (`services/api.ts`)

The API service provides a centralized interface to the backend:

```typescript
// Example usage
import { roomService, bookingService, paymentService } from '@/services/api';

// Get room types
const rooms = await roomService.getRoomTypes();

// Create a booking
const booking = await bookingService.createBooking(bookingData);

// Process payment
const payment = await paymentService.processPayment(paymentData);
```

#### Key Features:

- **Axios Instance**: Configured with base URL, timeout, and interceptors
- **Error Handling**: Comprehensive error handling with fallbacks
- **Response Normalization**: Consistent response format
- **Authentication**: Token handling in request headers

### Authentication Context (`context/AuthContext.tsx`)

Manages user authentication state:

```typescript
// Example usage
const { user, login, logout, isAuthenticated } = useAuth();

// Login user
const result = await login(email, password);

// Access user information
if (isAuthenticated) {
  console.log(user.email);
}

// Logout user
logout();
```

#### Implementation Details:

- JWT-based authentication
- Token storage in session/local storage
- Automatic user loading on page refresh
- Protected route handling

## Component Organization

### UI Components

Located in `components/ui/`, these are shadcn/ui components configured for the application's design system:

- Button
- Card
- Dialog
- Form components
- Typography components

### Layout Components

Located in `components/layout/`, these define the application structure:

- Header
- Footer
- Navigation
- Containers

### Feature Components

Feature-specific components are organized by functionality:

- Room components
- Booking components
- Payment components

## Routing and Pages

The application uses Next.js App Router with the following main routes:

- `/` - Homepage
- `/rooms` - Room listings
- `/rooms/[id]` - Room details
- `/booking` - Booking creation
- `/payment` - Payment processing
- `/bookings` - User bookings
- `/login` and `/register` - Authentication
- `/account` - User account

## State Management

State is managed at three levels:

1. **Local Component State**: `useState` for component-specific state
2. **Context API**: `useContext` for shared state across components
3. **URL State**: Search parameters for shareable state

## API Data Flow

1. API request initiated from a component
2. Request processed by the appropriate service function
3. Service function handles HTTP communication and error management
4. Data normalized and returned to the component
5. Component updates UI based on the response

## Payment Processing

The payment system follows this workflow:

1. User enters card details in `app/payment/page.tsx`
2. Frontend validation in the payment form
3. `paymentService.processPayment()` called with payment details
4. Mock payment processed by backend
5. Booking status updated to "CONFIRMED"
6. UI updates to show payment success
7. User redirected to bookings page

### Payment Fallback Strategy:

Multiple fallback approaches ensure payment succeeds even if some APIs fail:
1. Direct booking update with payment information
2. Dedicated payment endpoint
3. Simple booking status update
4. Mock success response as last resort

## Authentication Flow

1. User enters credentials on login page
2. `authService.login()` called with credentials
3. Backend validates credentials and returns JWT
4. Token stored in session/local storage
5. `AuthContext` updated with user information
6. Protected routes become accessible

## Error Handling Strategy

The application implements a comprehensive error handling approach:

1. **API Service Layer**: Catches and processes HTTP errors
2. **UI Components**: Display appropriate error states
3. **Form Validation**: Prevents invalid data submission
4. **Fallback Strategies**: Alternative approaches when primary methods fail

## Testing

### Component Testing

Located in `__tests__` folders or adjacent to components with `.spec.tsx` or `.test.tsx` extensions:

```typescript
// Example component test
describe('RoomCard', () => {
  it('renders room information correctly', () => {
    render(<RoomCard room={mockRoom} />);
    expect(screen.getByText(mockRoom.name)).toBeInTheDocument();
  });
});
```

### Integration Testing

Tests that verify interactions between components:

```typescript
// Example integration test
it('completes booking and payment flow', async () => {
  // Render booking component
  // Fill form
  // Submit form
  // Verify navigation to payment
  // Complete payment
  // Verify success
});
```

### Testing Utilities

- **Mock Services**: Pre-configured mocks for API services
- **Test Providers**: Context providers for testing
- **User Event Simulation**: Simulates user interactions

## Performance Considerations

1. **Code Splitting**: Automatic code splitting with Next.js
2. **Image Optimization**: Next.js Image component for optimized images
3. **Memoization**: React.memo and useMemo for expensive operations
4. **Lazy Loading**: Components loaded only when needed

## TypeScript Type System

Key interfaces include:

```typescript
// User interface
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Room interface
interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  imageUrl: string;
  amenities: string[];
}

// Booking interface
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

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Contributing Guidelines

1. **Branch Naming**: Use feature/{feature-name} for new features
2. **Commit Messages**: Follow conventional commit format
3. **Pull Requests**: Include tests and documentation updates
4. **Code Style**: Follow project ESLint and Prettier configuration
5. **Testing**: Ensure tests pass before submitting PR

## Debugging Tips

1. **React DevTools**: Use React DevTools for component inspection
2. **Network Monitoring**: Check browser network tab for API requests
3. **Console Logging**: Strategic console.logs in development build
4. **Error Boundaries**: Implementation catches rendering errors

## Build and Deployment

The project uses Next.js build system:

```bash
# Development build with hot reloading
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test
```

## Environment Configuration

Environment variables are managed through `.env.local`:

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_AUTH_STORAGE`: Authentication storage (sessionStorage/localStorage)

# Booking System - Technical Documentation

This document provides detailed technical specifications for the booking system implementation within the hotel booking application. It documents the implementation details, data flow, and integration points for developers working on the system.

## Booking Data Model

### Core Booking Interface
```typescript
interface Booking {
  id: number;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  room: {
    id: number;
    roomNumber: string;
    type: string;
  };
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  payment?: {
    paymentId: number;
    amount: number;
    status: string;
  };
  isTemporary: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Create Booking Request
```typescript
interface CreateBookingRequest {
  roomId: number;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  numberOfGuests: number;
  specialRequests?: string;
}
```

### Update Booking Request
```typescript
interface UpdateBookingRequest {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
}
```

## API Integration

### BookingService

The `BookingService` class handles all booking-related API calls:

```typescript
class BookingService {
  // Get all bookings for the current user
  async getUserBookings(): Promise<Booking[]> 
  
  // Get a specific booking by ID
  async getBooking(id: number): Promise<Booking>
  
  // Create a new booking
  async createBooking(data: CreateBookingRequest): Promise<Booking>
  
  // Update an existing booking
  async updateBooking(id: number, data: UpdateBookingRequest): Promise<Booking>
  
  // Cancel a booking
  async cancelBooking(id: number): Promise<Booking>
}
```

### API Endpoints

| Method | Endpoint                | Description                    | Auth Required |
|--------|-------------------------|--------------------------------|---------------|
| GET    | `/bookings`             | Get all bookings               | Yes           |
| GET    | `/bookings/user`        | Get current user bookings      | Yes           |
| GET    | `/bookings/:id`         | Get a specific booking         | Yes           |
| POST   | `/bookings`             | Create a new booking           | Yes           |
| PATCH  | `/bookings/:id`         | Update a booking               | Yes           |
| PATCH  | `/bookings/:id/status`  | Update booking status          | Yes           |
| PATCH  | `/bookings/:id/cancel`  | Cancel a booking               | Yes           |
| DELETE | `/bookings/:id`         | Delete a booking (Admin only)  | Yes           |

## Component Architecture

### Booking Flow Components

```
app/
├── rooms/
│   ├── [id]/
│   │   └── page.tsx         # Room details & booking initiation
├── booking/
│   ├── page.tsx             # Booking form
│   ├── confirmation.tsx     # Booking confirmation
│   └── hooks/
│       └── useBookingForm.ts # Form state management
├── payment/
│   └── page.tsx             # Payment processing
└── my-bookings/
    ├── page.tsx             # List user bookings
    └── [id]/
        └── page.tsx         # Booking details
```

### Key Components

1. **RoomBookingForm**: Handles date selection, guest count, and initial booking creation
2. **BookingConfirmation**: Displays booking details before payment
3. **PaymentForm**: Processes payment for the booking
4. **BookingsList**: Displays user bookings with filtering and sorting options
5. **BookingDetail**: Shows detailed information about a specific booking

## State Management

### Booking Context

```typescript
interface BookingContextType {
  currentBooking: Booking | null;
  setCurrentBooking: (booking: Booking | null) => void;
  isCreatingBooking: boolean;
  bookingError: Error | null;
  createBooking: (data: CreateBookingRequest) => Promise<Booking>;
  updateBookingStatus: (id: number, status: string) => Promise<Booking>;
  cancelBooking: (id: number) => Promise<Booking>;
}
```

## Error Handling

### Booking-specific Error Types

```typescript
class BookingValidationError extends Error {
  public validationErrors: { field: string; message: string }[];
  
  constructor(message: string, validationErrors: { field: string; message: string }[]) {
    super(message);
    this.validationErrors = validationErrors;
    this.name = 'BookingValidationError';
  }
}

class BookingNotFoundError extends Error {
  constructor(bookingId: number) {
    super(`Booking with ID ${bookingId} not found`);
    this.name = 'BookingNotFoundError';
  }
}
```

## Frontend Business Logic

### Date Validation

```typescript
const validateBookingDates = (checkIn: Date, checkOut: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check-in must be today or in the future
  if (checkIn < today) {
    return false;
  }
  
  // Check-out must be after check-in
  if (checkOut <= checkIn) {
    return false;
  }
  
  return true;
};
```

### Price Calculation

```typescript
const calculateTotalPrice = (
  checkIn: Date, 
  checkOut: Date, 
  pricePerNight: number
): number => {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * pricePerNight;
};
```

## Testing Strategy

### Unit Tests

1. **Service Tests**: Verify API calls, error handling, and response parsing
2. **Hook Tests**: Test custom hooks for form validation and state management
3. **Utility Tests**: Validate date functions, price calculations, etc.

### Integration Tests

1. **Booking Flow**: Test complete booking process from room selection to confirmation
2. **Date Picker**: Ensure proper date selection and validation
3. **Availability Checking**: Verify room availability logic

### Mock Approaches

```typescript
// Mock booking service for testing components
const mockBookingService = {
  getUserBookings: jest.fn().mockResolvedValue([...mockBookings]),
  getBooking: jest.fn().mockImplementation((id) => {
    const booking = mockBookings.find(b => b.id === id);
    return booking ? Promise.resolve(booking) : Promise.reject(new Error('Not found'));
  }),
  createBooking: jest.fn().mockImplementation((data) => {
    return Promise.resolve({
      id: Math.floor(Math.random() * 1000),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),
  updateBooking: jest.fn().mockImplementation((id, data) => {
    return Promise.resolve({
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }),
  cancelBooking: jest.fn().mockResolvedValue({ status: 'cancelled' }),
};
```

## Performance Considerations

1. **Optimistic Updates**: Update UI immediately before API response for better UX
2. **Memoization**: Cache booking calculations and form state
3. **Pagination**: Implement pagination for booking history to improve load times
4. **Lazy Loading**: Load booking details only when needed

## Security Considerations

1. **Input Validation**: Validate all booking inputs on the client and server
2. **Authorization**: Ensure users can only access their own bookings
3. **Payment Security**: Implement secure payment flow with proper validation
4. **Data Sanitization**: Sanitize all user inputs to prevent XSS attacks

## Integration with Other Modules

1. **User Module**: Retrieve current user information for booking
2. **Room Module**: Get room details and availability
3. **Payment Module**: Process payments for bookings
4. **Notification Module**: Send booking confirmations and reminders

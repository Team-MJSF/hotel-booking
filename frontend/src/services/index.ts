import { roomsService } from './rooms-service';
import { bookingsService } from './bookings-service';
import { usersService } from './users-service';
import { authService } from './auth-service';
import { paymentsService } from './payments-service';

// Export all services
export {
  roomsService,
  bookingsService,
  usersService,
  authService,
  paymentsService
};

// For convenient imports
export * from './rooms-service';
export * from './bookings-service';
export * from './users-service';
export * from './auth-service';
export * from './payments-service'; 
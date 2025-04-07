import { HttpStatus } from '@nestjs/common';
import {
  HotelBookingException,
  ResourceNotFoundException,
  ValidationException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  DatabaseException,
  PaymentProcessingException,
  BookingValidationException,
  RoomAvailabilityException,
} from './hotel-booking.exception';

describe('HotelBookingException', () => {
  describe('Base and Simple Exceptions', () => {
    it('should correctly create base exception with default and custom parameters', () => {
      // Test base exception with default status
      const defaultException = new HotelBookingException('Test exception');
      expect(defaultException.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(defaultException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Test exception',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: expect.any(String),
        })
      );
      
      // Test base exception with custom status and error details
      const customException = new HotelBookingException(
        'Custom exception',
        HttpStatus.BAD_REQUEST,
        { code: 'TEST_ERROR', details: { field: 'test' } }
      );
      expect(customException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(customException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Custom exception',
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp: expect.any(String),
          error: {
            code: 'TEST_ERROR',
            details: { field: 'test' }
          }
        })
      );
    });

    it('should correctly create basic derived exceptions with proper status codes and messages', () => {
      // ResourceNotFoundException
      const resourceException = new ResourceNotFoundException('User', 123);
      expect(resourceException.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(resourceException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'User with ID 123 not found',
          statusCode: HttpStatus.NOT_FOUND,
          error: { code: 'RESOURCE_NOT_FOUND' }
        })
      );
      
      // ConflictException
      const conflictException = new ConflictException('Email already in use');
      expect(conflictException.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(conflictException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Email already in use',
          statusCode: HttpStatus.CONFLICT,
          error: { code: 'CONFLICT' }
        })
      );
      
      // RoomAvailabilityException
      const availabilityException = new RoomAvailabilityException('Room is not available for the selected dates');
      expect(availabilityException.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(availabilityException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Room is not available for the selected dates',
          statusCode: HttpStatus.CONFLICT,
          error: { code: 'ROOM_UNAVAILABLE' }
        })
      );
    });
  });

  describe('Authorization Exceptions', () => {
    it('should correctly handle UnauthorizedException and ForbiddenException with default and custom messages', () => {
      // UnauthorizedException - default message
      const defaultUnauthorizedException = new UnauthorizedException();
      expect(defaultUnauthorizedException.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(defaultUnauthorizedException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Unauthorized access',
          statusCode: HttpStatus.UNAUTHORIZED,
          error: { code: 'UNAUTHORIZED' }
        })
      );
      
      // UnauthorizedException - custom message
      const customUnauthorizedException = new UnauthorizedException('Invalid credentials');
      expect(customUnauthorizedException.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(customUnauthorizedException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Invalid credentials',
          statusCode: HttpStatus.UNAUTHORIZED,
          error: { code: 'UNAUTHORIZED' }
        })
      );
      
      // ForbiddenException - default message
      const defaultForbiddenException = new ForbiddenException();
      expect(defaultForbiddenException.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(defaultForbiddenException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Access forbidden',
          statusCode: HttpStatus.FORBIDDEN,
          error: { code: 'FORBIDDEN' }
        })
      );
      
      // ForbiddenException - custom message
      const customForbiddenException = new ForbiddenException('Not enough permissions');
      expect(customForbiddenException.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(customForbiddenException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Not enough permissions',
          statusCode: HttpStatus.FORBIDDEN,
          error: { code: 'FORBIDDEN' }
        })
      );
    });
  });

  describe('Validation Exceptions', () => {
    it('should correctly handle exceptions with validation details', () => {
      // ValidationException
      const validationErrors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' }
      ];
      
      const validationException = new ValidationException('Validation failed', validationErrors);
      expect(validationException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(validationException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Validation failed',
          statusCode: HttpStatus.BAD_REQUEST,
          error: {
            code: 'VALIDATION_ERROR',
            details: validationErrors
          }
        })
      );
      
      // BookingValidationException
      const bookingErrors = [
        { field: 'checkInDate', message: 'Check-in date cannot be in the past' },
        { field: 'checkOutDate', message: 'Check-out date must be after check-in date' }
      ];
      
      const bookingException = new BookingValidationException('Booking validation failed', bookingErrors);
      expect(bookingException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(bookingException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Booking validation failed',
          statusCode: HttpStatus.BAD_REQUEST,
          error: {
            code: 'BOOKING_VALIDATION_ERROR',
            details: bookingErrors
          }
        })
      );
    });
  });

  describe('Error-Wrapping Exceptions', () => {
    it('should correctly handle exceptions that wrap original errors', () => {
      // DatabaseException
      const dbError = new Error('Database connection failed');
      const dbException = new DatabaseException('Database error occurred', dbError);
      
      expect(dbException.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(dbException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Database error occurred',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: 'DATABASE_ERROR',
            details: 'Database connection failed'
          }
        })
      );
      
      // PaymentProcessingException
      const paymentError = new Error('Payment declined');
      const paymentException = new PaymentProcessingException('Payment failed', paymentError);
      
      expect(paymentException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(paymentException.getResponse()).toEqual(
        expect.objectContaining({
          message: 'Payment failed',
          statusCode: HttpStatus.BAD_REQUEST,
          error: {
            code: 'PAYMENT_ERROR',
            details: 'Payment declined'
          }
        })
      );
    });
  });
}); 
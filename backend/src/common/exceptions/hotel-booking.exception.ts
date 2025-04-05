import { HttpException, HttpStatus } from '@nestjs/common';

interface ErrorDetails {
  code: string;
  details?: unknown;
}

export class HotelBookingException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: ErrorDetails,
  ) {
    super(
      {
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        error,
      },
      status,
    );
  }
}

export class ResourceNotFoundException extends HotelBookingException {
  constructor(resource: string, id: string | number) {
    super(`${resource} with ID ${id} not found`, HttpStatus.NOT_FOUND, {
      code: 'RESOURCE_NOT_FOUND',
    });
  }
}

export class ValidationException extends HotelBookingException {
  constructor(message: string, errors?: Array<{ field: string; message: string }>) {
    super(message, HttpStatus.BAD_REQUEST, {
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }
}

export class ConflictException extends HotelBookingException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, {
      code: 'CONFLICT',
    });
  }
}

export class UnauthorizedException extends HotelBookingException {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED, {
      code: 'UNAUTHORIZED',
    });
  }
}

export class ForbiddenException extends HotelBookingException {
  constructor(message: string = 'Access forbidden') {
    super(message, HttpStatus.FORBIDDEN, {
      code: 'FORBIDDEN',
    });
  }
}

export class DatabaseException extends HotelBookingException {
  constructor(message: string, error?: Error) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, {
      code: 'DATABASE_ERROR',
      details: error?.message,
    });
  }
}

export class PaymentProcessingException extends HotelBookingException {
  constructor(message: string, error?: Error) {
    super(message, HttpStatus.BAD_REQUEST, {
      code: 'PAYMENT_ERROR',
      details: error?.message,
    });
  }
}

export class BookingValidationException extends HotelBookingException {
  constructor(message: string, errors?: Array<{ field: string; message: string }>) {
    super(message, HttpStatus.BAD_REQUEST, {
      code: 'BOOKING_VALIDATION_ERROR',
      details: errors,
    });
  }
}

export class RoomAvailabilityException extends HotelBookingException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, {
      code: 'ROOM_UNAVAILABLE',
    });
  }
}

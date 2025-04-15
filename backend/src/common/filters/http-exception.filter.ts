import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { HotelBookingException } from '../exceptions/hotel-booking.exception';
import { ConflictException } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    this.logger.error(`Exception caught: ${exception instanceof Error ? exception.message : 'Unknown error'}`);
    
    // Log more details in development mode
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`Exception details: ${JSON.stringify(exception)}`);
      this.logger.debug(`Request path: ${request.url}`);
      this.logger.debug(`Request method: ${request.method}`);
    }

    // Handle known exceptions
    if (exception instanceof HotelBookingException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return response.status(status).json({
        success: false,
        message: typeof exceptionResponse === 'object' && 'message' in exceptionResponse 
          ? exceptionResponse.message 
          : 'An error occurred',
        error: exceptionResponse,
      });
    }

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Special case for ConflictException (409) - Email already exists
      if (exception instanceof ConflictException) {
        return response.status(status).json({
          success: false,
          message: 'Email already exists. Please use a different email or try logging in.',
        });
      }

      return response.status(status).json({
        success: false,
        message: typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? exceptionResponse.message
          : exceptionResponse,
        error: typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse },
      });
    }

    // Handle TypeORM errors
    if (exception instanceof Error && exception.name === 'QueryFailedError') {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Database operation failed',
        error: {
          code: 'DATABASE_ERROR',
          details: exception.message,
        },
      });
    }

    // Handle validation errors
    if (exception instanceof Error && exception.name === 'ValidationError') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: exception.message,
        },
      });
    }

    // Handle unknown errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        details: exception instanceof Error ? exception.message : 'Unknown error occurred',
      },
    });
  }
}

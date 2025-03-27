import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { HotelBookingException } from '../exceptions/hotel-booking.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Handle known exceptions
    if (exception instanceof HotelBookingException) {
      return response.status(exception.getStatus()).json(exception.getResponse());
    }

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      return response.status(status).json({
        ...(typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse }),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Handle TypeORM errors
    if (exception instanceof Error && exception.name === 'QueryFailedError') {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed',
        error: {
          code: 'DATABASE_ERROR',
          details: exception.message,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Handle validation errors
    if (exception instanceof Error && exception.name === 'ValidationError') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: exception.message,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Handle unknown errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        details: exception instanceof Error ? exception.message : 'Unknown error occurred',
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
} 
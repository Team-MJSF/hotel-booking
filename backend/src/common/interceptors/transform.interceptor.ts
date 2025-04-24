import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // If the response is already formatted as a Response object, return it as is
        if (data && typeof data === 'object' && ('success' in data)) {
          return data;
        }
        
        // Format the response
        return {
          success: true,
          data,
          message: 'Operation successful'
        };
      }),
    );
  }
} 
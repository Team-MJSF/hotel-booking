import { TransformInterceptor, Response } from './transform.interceptor';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler<unknown>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    mockExecutionContext = {} as ExecutionContext;
  });

  it('should format regular response data', async () => {
    // Arrange
    const responseData = { id: 1, name: 'Test' };
    mockCallHandler = {
      handle: jest.fn(() => of(responseData)),
    } as unknown as CallHandler<unknown>;

    // Act
    const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);
    const result = await firstValueFrom(result$);

    // Assert
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: responseData,
      message: 'Operation successful',
    });
  });

  it('should keep already formatted responses intact', async () => {
    // Arrange
    const preformattedResponse: Response<unknown> = {
      success: false,
      error: 'Some error',
      message: 'Custom message'
    };
    mockCallHandler = {
      handle: jest.fn(() => of(preformattedResponse)),
    } as unknown as CallHandler<unknown>;

    // Act
    const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);
    const result = await firstValueFrom(result$);

    // Assert
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(result).toEqual(preformattedResponse);
  });
}); 
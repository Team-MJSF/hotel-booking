import { TransformInterceptor } from './transform.interceptor';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockExecutionContext: any;
  let mockCallHandler: any;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    mockExecutionContext = {} as any;
  });

  it('should format regular response data', async () => {
    // Arrange
    const responseData = { id: 1, name: 'Test' };
    mockCallHandler = {
      handle: jest.fn(() => of(responseData)),
    };

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
    const preformattedResponse = {
      success: false,
      error: 'Some error',
      message: 'Custom message'
    };
    mockCallHandler = {
      handle: jest.fn(() => of(preformattedResponse)),
    };

    // Act
    const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);
    const result = await firstValueFrom(result$);

    // Assert
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(result).toEqual(preformattedResponse);
  });
}); 
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockAuthGuard: jest.Mocked<IAuthGuard>;

  beforeEach(() => {
    // Create a mock AuthGuard instance
    mockAuthGuard = {
      canActivate: jest.fn(),
    } as unknown as jest.Mocked<IAuthGuard>;

    // Create the JwtAuthGuard and set up the mock
    guard = new JwtAuthGuard();
    Object.setPrototypeOf(guard, mockAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should call parent canActivate method', () => {
    // Create a mock execution context
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    // Set up the mock to return true
    mockAuthGuard.canActivate.mockReturnValue(true);

    // Call canActivate
    const result = guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBe(true);
    expect(mockAuthGuard.canActivate).toHaveBeenCalledWith(mockContext);
  });

  it('should handle parent canActivate returning false', () => {
    // Create a mock execution context
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    // Set up the mock to return false
    mockAuthGuard.canActivate.mockReturnValue(false);

    // Call canActivate
    const result = guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBe(false);
    expect(mockAuthGuard.canActivate).toHaveBeenCalledWith(mockContext);
  });

  it('should handle parent canActivate throwing an error', () => {
    // Create a mock execution context
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    // Set up the mock to throw an error
    mockAuthGuard.canActivate.mockImplementation(() => {
      throw new Error('Authentication failed');
    });

    // Verify that the error is thrown
    expect(() => guard.canActivate(mockContext)).toThrow('Authentication failed');
    expect(mockAuthGuard.canActivate).toHaveBeenCalledWith(mockContext);
  });

  it('should handle parent canActivate returning a promise', async () => {
    // Create a mock execution context
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    // Set up the mock to return a resolved promise
    mockAuthGuard.canActivate.mockResolvedValue(true);

    // Call canActivate
    const result = await guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBe(true);
    expect(mockAuthGuard.canActivate).toHaveBeenCalledWith(mockContext);
  });
}); 
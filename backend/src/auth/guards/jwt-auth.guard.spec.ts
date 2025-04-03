import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { IAuthGuard } from '@nestjs/passport';

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

  it('should handle all authentication scenarios', async () => {
    // Create a mock execution context that will be reused
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    // Test cases for different authentication scenarios
    const testCases = [
      {
        description: 'successful authentication',
        setup: () => mockAuthGuard.canActivate.mockReturnValue(true),
        assertion: async () => {
          const result = guard.canActivate(mockContext);
          expect(result).toBe(true);
          expect(mockAuthGuard.canActivate).toHaveBeenCalledWith(mockContext);
        }
      },
      {
        description: 'failed authentication',
        setup: () => mockAuthGuard.canActivate.mockReturnValue(false),
        assertion: async () => {
          const result = guard.canActivate(mockContext);
          expect(result).toBe(false);
          expect(mockAuthGuard.canActivate).toHaveBeenCalledWith(mockContext);
        }
      },
      {
        description: 'authentication error',
        setup: () => mockAuthGuard.canActivate.mockImplementation(() => {
          throw new Error('Authentication failed');
        }),
        assertion: async () => {
          expect(() => guard.canActivate(mockContext)).toThrow('Authentication failed');
          expect(mockAuthGuard.canActivate).toHaveBeenCalledWith(mockContext);
        }
      },
      {
        description: 'async authentication',
        setup: () => mockAuthGuard.canActivate.mockResolvedValue(true),
        assertion: async () => {
          const result = await guard.canActivate(mockContext);
          expect(result).toBe(true);
          expect(mockAuthGuard.canActivate).toHaveBeenCalledWith(mockContext);
        }
      }
    ];

    // Run all test cases
    for (const { description, setup, assertion } of testCases) {
      // Reset mock for each test case
      mockAuthGuard.canActivate.mockReset();
      
      // Set up the specific test scenario
      setup();
      
      // Run the test
      await assertion();
    }
  });

  // Test guard instantiation without prototype modification
  it('should be properly instantiated', () => {
    const freshGuard = new JwtAuthGuard();
    expect(freshGuard).toBeDefined();
    expect(freshGuard).toBeInstanceOf(JwtAuthGuard);
    expect(freshGuard.canActivate).toBeDefined();
  });
}); 
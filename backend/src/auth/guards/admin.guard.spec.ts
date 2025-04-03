import { AdminGuard } from './admin.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AdminGuard(reflector);
  });

  it('should handle all access control scenarios', () => {
    // Test cases for different user scenarios
    const testCases = [
      {
        description: 'admin user',
        context: {
          switchToHttp: () => ({
            getRequest: () => ({
              user: {
                role: UserRole.ADMIN,
              },
            }),
          }),
        },
        expectedResult: true,
      },
      {
        description: 'regular user',
        context: {
          switchToHttp: () => ({
            getRequest: () => ({
              user: {
                role: UserRole.USER,
              },
            }),
          }),
        },
        expectedResult: false,
      },
      {
        description: 'no user',
        context: {
          switchToHttp: () => ({
            getRequest: () => ({}),
          }),
        },
        expectedResult: false,
      },
      {
        description: 'null user',
        context: {
          switchToHttp: () => ({
            getRequest: () => ({
              user: null,
            }),
          }),
        },
        expectedResult: false,
      },
      {
        description: 'undefined user',
        context: {
          switchToHttp: () => ({
            getRequest: () => ({
              user: undefined,
            }),
          }),
        },
        expectedResult: false,
      },
      {
        description: 'user without role',
        context: {
          switchToHttp: () => ({
            getRequest: () => ({
              user: {},
            }),
          }),
        },
        expectedResult: false,
      },
    ];

    // Run all test cases
    testCases.forEach(({ description, context, expectedResult }) => {
      const result = guard.canActivate(context as unknown as ExecutionContext);
      
      // For admin users, expect true
      if (expectedResult) {
        expect(result).toBe(true);
      } 
      // For non-admin users, expect false (not true)
      else {
        expect(result).not.toBe(true);
      }
    });
  });
}); 
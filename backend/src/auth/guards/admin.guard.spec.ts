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

  it('should allow access for admin users', () => {
    // Create a mock execution context with an admin user
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: UserRole.ADMIN,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    // Test the guard
    const result = guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBe(true);
  });

  it('should deny access for non-admin users', () => {
    // Create a mock execution context with a regular user
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: UserRole.USER,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    // Test the guard
    const result = guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBe(false);
  });

  it('should return undefined when no user is present', () => {
    // Create a mock execution context with no user
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    // Test the guard
    const result = guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBeUndefined();
  });

  it('should return null when user is null', () => {
    // Create a mock execution context with null user
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    // Test the guard
    const result = guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBeNull();
  });

  it('should return undefined when user is undefined', () => {
    // Create a mock execution context with undefined user
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: undefined,
        }),
      }),
    } as unknown as ExecutionContext;

    // Test the guard
    const result = guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBeUndefined();
  });

  it('should deny access when user role is undefined', () => {
    // Create a mock execution context with user but no role
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {},
        }),
      }),
    } as unknown as ExecutionContext;

    // Test the guard
    const result = guard.canActivate(mockContext);

    // Verify the result
    expect(result).toBe(false);
  });
}); 
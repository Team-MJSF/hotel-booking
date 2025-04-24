import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let mockAuthService: jest.Mocked<AuthService>;

  // Create a mock user without password for the expected return value
  const mockUserWithoutPassword = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: UserRole.USER,
    bookings: [],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenVersion: 0,
    isActive: true,
  };

  beforeEach(async () => {
    // Create a mock for the AuthService
    mockAuthService = {
      validateUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    // Create the testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    // Get the strategy instance
    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  describe('validate', () => {
    it('should handle all credential validation scenarios', async () => {
      // Scenario 1: Valid credentials return user
      mockAuthService.validateUser.mockResolvedValueOnce(mockUserWithoutPassword);
      const result = await strategy.validate('john@example.com', 'password123');
      expect(result).toEqual(mockUserWithoutPassword);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('john@example.com', 'password123');

      // Scenario 2: Invalid credentials throw UnauthorizedException
      mockAuthService.validateUser.mockResolvedValueOnce(null);
      await expect(
        strategy.validate('john@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('john@example.com', 'wrongpassword');
      
      // Scenario 3: Verify correct error message for invalid credentials
      mockAuthService.validateUser.mockResolvedValueOnce(null);
      try {
        await strategy.validate('john@example.com', 'wrongpassword');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid credentials');
      }
      
      // Scenario 4: Handle database errors from AuthService
      mockAuthService.validateUser.mockRejectedValueOnce(new Error('Database error'));
      await expect(
        strategy.validate('john@example.com', 'password123')
      ).rejects.toThrow(Error);
    });
  });
}); 
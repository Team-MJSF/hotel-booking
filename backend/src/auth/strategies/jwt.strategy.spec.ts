import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '../../users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUsersService: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    role: UserRole.USER,
    bookings: [],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenVersion: 0,
    isActive: true
  };

  const mockPayload: JwtPayload = {
    email: 'john@example.com',
    sub: 1,
    role: UserRole.USER,
    tokenVersion: 0
  };

  beforeEach(async () => {
    mockUsersService = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validation', () => {
    it('should handle all JWT validation scenarios', async () => {
      // Test strategy is defined
      expect(strategy).toBeDefined();

      // Test successful validation
      mockUsersService.findOne.mockResolvedValueOnce(mockUser);
      const result = await strategy.validate(mockPayload);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockPayload.sub);

      // Test user not found
      mockUsersService.findOne.mockResolvedValueOnce(null);
      await expect(strategy.validate(mockPayload))
        .rejects
        .toThrow(UnauthorizedException);

      // Test role mismatch
      const userWithDifferentRole = { ...mockUser, role: UserRole.ADMIN };
      mockUsersService.findOne.mockResolvedValueOnce(userWithDifferentRole);
      await expect(strategy.validate(mockPayload))
        .rejects
        .toThrow(new UnauthorizedException('User role mismatch'));

      // Test token version mismatch
      const userWithDifferentTokenVersion = { ...mockUser, tokenVersion: 1 };
      mockUsersService.findOne.mockResolvedValueOnce(userWithDifferentTokenVersion);
      await expect(strategy.validate(mockPayload))
        .rejects
        .toThrow(new UnauthorizedException('Token version mismatch'));
    });
  });
}); 
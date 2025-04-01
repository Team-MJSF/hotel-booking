import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
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

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockPayload = {
      email: 'test@example.com',
      sub: 1,
      role: UserRole.USER,
    };

    it('should return user when token is valid and user exists', async () => {
      // Set up the mock to return a user
      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Call validate
      const result = await strategy.validate(mockPayload);

      // Verify the result
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Set up the mock to return null (user not found)
      mockUsersService.findOne.mockResolvedValue(null);

      // Verify that the error is thrown
      await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
    });

    it('should throw UnauthorizedException when user service throws error', async () => {
      // Set up the mock to throw an error
      mockUsersService.findOne.mockRejectedValue(new UnauthorizedException('Database error'));

      // Verify that the error is thrown
      await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
    });

    it('should throw UnauthorizedException when role mismatch', async () => {
      // Set up the mock to return a user with different role
      const adminUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        role: UserRole.ADMIN,
        bookings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsersService.findOne.mockResolvedValue(adminUser);

      // Verify that the error is thrown
      await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
    });
  });
}); 
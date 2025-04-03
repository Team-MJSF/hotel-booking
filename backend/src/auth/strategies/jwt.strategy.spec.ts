import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUsersService: jest.Mocked<UsersService>;

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

  const mockPayload = {
    email: 'test@example.com',
    sub: 1,
    role: UserRole.USER,
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

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should handle all JWT validation scenarios', async () => {
    const testCases = [
      {
        description: 'valid token and user exists',
        setup: () => mockUsersService.findOne.mockResolvedValue(mockUser),
        expectedResult: mockUser,
        shouldThrow: false,
      },
      {
        description: 'user not found',
        setup: () => mockUsersService.findOne.mockResolvedValue(null),
        expectedResult: null,
        shouldThrow: true,
        expectedError: UnauthorizedException,
      },
      {
        description: 'user service throws error',
        setup: () => mockUsersService.findOne.mockRejectedValue(new UnauthorizedException('Database error')),
        expectedResult: null,
        shouldThrow: true,
        expectedError: UnauthorizedException,
      },
      {
        description: 'role mismatch',
        setup: () => mockUsersService.findOne.mockResolvedValue({
          ...mockUser,
          role: UserRole.ADMIN,
        }),
        expectedResult: null,
        shouldThrow: true,
        expectedError: UnauthorizedException,
      },
    ];

    for (const { description, setup, expectedResult, shouldThrow, expectedError } of testCases) {
      // Reset mock before each test case
      mockUsersService.findOne.mockReset();
      
      // Set up the specific test scenario
      setup();

      if (shouldThrow) {
        await expect(strategy.validate(mockPayload)).rejects.toThrow(expectedError);
      } else {
        const result = await strategy.validate(mockPayload);
        expect(result).toEqual(expectedResult);
      }

      // Verify the service was called with correct parameters
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockPayload.sub);
    }
  });
}); 
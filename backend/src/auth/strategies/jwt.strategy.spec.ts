import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockConfigService: Partial<jest.Mocked<ConfigService>>;
  let mockUsersService: Partial<jest.Mocked<UsersService>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed_password123',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Test St',
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret-key'),
    };

    mockUsersService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should initialize with correct JWT options', () => {
    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET', 'your-secret-key');
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockPayload = {
      email: 'test@example.com',
      sub: 1,
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
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from '../refresh-tokens/refresh-token.service';
import { LoginResponseDto } from '../refresh-tokens/dto/login-response.dto';
import { RefreshTokenResponseDto } from '../refresh-tokens/dto/refresh-token-response.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation((password, hash) => Promise.resolve(password === hash.replace('hashed_', '')))
}));

// Increase timeout for all tests
jest.setTimeout(10000);

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: Partial<jest.Mocked<UsersService>>;
  let mockJwtService: Partial<jest.Mocked<JwtService>>;
  let mockRefreshTokenService: Partial<jest.Mocked<RefreshTokenService>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed_password123',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Main St',
    bookings: [],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenVersion: 0,
    isActive: true
  };

  const mockRefreshToken = {
    token: 'refresh_token_123',
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    user: mockUser
  };

  beforeEach(async () => {
    mockUsersService = {
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      validatePassword: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('test_token'),
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };

    mockRefreshTokenService = {
      generateRefreshToken: jest.fn().mockResolvedValue(mockRefreshToken),
      findToken: jest.fn().mockResolvedValue(mockRefreshToken),
      revokeToken: jest.fn().mockResolvedValue(undefined),
      revokeAllUserTokens: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authentication flow', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should handle all authentication scenarios', async () => {
      // 1. Test successful user registration
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      
      const registerResult = await service.register(registerDto);
      expect(registerResult).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: UserRole.USER
      }));
      expect(registerResult).not.toHaveProperty('password');
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);

      // 2. Test registration failures
      const invalidRegisterDto = { ...registerDto, confirmPassword: 'different' };
      await expect(service.register(invalidRegisterDto))
        .rejects
        .toThrow(UnauthorizedException);
      
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      await expect(service.register(registerDto))
        .rejects
        .toThrow(ConflictException);

      // 3. Test successful user validation
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockUsersService.validatePassword.mockResolvedValueOnce(true);
      
      const validatedUser = await service.validateUser(loginDto.email, loginDto.password);
      expect(validatedUser).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role
      }));
      expect(validatedUser).not.toHaveProperty('password');

      // 4. Test validation failures
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      expect(await service.validateUser(loginDto.email, loginDto.password))
        .toBeNull();
      
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockUsersService.validatePassword.mockResolvedValueOnce(false);
      expect(await service.validateUser(loginDto.email, 'wrong_password'))
        .toBeNull();

      // 5. Test successful login
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockUsersService.validatePassword.mockResolvedValueOnce(true);
      mockJwtService.sign.mockReturnValueOnce('mock_access_token');
      const mockRefreshToken = {
        id: 1,
        token: 'mock_refresh_token',
        user: mockUser,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockRefreshTokenService.generateRefreshToken.mockResolvedValueOnce(mockRefreshToken);

      const loginResult = await service.login(loginDto);
      expect(loginResult).toEqual({
        access_token: 'mock_access_token',
        refresh_token: mockRefreshToken.token
      });
      expect(mockRefreshTokenService.generateRefreshToken).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      }));

      // 6. Test login failure
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockUsersService.validatePassword.mockResolvedValueOnce(false);
      await expect(service.login(loginDto))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should handle refresh token scenarios', async () => {
      // Test successful token refresh
      mockRefreshTokenService.findToken.mockResolvedValueOnce({
        ...mockRefreshToken,
        id: 1,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock the user update
      const updatedMockUser = {
        ...mockUser,
        tokenVersion: mockUser.tokenVersion + 1
      };
      mockUsersService.update.mockResolvedValueOnce(updatedMockUser);
      
      const refreshResult = await service.refreshAccessToken(mockRefreshToken.token);
      expect(refreshResult).toEqual({
        access_token: 'test_token',
        refresh_token: mockRefreshToken.token
      });
      expect(mockRefreshTokenService.findToken).toHaveBeenCalledWith(mockRefreshToken.token);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: updatedMockUser.id,
        email: updatedMockUser.email,
        role: updatedMockUser.role,
        tokenVersion: updatedMockUser.tokenVersion,
        iat: expect.any(Number)
      });

      // Test token refresh failure
      mockRefreshTokenService.findToken.mockRejectedValueOnce(new UnauthorizedException('Invalid refresh token'));
      await expect(service.refreshAccessToken('invalid_token')).rejects.toThrow(UnauthorizedException);

      // Test logout
      await service.logout(mockRefreshToken.token);
      expect(mockRefreshTokenService.revokeToken).toHaveBeenCalledWith(mockRefreshToken.token);
    });
  });

  describe('profile management', () => {
    it('should handle profile operations', async () => {
      // Test successful profile retrieval
      mockUsersService.findOne.mockResolvedValue(mockUser);
      
      const profile = await service.getProfile(mockUser.id);
      expect(profile).toEqual({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
        phoneNumber: mockUser.phoneNumber,
        address: mockUser.address,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt
      });
      
      // Test profile not found
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(service.getProfile(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('security measures', () => {
    it('should enforce security constraints', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      // Test password hashing
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockImplementation(async (user) => ({
        ...user,
        id: 1,
        role: UserRole.USER,
        bookings: [],
        refreshTokens: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenVersion: 0,
        isActive: true
      }));

      await service.register(registerDto);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.stringContaining('hashed_'),
          role: UserRole.USER
        })
      );

      // Test JWT payload structure
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123'
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      await service.login(loginDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tokenVersion: mockUser.tokenVersion
      });
    });
  });
}); 
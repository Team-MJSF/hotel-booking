import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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
      // Test validateUser success
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      
      const validatedUser = await service.validateUser(loginDto.email, loginDto.password);
      expect(validatedUser).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role
      }));
      expect(validatedUser).not.toHaveProperty('password');
      
      // Test login success
      const loginResult = await service.login(loginDto);
      expect(loginResult).toEqual({ access_token: 'test_token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ 
        sub: mockUser.id, 
        email: mockUser.email,
        role: mockUser.role 
      });
      
      // Test register success
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

      // Test validateUser failures
      mockUsersService.findByEmail.mockResolvedValue(null);
      expect(await service.validateUser(loginDto.email, loginDto.password)).toBeNull();
      
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);
      expect(await service.validateUser(loginDto.email, 'wrong_password')).toBeNull();
      
      // Test login failure
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      
      // Test register failures
      const invalidRegisterDto = { ...registerDto, confirmPassword: 'different' };
      await expect(service.register(invalidRegisterDto)).rejects.toThrow(UnauthorizedException);
      
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
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
        createdAt: new Date(),
        updatedAt: new Date()
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
        role: mockUser.role
      });
    });
  });
}); 
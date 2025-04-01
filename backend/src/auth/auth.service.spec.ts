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

  describe('validateUser', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should return user without password when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(loginDto.email, loginDto.password);

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        phoneNumber: mockUser.phoneNumber,
        address: mockUser.address
      }));
      expect(result).not.toHaveProperty('password');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(mockUser, loginDto.password);
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(loginDto.email, loginDto.password);

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUsersService.validatePassword).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(loginDto.email, 'wrong_password');

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(mockUser, 'wrong_password');
    });
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        bookings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedResult = { access_token: 'test_token' };

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('test_token');

      const result = await service.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ 
        sub: mockUser.id, 
        email: mockUser.email,
        role: mockUser.role 
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce(null);

      await expect(service.login({ email: 'test@example.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
      expect(service.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should create a new user and return without password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: UserRole.USER
      }));
      expect(result).not.toHaveProperty('password');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockUsersService.create).toHaveBeenCalledWith(expect.objectContaining({
        ...registerDto,
        password: expect.any(String),
        role: UserRole.USER
      }));
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should throw UnauthorizedException when passwords do not match', async () => {
      const invalidDto = { ...registerDto, confirmPassword: 'different' };

      await expect(service.register(invalidDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result).toEqual({
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
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.getProfile(1)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });
  });
}); 
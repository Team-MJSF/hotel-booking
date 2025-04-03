import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { UserRole } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should handle register operations correctly', async () => {
      const testCases = [
        {
          description: 'register a new user',
          registerDto: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          },
          mockResult: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          mockError: null,
          expectedError: null,
          assertions: (result: any) => {
            expect(result).toEqual({ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
            expect(authService.register).toHaveBeenCalledWith({
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              password: 'password123',
              confirmPassword: 'password123',
            });
          }
        },
        {
          description: 'throw UnauthorizedException when passwords do not match',
          registerDto: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'different',
          },
          mockResult: null,
          mockError: new UnauthorizedException('Passwords do not match'),
          expectedError: UnauthorizedException,
          assertions: () => {
            expect(authService.register).toHaveBeenCalledWith({
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              password: 'password123',
              confirmPassword: 'different',
            });
          }
        }
      ];

      for (const { 
        description, 
        registerDto, 
        mockResult, 
        mockError, 
        expectedError, 
        assertions 
      } of testCases) {
        if (mockError) {
          mockAuthService.register.mockRejectedValue(mockError);
        } else {
          mockAuthService.register.mockResolvedValue(mockResult);
        }

        if (expectedError) {
          await expect(controller.register(registerDto)).rejects.toThrow(expectedError);
        } else {
          const result = await controller.register(registerDto);
          expect(result).toEqual(mockResult);
        }
        
        assertions(mockResult);
      }
    });
  });

  describe('login', () => {
    it('should handle login operations correctly', async () => {
      const testCases = [
        {
          description: 'login a user and return access token',
          loginDto: {
            email: 'test@example.com',
            password: 'password123',
          },
          mockResult: { access_token: 'jwt-token' },
          mockError: null,
          expectedError: null,
          assertions: (result: any) => {
            expect(result).toEqual({ access_token: 'jwt-token' });
            expect(authService.login).toHaveBeenCalledWith({
              email: 'test@example.com',
              password: 'password123',
            });
          }
        },
        {
          description: 'throw UnauthorizedException for invalid credentials',
          loginDto: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
          mockResult: null,
          mockError: new UnauthorizedException('Invalid credentials'),
          expectedError: UnauthorizedException,
          assertions: () => {
            expect(authService.login).toHaveBeenCalledWith({
              email: 'test@example.com',
              password: 'wrongpassword',
            });
          }
        }
      ];

      for (const { 
        description, 
        loginDto, 
        mockResult, 
        mockError, 
        expectedError, 
        assertions 
      } of testCases) {
        if (mockError) {
          mockAuthService.login.mockRejectedValue(mockError);
        } else {
          mockAuthService.login.mockResolvedValue(mockResult);
        }

        if (expectedError) {
          await expect(controller.login(loginDto)).rejects.toThrow(expectedError);
        } else {
          const result = await controller.login(loginDto);
          expect(result).toEqual(mockResult);
        }
        
        assertions(mockResult);
      }
    });
  });

  describe('getProfile', () => {
    it('should handle getProfile operations correctly', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: UserRole.USER,
        password: 'hashedPassword',
        bookings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedProfile: ProfileDto = {
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      const testCases = [
        {
          description: 'return the current user profile',
          user: mockUser,
          mockResult: expectedProfile,
          mockError: null,
          expectedError: null,
          assertions: (result: any) => {
            expect(result).toEqual(expectedProfile);
            expect(authService.getProfile).toHaveBeenCalledWith(mockUser.id);
          }
        }
      ];

      for (const { 
        description, 
        user, 
        mockResult, 
        mockError, 
        expectedError, 
        assertions 
      } of testCases) {
        if (mockError) {
          mockAuthService.getProfile.mockRejectedValue(mockError);
        } else {
          mockAuthService.getProfile.mockResolvedValue(mockResult);
        }

        if (expectedError) {
          await expect(controller.getProfile(user)).rejects.toThrow(expectedError);
        } else {
          const result = await controller.getProfile(user);
          expect(result).toEqual(mockResult);
        }
        
        assertions(mockResult);
      }
    });
  });
}); 
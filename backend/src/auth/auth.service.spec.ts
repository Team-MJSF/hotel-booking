import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from '../refresh-tokens/refresh-token.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation(password => Promise.resolve(`hashed_${password}`)),
  compare: jest
    .fn()
    .mockImplementation((password, hash) =>
      Promise.resolve(password === hash.replace('hashed_', '')),
    ),
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
    isActive: true,
  };

  const mockAdminUser: User = {
    ...mockUser,
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockRefreshToken = {
    token: 'refresh_token_123',
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    user: mockUser,
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
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authentication flow', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    describe('registration functionality', () => {
      it('should handle user registration scenarios', async () => {
        // Successful registration
        mockUsersService.findByEmail.mockResolvedValueOnce(null);
        mockUsersService.create.mockResolvedValue(mockUser);
  
        const registerResult = await service.register(registerDto);
        expect(registerResult).toEqual(
          expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            role: UserRole.USER,
          }),
        );
        expect(registerResult).not.toHaveProperty('password');
        expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
        
        // Password mismatch error
        const invalidRegisterDto = { ...registerDto, confirmPassword: 'different' };
        await expect(service.register(invalidRegisterDto)).rejects.toThrow(UnauthorizedException);
        
        // Email already exists error
        mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
        await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      });
    });

    describe('user validation and login', () => {
      it('should handle all user authentication scenarios', async () => {
        // --- USER VALIDATION ---
        // 1. Successful validation
        mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
        mockUsersService.validatePassword.mockResolvedValueOnce(true);
  
        const validatedUser = await service.validateUser(loginDto.email, loginDto.password);
        expect(validatedUser).toEqual(
          expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            role: mockUser.role,
          }),
        );
        expect(validatedUser).not.toHaveProperty('password');
        
        // 2. User not found
        mockUsersService.findByEmail.mockResolvedValueOnce(null);
        expect(await service.validateUser(loginDto.email, loginDto.password)).toBeNull();
        
        // 3. Incorrect password
        mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
        mockUsersService.validatePassword.mockResolvedValueOnce(false);
        expect(await service.validateUser(loginDto.email, 'wrong_password')).toBeNull();
        
        // 4. Validation error
        mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
        mockUsersService.validatePassword.mockRejectedValueOnce(new Error('Validation error'));
        expect(await service.validateUser(loginDto.email, loginDto.password)).toBeNull();

        // --- LOGIN FUNCTIONALITY ---
        // 5. Successful login
        jest.spyOn(service, 'validateUser').mockResolvedValueOnce(mockUser);
        mockJwtService.sign.mockReturnValueOnce('mock_access_token');
        const mockRefreshToken = {
          id: 1,
          token: 'mock_refresh_token',
          user: mockUser,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockRefreshTokenService.generateRefreshToken.mockResolvedValueOnce(mockRefreshToken);
  
        const loginResult = await service.login(loginDto);
        expect(loginResult).toEqual({
          access_token: 'mock_access_token',
          refresh_token: mockRefreshToken.token,
        });
        expect(mockRefreshTokenService.generateRefreshToken).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          }),
        );
        
        // 6. Login failure
        jest.spyOn(service, 'validateUser').mockResolvedValueOnce(null);
        await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);

        // --- ADMIN LOGIN IN TEST ENVIRONMENT ---
        // 7. Admin login in test environment
        // Store the original NODE_ENV
        const originalNodeEnv = process.env.NODE_ENV;
        // Set NODE_ENV to 'test' for this test case
        process.env.NODE_ENV = 'test';
  
        try {
          // Mock finding an admin user
          mockUsersService.findByEmail.mockResolvedValueOnce(mockAdminUser);
          
          // Mock JWT and refresh token services
          mockJwtService.sign.mockReturnValueOnce('test_admin_token');
          mockRefreshTokenService.generateRefreshToken.mockResolvedValueOnce({
            token: 'admin_refresh_token',
            user: mockAdminUser,
            expiresAt: new Date(),
            isActive: true,
            id: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
  
          const adminLoginDto = {
            email: 'admin@example.com',
            password: 'password123',
          };
  
          const result = await service.login(adminLoginDto);
          
          expect(result).toEqual({
            access_token: 'test_admin_token',
            refresh_token: 'admin_refresh_token',
          });
          
          // Verify the token was generated with admin role
          expect(mockJwtService.sign).toHaveBeenCalledWith(
            expect.objectContaining({
              email: mockAdminUser.email,
              sub: mockAdminUser.id,
              role: UserRole.ADMIN,
            }),
          );
        } finally {
          // Restore the original NODE_ENV
          process.env.NODE_ENV = originalNodeEnv;
        }
      });
    });

    describe('token management', () => {
      it('should handle refresh token and logout scenarios', async () => {
        // Successful token refresh
        mockRefreshTokenService.findToken.mockResolvedValueOnce({
          ...mockRefreshToken,
          id: 1,
          user: mockUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
  
        // Mock the user update
        const updatedMockUser = {
          ...mockUser,
          tokenVersion: mockUser.tokenVersion + 1,
        };
        mockUsersService.update.mockResolvedValueOnce(updatedMockUser);
  
        const refreshResult = await service.refreshAccessToken(mockRefreshToken.token);
        expect(refreshResult).toEqual({
          access_token: 'test_token',
          refresh_token: mockRefreshToken.token,
        });
        expect(mockRefreshTokenService.findToken).toHaveBeenCalledWith(mockRefreshToken.token);
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          sub: updatedMockUser.id,
          email: updatedMockUser.email,
          role: updatedMockUser.role,
          tokenVersion: updatedMockUser.tokenVersion,
          iat: expect.any(Number),
        });
  
        // Token refresh failure
        mockRefreshTokenService.findToken.mockRejectedValueOnce(
          new UnauthorizedException('Invalid refresh token'),
        );
        await expect(service.refreshAccessToken('invalid_token')).rejects.toThrow(
          UnauthorizedException,
        );
        
        // Successful logout
        const refreshToken = 'refresh_token_123';
        await service.logout(refreshToken);
        expect(mockRefreshTokenService.revokeToken).toHaveBeenCalledWith(refreshToken);
        
        // Logout error handling
        mockRefreshTokenService.revokeToken.mockRejectedValueOnce(new Error('Token revocation failed'));
        await expect(service.logout(refreshToken)).rejects.toThrow('Token revocation failed');
      });
    });
  });

  describe('admin management', () => {
    it('should handle all admin creation scenarios', async () => {
      const createAdminDto: CreateAdminDto = {
        email: 'admin@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Admin',
        lastName: 'User',
      };
      
      // Scenario 1: Successful admin creation
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockUsersService.create.mockResolvedValue({
        ...mockUser,
        role: UserRole.ADMIN,
        email: createAdminDto.email,
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
      });

      const result = await service.createAdmin(createAdminDto);
      
      // Verify successful creation
      expect(result).toEqual(
        expect.objectContaining({
          email: createAdminDto.email,
          firstName: createAdminDto.firstName,
          lastName: createAdminDto.lastName,
          role: UserRole.ADMIN,
        }),
      );
      expect(result).not.toHaveProperty('password');
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createAdminDto.email,
          password: expect.any(String),
          role: UserRole.ADMIN,
        }),
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createAdminDto.password, 10);
      
      // Scenario 2: Password mismatch throws UnauthorizedException
      const invalidAdminDto = { ...createAdminDto, confirmPassword: 'different' };
      await expect(service.createAdmin(invalidAdminDto)).rejects.toThrow(UnauthorizedException);
      
      // Scenario 3: Email already exists throws ConflictException
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      await expect(service.createAdmin(createAdminDto)).rejects.toThrow(ConflictException);
      
      // Scenario 4: Database error is propagated
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockUsersService.create.mockRejectedValueOnce(new Error('Database error'));
      await expect(service.createAdmin(createAdminDto)).rejects.toThrow('Database error');
    });
  });

  describe('user profile management', () => {
    it('should handle profile retrieval and updates', async () => {
      // Get profile success
      mockUsersService.findOne.mockResolvedValueOnce(mockUser);
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
        updatedAt: mockUser.updatedAt,
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
      
      // Profile not found
      mockUsersService.findOne.mockResolvedValueOnce(null);
      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
      
      // Update with multiple fields
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '9876543210',
        address: '456 New St',
        email: 'should-not-update@example.com', // Should be ignored
        role: UserRole.ADMIN, // Should be ignored
      };
      
      const expectedUpdates = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '9876543210',
        address: '456 New St',
      };
      
      const updatedUser = {
        ...mockUser,
        ...expectedUpdates,
      };
      
      mockUsersService.update.mockResolvedValueOnce(updatedUser);
      
      const result = await service.updateUser(mockUser.id, updateUserDto);
      
      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(mockUser.id, expectedUpdates);
      
      // Verify that email and role were filtered out
      expect(mockUsersService.update).not.toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          email: updateUserDto.email,
          role: updateUserDto.role,
        }),
      );
      
      // Update with single field
      const singleFieldUpdate: UpdateUserDto = {
        firstName: 'Updated',
      };
      
      const singleFieldUpdatedUser = {
        ...mockUser,
        firstName: 'Updated',
      };
      
      mockUsersService.update.mockResolvedValueOnce(singleFieldUpdatedUser);
      
      const singleFieldResult = await service.updateUser(mockUser.id, singleFieldUpdate);
      
      expect(singleFieldResult).toEqual(singleFieldUpdatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(mockUser.id, { firstName: 'Updated' });
      
      // Update error
      mockUsersService.update.mockRejectedValueOnce(new Error('Update failed'));
      await expect(service.updateUser(mockUser.id, { firstName: 'Updated' })).rejects.toThrow('Update failed');
    });
  });

  describe('password reset mock methods', () => {
    it('should handle all password reset mock scenarios', async () => {
      // For existing user
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      await service.mockRequestPasswordReset(mockUser.email);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      
      // For non-existing user
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      await service.mockRequestPasswordReset('nonexistent@example.com');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      
      // Reset password
      await service.mockResetPassword('mock-token', 'newpassword');
      // Just verify it doesn't throw any errors
      expect(true).toBeTruthy();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserRole, User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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
    isActive: true,
    phoneNumber: '1234567890',
    address: '123 Test St',
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    createAdmin: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    mockRequestPasswordReset: jest.fn(),
    mockResetPassword: jest.fn(),
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

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('user registration and admin creation', () => {
    it('should handle all registration operations correctly', async () => {
      // --- REGULAR USER REGISTRATION ---
      // Scenario 1: Successful user registration
      const registerDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
      
      const registerResult = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com' 
      };
      
      mockAuthService.register.mockResolvedValue(registerResult);
      
      const result = await controller.register(registerDto);
      
      expect(result).toEqual(registerResult);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      
      // Scenario 2: Registration with mismatched passwords
      const invalidRegisterDto = {
        ...registerDto,
        confirmPassword: 'different',
      };
      
      mockAuthService.register.mockRejectedValue(new UnauthorizedException('Passwords do not match'));
      
      await expect(controller.register(invalidRegisterDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.register).toHaveBeenCalledWith(invalidRegisterDto);
      
      // --- ADMIN USER CREATION ---
      // Scenario 3: Successful admin creation
      const createAdminDto = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
      
      const adminResult = {
        id: 2,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };
      
      mockAuthService.createAdmin.mockResolvedValue(adminResult);
      
      const adminCreationResult = await controller.createAdmin(createAdminDto);
      
      expect(adminCreationResult).toEqual(adminResult);
      expect(authService.createAdmin).toHaveBeenCalledWith(createAdminDto);
      
      // Scenario 4: Admin creation with existing email
      mockAuthService.createAdmin.mockRejectedValue(new ConflictException('Email already exists'));
      
      await expect(controller.createAdmin(createAdminDto)).rejects.toThrow(ConflictException);
      expect(authService.createAdmin).toHaveBeenCalledWith(createAdminDto);
    });
  });

  describe('authentication and token management', () => {
    it('should handle all authentication scenarios correctly', async () => {
      // --- LOGIN ---
      // Scenario 1: Successful login
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      
      const loginResult = { 
        access_token: 'jwt-token', 
        refresh_token: 'refresh-token' 
      };
      
      mockAuthService.login.mockResolvedValue(loginResult);
      
      const result = await controller.login(loginDto);
      
      expect(result).toEqual(loginResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      
      // Scenario 2: Login with invalid credentials
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));
      
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      
      // --- TOKEN REFRESH ---
      // Scenario 3: Successful token refresh
      const refreshTokenDto = { refresh_token: 'valid-refresh-token' };
      
      const refreshResult = { 
        access_token: 'new-jwt-token', 
        refresh_token: 'new-refresh-token' 
      };
      
      mockAuthService.refreshAccessToken.mockResolvedValue(refreshResult);
      
      const refreshTokenResult = await controller.refreshToken(refreshTokenDto);
      
      expect(refreshTokenResult).toEqual(refreshResult);
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(refreshTokenDto.refresh_token);
      
      // Scenario 4: Invalid refresh token
      mockAuthService.refreshAccessToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token')
      );
      
      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(refreshTokenDto.refresh_token);
      
      // --- LOGOUT ---
      // Scenario 5: Successful logout
      mockAuthService.logout.mockResolvedValue(undefined);
      
      await controller.logout(refreshTokenDto);
      
      expect(authService.logout).toHaveBeenCalledWith(refreshTokenDto.refresh_token);
    });
  });

  describe('user profile management', () => {
    it('should handle all profile operations correctly', async () => {
      // --- GET PROFILE ---
      // Scenario 1: Get user profile
      const profileResult = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: UserRole.USER,
        phoneNumber: '1234567890',
        address: '123 Test St',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockAuthService.getProfile.mockResolvedValue(profileResult);
      
      const result = await controller.getProfile(mockUser);
      
      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: UserRole.USER,
        phoneNumber: '1234567890',
        address: '123 Test St',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(authService.getProfile).toHaveBeenCalledWith(1);
      
      // --- UPDATE PROFILE ---
      // Scenario 2: Update user profile
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        phoneNumber: '9876543210',
        address: '456 New St',
      };
      
      const updatedProfile = {
        id: 1,
        firstName: 'Updated',
        lastName: 'User',
        email: 'john@example.com',
        role: UserRole.USER,
        phoneNumber: '9876543210',
        address: '456 New St',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockAuthService.updateUser.mockResolvedValue({...updatedProfile});
      mockAuthService.getProfile.mockResolvedValue({...updatedProfile});
      
      const updateResult = await controller.updateProfile(mockUser, updateUserDto);
      
      expect(updateResult).toEqual({
        id: 1,
        firstName: 'Updated',
        lastName: 'User',
        email: 'john@example.com',
        role: UserRole.USER,
        phoneNumber: '9876543210',
        address: '456 New St',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      
      expect(authService.updateUser).toHaveBeenCalledWith(mockUser.id, updateUserDto);
      expect(authService.getProfile).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('password reset functionality', () => {
    it('should handle all password reset scenarios correctly', async () => {
      // --- REQUEST PASSWORD RESET ---
      // Scenario 1: Request password reset
      const email = 'test@example.com';
      
      mockAuthService.mockRequestPasswordReset.mockResolvedValue(undefined);
      
      await controller.requestPasswordReset(email);
      
      expect(authService.mockRequestPasswordReset).toHaveBeenCalledWith(email);
      
      // --- RESET PASSWORD ---
      // Scenario 2: Reset password successfully
      const resetPasswordData = {
        token: 'valid-reset-token',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };
      
      mockAuthService.mockResetPassword.mockResolvedValue(undefined);
      
      await controller.resetPassword(resetPasswordData);
      
      expect(authService.mockResetPassword).toHaveBeenCalledWith(
        resetPasswordData.token, 
        resetPasswordData.password
      );
      
      // Clear previous mock calls before testing the error scenario
      mockAuthService.mockResetPassword.mockClear();
      
      // Scenario 3: Reset password with mismatched passwords
      const invalidResetData = {
        token: 'valid-reset-token',
        password: 'newPassword123',
        confirmPassword: 'different',
      };
      
      await expect(controller.resetPassword(invalidResetData)).rejects.toThrow(UnauthorizedException);
      expect(authService.mockResetPassword).not.toHaveBeenCalled();
    });
  });
});

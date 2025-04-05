import { Controller, Post, Body, UseGuards, Get, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ProfileDto } from './dto/profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { LoginResponseDto } from '../refresh-tokens/dto/login-response.dto';
import { RefreshTokenRequestDto } from '../refresh-tokens/dto/refresh-token-request.dto';
import { RefreshTokenResponseDto } from '../refresh-tokens/dto/refresh-token-response.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@ApiTags('Authentication')
@ApiExtraModels(
  RegisterDto,
  LoginDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  ProfileDto,
  CreateAdminDto,
)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with the provided information. All user accounts created through this endpoint are assigned the USER role. Admin accounts can only be created by existing administrators.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration details',
    examples: {
      basic: {
        summary: 'Basic user registration',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        },
      },
      withOptional: {
        summary: 'Registration with optional fields',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phoneNumber: '+1234567890',
          address: '123 Main St, City, Country',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      properties: {
        id: { type: 'number', example: 1 },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('create-admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new admin user',
    description:
      'Creates a new admin user account with the provided information. Only accessible by administrators. (Admin only)',
  })
  @ApiBody({
    type: CreateAdminDto,
    description: 'Admin user creation details',
    examples: {
      basic: {
        summary: 'Basic admin creation',
        value: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'StrongPassword123!',
          confirmPassword: 'StrongPassword123!',
        },
      },
      withOptional: {
        summary: 'Admin with optional fields',
        value: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'StrongPassword123!',
          confirmPassword: 'StrongPassword123!',
          phoneNumber: '+1234567890',
          address: '123 Main St, City, Country',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin user successfully created',
    schema: {
      properties: {
        id: { type: 'number', example: 1 },
        firstName: { type: 'string', example: 'Admin' },
        lastName: { type: 'string', example: 'User' },
        email: { type: 'string', example: 'admin@example.com' },
        role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.createAdmin(createAdminDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates a user and returns access and refresh tokens',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      standard: {
        summary: 'Standard login',
        value: {
          email: 'john.doe@example.com',
          password: 'Password123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in',
    type: LoginResponseDto,
    content: {
      'application/json': {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'a1b2c3d4e5f6g7h8i9j0...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Creates a new access token (and optionally a new refresh token) using a valid refresh token',
  })
  @ApiBody({
    type: RefreshTokenRequestDto,
    description: 'Refresh token details',
    examples: {
      standard: {
        summary: 'Standard refresh token request',
        value: {
          refresh_token: 'a1b2c3d4e5f6g7h8i9j0...',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Access token successfully refreshed',
    type: RefreshTokenResponseDto,
    content: {
      'application/json': {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'k9l8m7n6o5p4q3r2s1t0...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Invalidates the provided refresh token, effectively logging out the user from that session',
  })
  @ApiBody({
    type: RefreshTokenRequestDto,
    description: 'Refresh token to invalidate',
    examples: {
      standard: {
        summary: 'Standard logout request',
        value: {
          refresh_token: 'a1b2c3d4e5f6g7h8i9j0...',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token or user not authenticated',
  })
  @ApiResponse({ status: 404, description: 'Not Found - Refresh token not found' })
  @HttpCode(200)
  async logout(@Body() refreshTokenDto: RefreshTokenRequestDto) {
    return this.authService.logout(refreshTokenDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile information of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileDto,
    content: {
      'application/json': {
        example: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'user',
          phoneNumber: '+1234567890',
          address: '123 Main St, City, Country',
          createdAt: '2023-04-01T12:00:00Z',
          updatedAt: '2023-04-01T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  async getProfile(@CurrentUser() user: User): Promise<ProfileDto> {
    return this.authService.getProfile(user.id);
  }
}

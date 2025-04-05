import { Injectable, UnauthorizedException, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ProfileDto } from './dto/profile.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { RefreshTokenService } from '../refresh-tokens/refresh-token.service';
import { LoginResponseDto } from '../refresh-tokens/dto/login-response.dto';
import { RefreshTokenResponseDto } from '../refresh-tokens/dto/refresh-token-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    this.logger.debug(`Found user: ${user ? 'Yes' : 'No'}`);
    
    if (user) {
      const isValid = await this.usersService.validatePassword(user, password);
      this.logger.debug(`Password validation result: ${isValid}`);
      if (isValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      tokenVersion: user.tokenVersion
    };

    const refreshToken = await this.refreshTokenService.generateRefreshToken(user as User);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken.token,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    const token = await this.refreshTokenService.findToken(refreshToken);
    const user = token.user;

    // Increment the token version and get the updated user
    const updatedUser = await this.usersService.update(user.id, { tokenVersion: user.tokenVersion + 1 });

    const payload = {
      email: updatedUser.email,
      sub: updatedUser.id,
      role: updatedUser.role,
      tokenVersion: updatedUser.tokenVersion,
      iat: Math.floor(Date.now() / 1000),
    };

    // Revoke the old refresh token
    await this.refreshTokenService.revokeToken(refreshToken);

    // Generate a new refresh token
    const newRefreshToken = await this.refreshTokenService.generateRefreshToken(updatedUser);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: newRefreshToken.token,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeToken(refreshToken);
  }

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || UserRole.USER,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async getProfile(userId: number): Promise<ProfileDto> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Transform User entity to ProfileDto
    const profile: ProfileDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return profile;
  }
} 
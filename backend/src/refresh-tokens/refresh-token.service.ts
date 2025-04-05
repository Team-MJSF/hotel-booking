import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async generateRefreshToken(user: User): Promise<RefreshToken> {
    const token = crypto.randomBytes(40).toString('hex');

    // Ensure a valid date format by using current date + 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiresAt,
      isActive: true,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async findToken(token: string): Promise<RefreshToken> {
    if (!token || token.trim() === '') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token, isActive: true },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return refreshToken;
  }

  async revokeToken(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (refreshToken) {
      refreshToken.isActive = false;
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isActive: true },
      { isActive: false },
    );
  }
}

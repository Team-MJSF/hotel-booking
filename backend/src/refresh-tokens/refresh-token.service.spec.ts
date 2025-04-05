import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let refreshTokenRepository: Repository<RefreshToken>;

  const mockUser: User = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Test St',
    bookings: [],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenVersion: 0,
    isActive: true,
  };

  const mockRefreshToken: RefreshToken = {
    id: 1,
    token: 'test_refresh_token',
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            create: jest.fn().mockReturnValue(mockRefreshToken),
            save: jest.fn().mockResolvedValue(mockRefreshToken),
            findOne: jest.fn().mockResolvedValue(mockRefreshToken),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    refreshTokenRepository = module.get<Repository<RefreshToken>>(getRepositoryToken(RefreshToken));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRefreshToken', () => {
    it('should generate a new refresh token', async () => {
      const result = await service.generateRefreshToken(mockUser);

      expect(result).toEqual(mockRefreshToken);
      expect(refreshTokenRepository.create).toHaveBeenCalledWith({
        token: expect.any(String),
        user: mockUser,
        expiresAt: expect.any(Date),
        isActive: true,
      });
      expect(refreshTokenRepository.save).toHaveBeenCalledWith(mockRefreshToken);
    });
  });

  describe('findToken', () => {
    it('should handle all token finding scenarios', async () => {
      // Test finding an active token
      const result = await service.findToken('test_refresh_token');
      expect(result).toEqual(mockRefreshToken);
      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: 'test_refresh_token', isActive: true },
        relations: ['user'],
      });

      // Test token not found
      jest.spyOn(refreshTokenRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findToken('invalid_token')).rejects.toThrow(UnauthorizedException);

      // Test expired token
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      };
      jest.spyOn(refreshTokenRepository, 'findOne').mockResolvedValueOnce(expiredToken);
      await expect(service.findToken('expired_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeToken', () => {
    it('should handle all token revocation scenarios', async () => {
      // Test successful token revocation
      await service.revokeToken('test_refresh_token');
      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: 'test_refresh_token' },
      });
      expect(refreshTokenRepository.save).toHaveBeenCalledWith({
        ...mockRefreshToken,
        isActive: false,
      });

      // Test non-existent token
      jest.spyOn(refreshTokenRepository, 'findOne').mockResolvedValueOnce(null);
      await service.revokeToken('non_existent_token');
      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: 'non_existent_token' },
      });
      expect(refreshTokenRepository.save).not.toHaveBeenCalledTimes(2); // Ensure save wasn't called again
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all active tokens for a user', async () => {
      await service.revokeAllUserTokens(1);

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { user: { id: 1 }, isActive: true },
        { isActive: false },
      );
    });
  });
});

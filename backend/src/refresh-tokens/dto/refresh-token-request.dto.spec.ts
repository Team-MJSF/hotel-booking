import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RefreshTokenRequestDto } from './refresh-token-request.dto';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('RefreshTokenRequestDto', () => {
  let refreshTokenRequestDto: RefreshTokenRequestDto;

  beforeEach(() => {
    refreshTokenRequestDto = new RefreshTokenRequestDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid data case
      refreshTokenRequestDto.refresh_token = 'a1b2c3d4e5f6g7h8i9j0...';

      let errors = await validate(refreshTokenRequestDto);
      expect(errors).toHaveLength(0);

      // Valid token formats
      const validTokens = [
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      ];

      for (const token of validTokens) {
        refreshTokenRequestDto = new RefreshTokenRequestDto();
        refreshTokenRequestDto.refresh_token = token;

        errors = await validate(refreshTokenRequestDto);
        expect(errors).toHaveLength(0);
      }

      // Test empty string
      refreshTokenRequestDto = new RefreshTokenRequestDto();
      refreshTokenRequestDto.refresh_token = '';
      errors = await validate(refreshTokenRequestDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');

      // Test whitespace only
      refreshTokenRequestDto = new RefreshTokenRequestDto();
      refreshTokenRequestDto.refresh_token = '   ';
      errors = await validate(refreshTokenRequestDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');

      // Test null
      refreshTokenRequestDto = new RefreshTokenRequestDto();
      refreshTokenRequestDto.refresh_token = null;
      errors = await validate(refreshTokenRequestDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');

      // Test undefined
      refreshTokenRequestDto = new RefreshTokenRequestDto();
      refreshTokenRequestDto.refresh_token = undefined;
      errors = await validate(refreshTokenRequestDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');

      // Test missing refresh_token
      const dto = new RefreshTokenRequestDto();
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');
    });
  });

  describe('transformation', () => {
    it('should handle all transformation cases', () => {
      const transformationCases = [
        {
          description: 'plain object',
          data: {
            refresh_token: 'a1b2c3d4e5f6g7h8i9j0...',
          },
        },
        {
          description: 'extra properties',
          data: {
            refresh_token: 'a1b2c3d4e5f6g7h8i9j0...',
            extraField: 'extra value',
          },
        },
        {
          description: 'whitespace preserved',
          data: {
            refresh_token: '  a1b2c3d4e5f6g7h8i9j0...  ',
          },
        },
      ];

      for (const { data } of transformationCases) {
        const dtoObject = plainToClass(RefreshTokenRequestDto, data);
        expect(dtoObject).toBeInstanceOf(RefreshTokenRequestDto);
        expect(dtoObject.refresh_token).toBe(data.refresh_token);
      }
    });
  });
});

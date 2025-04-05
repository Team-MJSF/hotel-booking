import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RefreshTokenResponseDto } from './refresh-token-response.dto';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('RefreshTokenResponseDto', () => {
  let refreshTokenResponseDto: RefreshTokenResponseDto;

  beforeEach(() => {
    refreshTokenResponseDto = new RefreshTokenResponseDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid data case
      refreshTokenResponseDto.access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      refreshTokenResponseDto.refresh_token = 'a1b2c3d4e5f6g7h8i9j0...';
      
      let errors = await validate(refreshTokenResponseDto);
      expect(errors).toHaveLength(0);

      // Valid token formats
      const validTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      ];

      for (const token of validTokens) {
        refreshTokenResponseDto = new RefreshTokenResponseDto();
        refreshTokenResponseDto.access_token = token;
        refreshTokenResponseDto.refresh_token = token;  // Use same token for both since format is similar
        
        errors = await validate(refreshTokenResponseDto);
        expect(errors).toHaveLength(0);
      }

      // Test empty string for access_token
      refreshTokenResponseDto = new RefreshTokenResponseDto();
      refreshTokenResponseDto.access_token = '';
      refreshTokenResponseDto.refresh_token = 'valid_refresh_token';
      errors = await validate(refreshTokenResponseDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('access_token');

      // Test empty string for refresh_token
      refreshTokenResponseDto = new RefreshTokenResponseDto();
      refreshTokenResponseDto.access_token = 'valid_access_token';
      refreshTokenResponseDto.refresh_token = '';
      errors = await validate(refreshTokenResponseDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');

      // Test whitespace only for access_token
      refreshTokenResponseDto = new RefreshTokenResponseDto();
      refreshTokenResponseDto.access_token = '   ';
      refreshTokenResponseDto.refresh_token = 'valid_refresh_token';
      errors = await validate(refreshTokenResponseDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('access_token');

      // Test whitespace only for refresh_token
      refreshTokenResponseDto = new RefreshTokenResponseDto();
      refreshTokenResponseDto.access_token = 'valid_access_token';
      refreshTokenResponseDto.refresh_token = '   ';
      errors = await validate(refreshTokenResponseDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');

      // Test null values
      refreshTokenResponseDto = new RefreshTokenResponseDto();
      refreshTokenResponseDto.access_token = null;
      refreshTokenResponseDto.refresh_token = null;
      errors = await validate(refreshTokenResponseDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map(e => e.property)).toContain('access_token');
      expect(errors.map(e => e.property)).toContain('refresh_token');

      // Test undefined values
      refreshTokenResponseDto = new RefreshTokenResponseDto();
      refreshTokenResponseDto.access_token = undefined;
      refreshTokenResponseDto.refresh_token = undefined;
      errors = await validate(refreshTokenResponseDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map(e => e.property)).toContain('access_token');
      expect(errors.map(e => e.property)).toContain('refresh_token');

      // Test missing properties
      const dto = new RefreshTokenResponseDto();
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map(e => e.property)).toContain('access_token');
      expect(errors.map(e => e.property)).toContain('refresh_token');
    });
  });

  describe('transformation', () => {
    it('should handle all transformation cases', () => {
      const transformationCases = [
        {
          description: 'plain object',
          data: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'a1b2c3d4e5f6g7h8i9j0...'
          }
        },
        {
          description: 'extra properties',
          data: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'a1b2c3d4e5f6g7h8i9j0...',
            extraField: 'extra value'
          }
        },
        {
          description: 'whitespace preserved',
          data: {
            access_token: '  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ',
            refresh_token: '  a1b2c3d4e5f6g7h8i9j0...  '
          }
        }
      ];

      for (const { data } of transformationCases) {
        const dtoObject = plainToClass(RefreshTokenResponseDto, data);
        expect(dtoObject).toBeInstanceOf(RefreshTokenResponseDto);
        expect(dtoObject.access_token).toBe(data.access_token);
        expect(dtoObject.refresh_token).toBe(data.refresh_token);
      }
    });
  });
}); 
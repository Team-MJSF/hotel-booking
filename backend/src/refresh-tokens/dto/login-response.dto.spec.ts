import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginResponseDto } from './login-response.dto';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('LoginResponseDto', () => {
  let loginResponseDto: LoginResponseDto;

  beforeEach(() => {
    loginResponseDto = new LoginResponseDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid data case
      loginResponseDto.access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      loginResponseDto.refresh_token = 'a1b2c3d4e5f6g7h8i9j0...';

      let errors = await validate(loginResponseDto);
      expect(errors).toHaveLength(0);

      // Valid token formats
      const validTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      ];

      for (const token of validTokens) {
        loginResponseDto = new LoginResponseDto();
        loginResponseDto.access_token = token;
        loginResponseDto.refresh_token = token;

        errors = await validate(loginResponseDto);
        expect(errors).toHaveLength(0);
      }

      // Validation failure cases
      const failureCases = [
        {
          data: { refresh_token: 'token123' },
          property: 'access_token',
          description: 'missing access token',
        },
        {
          data: { access_token: 'token123' },
          property: 'refresh_token',
          description: 'missing refresh token',
        },
        {
          data: { access_token: '', refresh_token: 'token123' },
          property: 'access_token',
          description: 'empty access token',
        },
        {
          data: { access_token: 'token123', refresh_token: '' },
          property: 'refresh_token',
          description: 'empty refresh token',
        },
      ];

      for (const { data, property, description } of failureCases) {
        loginResponseDto = plainToClass(LoginResponseDto, data);
        errors = await validate(loginResponseDto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe(property);
      }
    });
  });

  describe('transformation', () => {
    it('should handle all transformation cases', () => {
      const transformationCases = [
        {
          description: 'plain object',
          data: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'a1b2c3d4e5f6g7h8i9j0...',
          },
        },
        {
          description: 'undefined values',
          data: {
            access_token: undefined,
            refresh_token: 'token123',
          },
        },
        {
          description: 'null values',
          data: {
            access_token: null,
            refresh_token: 'token123',
          },
        },
        {
          description: 'empty string values',
          data: {
            access_token: '',
            refresh_token: 'token123',
          },
        },
        {
          description: 'extra properties',
          data: {
            access_token: 'token123',
            refresh_token: 'token456',
            extraField: 'extra value',
          },
        },
      ];

      for (const { data } of transformationCases) {
        const dtoObject = plainToClass(LoginResponseDto, data);
        expect(dtoObject).toBeInstanceOf(LoginResponseDto);
        expect(dtoObject.access_token).toBe(data.access_token);
        expect(dtoObject.refresh_token).toBe(data.refresh_token);
      }
    });
  });
});

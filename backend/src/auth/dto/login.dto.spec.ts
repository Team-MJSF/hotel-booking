import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginDto } from './login.dto';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('LoginDto', () => {
  let loginDto: LoginDto;

  beforeEach(() => {
    loginDto = new LoginDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid data case
      loginDto.email = 'john@example.com';
      loginDto.password = 'password123';

      let errors = await validate(loginDto);
      expect(errors).toHaveLength(0);

      // Valid email formats
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'user@example.io',
      ];

      for (const email of validEmails) {
        loginDto = new LoginDto();
        loginDto.email = email;
        loginDto.password = 'password123';

        errors = await validate(loginDto);
        expect(errors).toHaveLength(0);
      }

      // Valid password formats
      const validPasswords = [
        'password123',
        'P@ssw0rd',
        '12345678',
        'verylongpassword',
        'pass123word',
      ];

      for (const password of validPasswords) {
        loginDto = new LoginDto();
        loginDto.email = 'john@example.com';
        loginDto.password = password;

        errors = await validate(loginDto);
        expect(errors).toHaveLength(0);
      }

      // Validation failure cases
      const failureCases = [
        { data: { password: 'password123' }, property: 'email', description: 'missing email' },
        {
          data: { email: 'john@example.com' },
          property: 'password',
          description: 'missing password',
        },
        {
          data: { email: 'not-an-email', password: 'password123' },
          property: 'email',
          description: 'invalid email format',
        },
        {
          data: { email: '', password: 'password123' },
          property: 'email',
          description: 'empty email',
        },
        {
          data: { email: 'john@example.com', password: '' },
          property: 'password',
          description: 'empty password',
        },
        {
          data: { email: 'john@example.com', password: 'short' },
          property: 'password',
          description: 'password shorter than 8 characters',
        },
      ];

      for (const { data, property, description } of failureCases) {
        loginDto = plainToClass(LoginDto, data);
        errors = await validate(loginDto);
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
            email: 'john@example.com',
            password: 'password123',
          },
        },
        {
          description: 'undefined values',
          data: {
            email: undefined,
            password: 'password123',
          },
        },
        {
          description: 'null values',
          data: {
            email: null,
            password: 'password123',
          },
        },
        {
          description: 'empty string values',
          data: {
            email: '',
            password: 'password123',
          },
        },
        {
          description: 'extra properties',
          data: {
            email: 'john@example.com',
            password: 'password123',
            extraField: 'extra value',
          },
        },
      ];

      for (const { data } of transformationCases) {
        const dtoObject = plainToClass(LoginDto, data);
        expect(dtoObject).toBeInstanceOf(LoginDto);
        expect(dtoObject.email).toBe(data.email);
        expect(dtoObject.password).toBe(data.password);
      }
    });
  });
});

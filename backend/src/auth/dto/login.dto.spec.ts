import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should handle all validation failure cases', async () => {
      const failureCases = [
        { data: { password: 'password123' }, property: 'email', description: 'missing email' },
        { data: { email: 'john@example.com' }, property: 'password', description: 'missing password' },
        { data: { email: 'not-an-email', password: 'password123' }, property: 'email', description: 'invalid email format' },
        { data: { email: '', password: 'password123' }, property: 'email', description: 'empty email' },
        { data: { email: 'john@example.com', password: '' }, property: 'password', description: 'empty password' },
        { data: { email: 'john@example.com', password: 'short' }, property: 'password', description: 'password shorter than 8 characters' }
      ];

      for (const { data, property, description } of failureCases) {
        const dtoObject = plainToClass(LoginDto, data);
        const errors = await validate(dtoObject);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe(property);
      }
    });

    it('should handle all valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'user@example.io'
      ];

      for (const email of validEmails) {
        const validData = {
          email,
          password: 'password123'
        };

        const dtoObject = plainToClass(LoginDto, validData);
        const errors = await validate(dtoObject);
        expect(errors.length).toBe(0);
      }
    });

    it('should handle all valid password formats', async () => {
      const validPasswords = [
        'password123',
        'P@ssw0rd',
        '12345678',
        'verylongpassword',
        'pass123word'
      ];

      for (const password of validPasswords) {
        const validData = {
          email: 'john@example.com',
          password
        };

        const dtoObject = plainToClass(LoginDto, validData);
        const errors = await validate(dtoObject);
        expect(errors.length).toBe(0);
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
            password: 'password123'
          }
        },
        {
          description: 'undefined values',
          data: {
            email: undefined,
            password: 'password123'
          }
        },
        {
          description: 'null values',
          data: {
            email: null,
            password: 'password123'
          }
        },
        {
          description: 'empty string values',
          data: {
            email: '',
            password: 'password123'
          }
        },
        {
          description: 'extra properties',
          data: {
            email: 'john@example.com',
            password: 'password123',
            extraField: 'extra value'
          }
        }
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
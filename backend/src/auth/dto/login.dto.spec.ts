import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  describe('validation', () => {
    it('should pass validation with valid email and password', async () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing email', async () => {
      const invalidData = {
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with missing password', async () => {
      const invalidData = {
        email: 'john@example.com'
      };

      const dtoObject = plainToClass(LoginDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with invalid email format', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty email', async () => {
      const invalidData = {
        email: '',
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty password', async () => {
      const invalidData = {
        email: 'john@example.com',
        password: ''
      };

      const dtoObject = plainToClass(LoginDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with password shorter than 8 characters', async () => {
      const invalidData = {
        email: 'john@example.com',
        password: 'short'
      };

      const dtoObject = plainToClass(LoginDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should pass validation with valid email formats', async () => {
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

    it('should pass validation with valid password formats', async () => {
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
    it('should transform plain object to LoginDto instance', () => {
      const plainData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, plainData);

      expect(dtoObject).toBeInstanceOf(LoginDto);
      expect(dtoObject.email).toBe(plainData.email);
      expect(dtoObject.password).toBe(plainData.password);
    });

    it('should handle undefined values', () => {
      const plainData = {
        email: undefined,
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, plainData);

      expect(dtoObject).toBeInstanceOf(LoginDto);
      expect(dtoObject.email).toBeUndefined();
    });

    it('should handle null values', () => {
      const plainData = {
        email: null,
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, plainData);

      expect(dtoObject).toBeInstanceOf(LoginDto);
      expect(dtoObject.email).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        email: '',
        password: 'password123'
      };

      const dtoObject = plainToClass(LoginDto, plainData);

      expect(dtoObject).toBeInstanceOf(LoginDto);
      expect(dtoObject.email).toBe('');
    });

    it('should ignore extra properties', () => {
      const plainData = {
        email: 'john@example.com',
        password: 'password123',
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(LoginDto, plainData);

      expect(dtoObject).toBeInstanceOf(LoginDto);
      expect(dtoObject.email).toBe(plainData.email);
      expect(dtoObject.password).toBe(plainData.password);
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 
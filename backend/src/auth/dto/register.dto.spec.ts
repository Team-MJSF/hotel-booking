import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  describe('validation', () => {
    it('should pass validation with all valid fields', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const dtoObject = plainToClass(RegisterDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe'
        // email, password, and confirmPassword are missing
      };

      const dtoObject = plainToClass(RegisterDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'email')).toBe(true);
      expect(errors.some(error => error.property === 'password')).toBe(true);
      expect(errors.some(error => error.property === 'confirmPassword')).toBe(true);
    });

    it('should fail validation with empty first name', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const dtoObject = plainToClass(RegisterDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('firstName');
    });

    it('should fail validation with empty last name', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: '',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const dtoObject = plainToClass(RegisterDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('lastName');
    });

    it('should fail validation with invalid email format', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const dtoObject = plainToClass(RegisterDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty email', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const dtoObject = plainToClass(RegisterDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with password shorter than 8 characters', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'short',
        confirmPassword: 'short'
      };

      const dtoObject = plainToClass(RegisterDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'password')).toBe(true);
      expect(errors.some(error => error.property === 'confirmPassword')).toBe(true);
    });

    it('should fail validation with mismatched passwords', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword'
      };

      const dtoObject = plainToClass(RegisterDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('confirmPassword');
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
          firstName: 'John',
          lastName: 'Doe',
          email,
          password: 'password123',
          confirmPassword: 'password123'
        };

        const dtoObject = plainToClass(RegisterDto, validData);
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
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password,
          confirmPassword: password
        };

        const dtoObject = plainToClass(RegisterDto, validData);
        const errors = await validate(dtoObject);

        expect(errors.length).toBe(0);
      }
    });

    it('should pass validation with valid name formats', async () => {
      const validNames = [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Mary-Jane', lastName: 'Smith-Jones' },
        { firstName: 'Jean-Pierre', lastName: 'O\'Connor' },
        { firstName: 'José', lastName: 'González' },
        { firstName: 'Иван', lastName: 'Петров' }
      ];

      for (const { firstName, lastName } of validNames) {
        const validData = {
          firstName,
          lastName,
          email: 'user@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        };

        const dtoObject = plainToClass(RegisterDto, validData);
        const errors = await validate(dtoObject);

        expect(errors.length).toBe(0);
      }
    });
  });
}); 
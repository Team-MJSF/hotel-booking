import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';

describe('CreateUserDto', () => {
  describe('validation', () => {
    it('should pass validation with all required fields', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const dtoObject = plainToClass(CreateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields including optional ones', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: UserRole.USER,
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject = plainToClass(CreateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with password too short', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '123' // Too short
      };

      const dtoObject = plainToClass(CreateUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with invalid email', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const dtoObject = plainToClass(CreateUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty required fields', async () => {
      const invalidData = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      };

      const dtoObject = plainToClass(CreateUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'firstName')).toBe(true);
      expect(errors.some(error => error.property === 'lastName')).toBe(true);
      expect(errors.some(error => error.property === 'email')).toBe(true);
      expect(errors.some(error => error.property === 'password')).toBe(true);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        // email and password are missing
      };

      const dtoObject = plainToClass(CreateUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'email')).toBe(true);
      expect(errors.some(error => error.property === 'password')).toBe(true);
    });

    it('should fail validation with invalid role', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'INVALID_ROLE'
      };

      const dtoObject = plainToClass(CreateUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
    });

    it('should pass validation with valid role', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: UserRole.ADMIN
      };

      const dtoObject = plainToClass(CreateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional fields omitted', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const dtoObject = plainToClass(CreateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });
  });
}); 
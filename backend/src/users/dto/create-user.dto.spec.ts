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

  describe('transformation', () => {
    it('should transform plain object to CreateUserDto instance with correct types', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'admin',
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject = plainToClass(CreateUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateUserDto);
      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBe('Doe');
      expect(dtoObject.email).toBe('john.doe@example.com');
      expect(dtoObject.password).toBe('password123');
      expect(dtoObject.role).toBe(UserRole.ADMIN);
      expect(dtoObject.phoneNumber).toBe('+1234567890');
      expect(dtoObject.address).toBe('123 Main St');
    });

    it('should handle undefined values for optional fields', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: undefined,
        phoneNumber: undefined,
        address: undefined
      };

      const dtoObject = plainToClass(CreateUserDto, plainData);

      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });

    it('should handle null values for optional fields', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: null,
        phoneNumber: null,
        address: null
      };

      const dtoObject = plainToClass(CreateUserDto, plainData);

      expect(dtoObject.role).toBeNull();
      expect(dtoObject.phoneNumber).toBeNull();
      expect(dtoObject.address).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phoneNumber: '',
        address: ''
      };

      const dtoObject = plainToClass(CreateUserDto, plainData);

      expect(dtoObject.phoneNumber).toBe('');
      expect(dtoObject.address).toBe('');
    });

    it('should handle enum values with case transformation', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'ADMIN'
      };

      const dtoObject = plainToClass(CreateUserDto, plainData);

      expect(dtoObject.role).toBe(UserRole.ADMIN);
    });

    it('should handle partial data with only required fields', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const dtoObject = plainToClass(CreateUserDto, plainData);

      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBe('Doe');
      expect(dtoObject.email).toBe('john.doe@example.com');
      expect(dtoObject.password).toBe('password123');
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });

    it('should handle partial data with only optional fields', () => {
      const plainData = {
        role: 'admin',
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject = plainToClass(CreateUserDto, plainData);

      expect(dtoObject.firstName).toBeUndefined();
      expect(dtoObject.lastName).toBeUndefined();
      expect(dtoObject.email).toBeUndefined();
      expect(dtoObject.password).toBeUndefined();
      expect(dtoObject.role).toBe(UserRole.ADMIN);
      expect(dtoObject.phoneNumber).toBe('+1234567890');
      expect(dtoObject.address).toBe('123 Main St');
    });

    it('should preserve extra properties in the transformed object', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(CreateUserDto, plainData);

      expect(dtoObject).toHaveProperty('extraField', 'extra value');
    });
  });
}); 
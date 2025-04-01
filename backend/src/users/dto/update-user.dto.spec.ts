import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';
import { UserRole } from '../entities/user.entity';

describe('UpdateUserDto', () => {
  describe('validation', () => {
    it('should pass validation with no fields (empty update)', async () => {
      const validData = {};

      const dtoObject = plainToClass(UpdateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with single field update', async () => {
      const validData = {
        firstName: 'John'
      };

      const dtoObject = plainToClass(UpdateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with multiple fields update', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const dtoObject = plainToClass(UpdateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: UserRole.USER,
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject = plainToClass(UpdateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid email when email is provided', async () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const dtoObject = plainToClass(UpdateUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with password too short when password is provided', async () => {
      const invalidData = {
        password: '123' // Too short
      };

      const dtoObject = plainToClass(UpdateUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with invalid role when role is provided', async () => {
      const invalidData = {
        role: 'INVALID_ROLE'
      };

      const dtoObject = plainToClass(UpdateUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
    });

    it('should pass validation with valid role when role is provided', async () => {
      const validData = {
        role: UserRole.ADMIN
      };

      const dtoObject = plainToClass(UpdateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial update of required fields', async () => {
      const validData = {
        firstName: 'John',
        email: 'john.doe@example.com'
      };

      const dtoObject = plainToClass(UpdateUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });
  });

  describe('transformation', () => {
    it('should transform plain object to UpdateUserDto instance with correct types', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'admin',
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateUserDto);
      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBe('Doe');
      expect(dtoObject.email).toBe('john.doe@example.com');
      expect(dtoObject.password).toBe('password123');
      expect(dtoObject.role).toBe(UserRole.ADMIN);
      expect(dtoObject.phoneNumber).toBe('+1234567890');
      expect(dtoObject.address).toBe('123 Main St');
    });

    it('should handle undefined values for all fields', () => {
      const plainData = {
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        password: undefined,
        role: undefined,
        phoneNumber: undefined,
        address: undefined
      };

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject.firstName).toBeUndefined();
      expect(dtoObject.lastName).toBeUndefined();
      expect(dtoObject.email).toBeUndefined();
      expect(dtoObject.password).toBeUndefined();
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });

    it('should handle null values for all fields', () => {
      const plainData = {
        firstName: null,
        lastName: null,
        email: null,
        password: null,
        role: null,
        phoneNumber: null,
        address: null
      };

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject.firstName).toBeNull();
      expect(dtoObject.lastName).toBeNull();
      expect(dtoObject.email).toBeNull();
      expect(dtoObject.password).toBeNull();
      expect(dtoObject.role).toBeNull();
      expect(dtoObject.phoneNumber).toBeNull();
      expect(dtoObject.address).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: ''
      };

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject.firstName).toBe('');
      expect(dtoObject.lastName).toBe('');
      expect(dtoObject.email).toBe('');
      expect(dtoObject.password).toBe('');
      expect(dtoObject.phoneNumber).toBe('');
      expect(dtoObject.address).toBe('');
    });

    it('should handle enum values with case transformation', () => {
      const plainData = {
        role: 'ADMIN'
      };

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject.role).toBe(UserRole.ADMIN);
    });

    it('should handle single field update', () => {
      const plainData = {
        firstName: 'John'
      };

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBeUndefined();
      expect(dtoObject.email).toBeUndefined();
      expect(dtoObject.password).toBeUndefined();
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });

    it('should handle multiple fields update', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBe('Doe');
      expect(dtoObject.email).toBe('john.doe@example.com');
      expect(dtoObject.password).toBeUndefined();
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });

    it('should handle empty object update', () => {
      const plainData = {};

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject.firstName).toBeUndefined();
      expect(dtoObject.lastName).toBeUndefined();
      expect(dtoObject.email).toBeUndefined();
      expect(dtoObject.password).toBeUndefined();
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });

    it('should preserve extra properties in the transformed object', () => {
      const plainData = {
        firstName: 'John',
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(UpdateUserDto, plainData);

      expect(dtoObject).toHaveProperty('extraField', 'extra value');
    });
  });
}); 
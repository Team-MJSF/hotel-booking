import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { BaseUserDto } from './base-user.dto';
import { UserRole } from '../entities/user.entity';

describe('BaseUserDto', () => {
  describe('validation', () => {
    it('should pass validation with all required fields', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const dtoObject = plainToClass(BaseUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields including optional ones', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: UserRole.USER,
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject = plainToClass(BaseUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid email', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      const dtoObject = plainToClass(BaseUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        firstName: 'John',
        // lastName is missing
        email: 'john.doe@example.com'
      };

      const dtoObject = plainToClass(BaseUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('lastName');
    });

    it('should fail validation with invalid role', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'INVALID_ROLE'
      };

      const dtoObject = plainToClass(BaseUserDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
    });

    it('should pass validation with valid role', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: UserRole.ADMIN
      };

      const dtoObject = plainToClass(BaseUserDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });
  });

  describe('transformation', () => {
    it('should transform plain object to BaseUserDto instance with correct types', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: UserRole.USER,
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject = plainToClass(BaseUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(BaseUserDto);
      expect(typeof dtoObject.firstName).toBe('string');
      expect(typeof dtoObject.lastName).toBe('string');
      expect(typeof dtoObject.email).toBe('string');
      expect(dtoObject.role).toBe(UserRole.USER);
      expect(typeof dtoObject.phoneNumber).toBe('string');
      expect(typeof dtoObject.address).toBe('string');
    });

    it('should handle undefined values for optional fields', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: undefined,
        phoneNumber: undefined,
        address: undefined
      };

      const dtoObject = plainToClass(BaseUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(BaseUserDto);
      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBe('Doe');
      expect(dtoObject.email).toBe('john.doe@example.com');
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });

    it('should handle null values for optional fields', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: null,
        phoneNumber: null,
        address: null
      };

      const dtoObject = plainToClass(BaseUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(BaseUserDto);
      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBe('Doe');
      expect(dtoObject.email).toBe('john.doe@example.com');
      expect(dtoObject.role).toBeNull();
      expect(dtoObject.phoneNumber).toBeNull();
      expect(dtoObject.address).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        phoneNumber: '',
        address: ''
      };

      const dtoObject = plainToClass(BaseUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(BaseUserDto);
      expect(dtoObject.firstName).toBe('');
      expect(dtoObject.lastName).toBe('');
      expect(dtoObject.email).toBe('');
      expect(dtoObject.role).toBe('');
      expect(dtoObject.phoneNumber).toBe('');
      expect(dtoObject.address).toBe('');
    });

    it('should handle enum values with case transformation', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'ADMIN'
      };

      const dtoObject = plainToClass(BaseUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(BaseUserDto);
      expect(dtoObject.role).toBe(UserRole.ADMIN);
    });

    it('should handle partial data with only required fields', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const dtoObject = plainToClass(BaseUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(BaseUserDto);
      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBe('Doe');
      expect(dtoObject.email).toBe('john.doe@example.com');
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeUndefined();
      expect(dtoObject.address).toBeUndefined();
    });

    it('should handle partial data with only optional fields', () => {
      const plainData = {
        role: UserRole.ADMIN,
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject = plainToClass(BaseUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(BaseUserDto);
      expect(dtoObject.firstName).toBeUndefined();
      expect(dtoObject.lastName).toBeUndefined();
      expect(dtoObject.email).toBeUndefined();
      expect(dtoObject.role).toBe(UserRole.ADMIN);
      expect(dtoObject.phoneNumber).toBe('+1234567890');
      expect(dtoObject.address).toBe('123 Main St');
    });

    it('should ignore extra properties', () => {
      const plainData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(BaseUserDto, plainData);

      expect(dtoObject).toBeInstanceOf(BaseUserDto);
      expect(dtoObject.firstName).toBe('John');
      expect(dtoObject.lastName).toBe('Doe');
      expect(dtoObject.email).toBe('john.doe@example.com');
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 
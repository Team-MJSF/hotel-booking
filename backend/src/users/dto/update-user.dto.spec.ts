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
}); 
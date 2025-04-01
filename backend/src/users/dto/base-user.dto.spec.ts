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
}); 
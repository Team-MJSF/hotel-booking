import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProfileDto } from './profile.dto';
import { UserRole } from '../../users/entities/user.entity';

describe('ProfileDto', () => {
  describe('validation', () => {
    it('should pass validation with all valid fields', async () => {
      const validData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: UserRole.USER,
        phoneNumber: '+1234567890',
        address: '123 Main St',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dtoObject = plainToClass(ProfileDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with minimal required fields', async () => {
      const validData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dtoObject = plainToClass(ProfileDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        id: 1,
        firstName: 'John'
        // lastName and email are missing
      };

      const dtoObject = plainToClass(ProfileDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'lastName')).toBe(true);
      expect(errors.some(error => error.property === 'email')).toBe(true);
    });

    it('should fail validation with invalid email format', async () => {
      const invalidData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dtoObject = plainToClass(ProfileDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with invalid role', async () => {
      const invalidData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'invalid_role',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dtoObject = plainToClass(ProfileDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
    });

    it('should pass validation with valid role values', async () => {
      const validRoles = [UserRole.ADMIN, UserRole.USER];

      for (const role of validRoles) {
        const validData = {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const dtoObject = plainToClass(ProfileDto, validData);
        const errors = await validate(dtoObject);

        expect(errors.length).toBe(0);
      }
    });

    it('should pass validation with valid optional fields', async () => {
      const validData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        address: '123 Main St',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dtoObject = plainToClass(ProfileDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
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
          id: 1,
          firstName,
          lastName,
          email: 'user@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const dtoObject = plainToClass(ProfileDto, validData);
        const errors = await validate(dtoObject);

        expect(errors.length).toBe(0);
      }
    });
  });
}); 
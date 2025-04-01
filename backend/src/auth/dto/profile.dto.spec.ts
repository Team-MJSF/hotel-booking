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

  describe('transformation', () => {
    it('should transform plain object to ProfileDto instance', () => {
      const plainData = {
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

      const dtoObject = plainToClass(ProfileDto, plainData);

      expect(dtoObject).toBeInstanceOf(ProfileDto);
      expect(dtoObject.id).toBe(plainData.id);
      expect(dtoObject.firstName).toBe(plainData.firstName);
      expect(dtoObject.lastName).toBe(plainData.lastName);
      expect(dtoObject.email).toBe(plainData.email);
      expect(dtoObject.role).toBe(plainData.role);
      expect(dtoObject.phoneNumber).toBe(plainData.phoneNumber);
      expect(dtoObject.address).toBe(plainData.address);
      expect(dtoObject.createdAt).toStrictEqual(plainData.createdAt);
      expect(dtoObject.updatedAt).toStrictEqual(plainData.updatedAt);
    });

    it('should handle undefined values', () => {
      const plainData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dtoObject = plainToClass(ProfileDto, plainData);

      expect(dtoObject).toBeInstanceOf(ProfileDto);
      expect(dtoObject.email).toBeUndefined();
    });

    it('should handle null values', () => {
      const plainData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dtoObject = plainToClass(ProfileDto, plainData);

      expect(dtoObject).toBeInstanceOf(ProfileDto);
      expect(dtoObject.email).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        id: 1,
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dtoObject = plainToClass(ProfileDto, plainData);

      expect(dtoObject).toBeInstanceOf(ProfileDto);
      expect(dtoObject.firstName).toBe('');
    });

    it('should handle date string conversion', () => {
      const plainData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      };

      const dtoObject = plainToClass(ProfileDto, plainData);

      expect(dtoObject).toBeInstanceOf(ProfileDto);
      expect(dtoObject.createdAt).toBeInstanceOf(Date);
      expect(dtoObject.updatedAt).toBeInstanceOf(Date);
    });

    it('should ignore extra properties', () => {
      const plainData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(ProfileDto, plainData);

      expect(dtoObject).toBeInstanceOf(ProfileDto);
      expect(dtoObject.id).toBe(plainData.id);
      expect(dtoObject.firstName).toBe(plainData.firstName);
      expect(dtoObject.lastName).toBe(plainData.lastName);
      expect(dtoObject.email).toBe(plainData.email);
      expect(dtoObject.createdAt).toEqual(new Date(plainData.createdAt));
      expect(dtoObject.updatedAt).toEqual(new Date(plainData.updatedAt));
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 
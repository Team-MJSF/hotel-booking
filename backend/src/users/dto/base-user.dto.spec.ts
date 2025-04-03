import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { BaseUserDto } from './base-user.dto';
import { UserRole } from '../entities/user.entity';

describe('BaseUserDto', () => {
  describe('validation and transformation', () => {
    it('should handle all validation cases and transformations correctly', async () => {
      // Test case 1: Valid data with all fields
      const validFullData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'ADMIN',
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject1 = plainToClass(BaseUserDto, validFullData);
      const errors1 = await validate(dtoObject1);

      expect(errors1.length).toBe(0);
      expect(dtoObject1).toBeInstanceOf(BaseUserDto);
      expect(dtoObject1.role).toBe(UserRole.ADMIN);
      expect(dtoObject1.phoneNumber).toBe('+1234567890');
      expect(dtoObject1.address).toBe('123 Main St');

      // Test case 2: Valid data with only required fields
      const validMinimalData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const dtoObject2 = plainToClass(BaseUserDto, validMinimalData);
      const errors2 = await validate(dtoObject2);

      expect(errors2.length).toBe(0);
      expect(dtoObject2.role).toBeUndefined();
      expect(dtoObject2.phoneNumber).toBeUndefined();
      expect(dtoObject2.address).toBeUndefined();

      // Test case 3: Invalid data with various validation errors
      const invalidDataSets = [
        {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'invalid-email'
          },
          expectedErrors: ['email']
        },
        {
          data: {
            firstName: 'John',
            // lastName is missing
            email: 'john.doe@example.com'
          },
          expectedErrors: ['lastName']
        },
        {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'INVALID_ROLE'
          },
          expectedErrors: ['role']
        }
      ];

      for (const { data, expectedErrors } of invalidDataSets) {
        const dtoObject = plainToClass(BaseUserDto, data);
        const errors = await validate(dtoObject);
        
        expect(errors.length).toBeGreaterThan(0);
        expectedErrors.forEach(errorProperty => {
          expect(errors.some(error => error.property === errorProperty)).toBe(true);
        });
      }
    });

    it('should handle all transformation edge cases correctly', () => {
      // Test case 1: Various field value types
      const dataWithVariousTypes = {
        firstName: 'John',
        lastName: null,
        email: 'john.doe@example.com',
        role: 'admin',
        phoneNumber: null,
        address: undefined
      };

      const dtoObject1 = plainToClass(BaseUserDto, dataWithVariousTypes);

      expect(dtoObject1.firstName).toBe('John');
      expect(dtoObject1.lastName).toBeNull();
      expect(dtoObject1.email).toBe('john.doe@example.com');
      expect(dtoObject1.role).toBe(UserRole.ADMIN);
      expect(dtoObject1.phoneNumber).toBeNull();
      expect(dtoObject1.address).toBeUndefined();

      // Test case 2: Role transformation with different cases
      const roleCases = [
        { input: 'ADMIN', expected: UserRole.ADMIN },
        { input: 'admin', expected: UserRole.ADMIN },
        { input: 'Admin', expected: UserRole.ADMIN }
      ];

      roleCases.forEach(({ input, expected }) => {
        const data = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: input
        };
        const dtoObject = plainToClass(BaseUserDto, data);
        expect(dtoObject.role).toBe(expected);
      });

      // Test case 3: Optional fields only
      const optionalFieldsData = {
        role: UserRole.ADMIN,
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject3 = plainToClass(BaseUserDto, optionalFieldsData);

      expect(dtoObject3.firstName).toBeUndefined();
      expect(dtoObject3.lastName).toBeUndefined();
      expect(dtoObject3.email).toBeUndefined();
      expect(dtoObject3.role).toBe(UserRole.ADMIN);
      expect(dtoObject3.phoneNumber).toBe('+1234567890');
      expect(dtoObject3.address).toBe('123 Main St');
    });
  });
}); 
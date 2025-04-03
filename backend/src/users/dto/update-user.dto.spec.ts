import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';
import { UserRole } from '../entities/user.entity';

describe('UpdateUserDto', () => {
  describe('validation and transformation', () => {
    it('should handle all validation cases and transformations correctly', async () => {
      // Test case 1: Empty update (valid)
      const emptyData = {};
      const dtoObject1 = plainToClass(UpdateUserDto, emptyData);
      const errors1 = await validate(dtoObject1);
      expect(errors1.length).toBe(0);

      // Test case 2: Full update with all fields (valid)
      const fullData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'ADMIN',
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject2 = plainToClass(UpdateUserDto, fullData);
      const errors2 = await validate(dtoObject2);

      expect(errors2.length).toBe(0);
      expect(dtoObject2).toBeInstanceOf(UpdateUserDto);
      expect(dtoObject2.role).toBe(UserRole.ADMIN);
      expect(dtoObject2.phoneNumber).toBe('+1234567890');
      expect(dtoObject2.address).toBe('123 Main St');

      // Test case 3: Invalid data with various validation errors
      const invalidDataSets = [
        {
          data: { email: 'invalid-email' },
          expectedErrors: ['email']
        },
        {
          data: { password: '123' }, // Too short
          expectedErrors: ['password']
        },
        {
          data: { role: 'INVALID_ROLE' },
          expectedErrors: ['role']
        }
      ];

      for (const { data, expectedErrors } of invalidDataSets) {
        const dtoObject = plainToClass(UpdateUserDto, data);
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
        email: undefined,
        password: '',
        role: 'admin',
        phoneNumber: null,
        address: undefined
      };

      const dtoObject1 = plainToClass(UpdateUserDto, dataWithVariousTypes);

      expect(dtoObject1.firstName).toBe('John');
      expect(dtoObject1.lastName).toBeNull();
      expect(dtoObject1.email).toBeUndefined();
      expect(dtoObject1.password).toBe('');
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
        const data = { role: input };
        const dtoObject = plainToClass(UpdateUserDto, data);
        expect(dtoObject.role).toBe(expected);
      });

      // Test case 3: Partial updates
      const partialUpdateCases = [
        {
          data: { firstName: 'John' },
          expected: {
            firstName: 'John',
            lastName: undefined,
            email: undefined,
            password: undefined,
            role: undefined,
            phoneNumber: undefined,
            address: undefined
          }
        },
        {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          expected: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: undefined,
            role: undefined,
            phoneNumber: undefined,
            address: undefined
          }
        }
      ];

      partialUpdateCases.forEach(({ data, expected }) => {
        const dtoObject = plainToClass(UpdateUserDto, data);
        Object.entries(expected).forEach(([key, value]) => {
          expect(dtoObject[key]).toBe(value);
        });
      });
    });
  });
}); 
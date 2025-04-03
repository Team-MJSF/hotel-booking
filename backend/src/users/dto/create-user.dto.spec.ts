import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';

describe('CreateUserDto', () => {
  describe('validation and transformation', () => {
    it('should handle all validation cases and transformations correctly', async () => {
      // Test case 1: Valid data with all fields
      const validFullData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'ADMIN',
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const dtoObject1 = plainToClass(CreateUserDto, validFullData);
      const errors1 = await validate(dtoObject1);

      expect(errors1.length).toBe(0);
      expect(dtoObject1).toBeInstanceOf(CreateUserDto);
      expect(dtoObject1.role).toBe(UserRole.ADMIN);
      expect(dtoObject1.phoneNumber).toBe('+1234567890');
      expect(dtoObject1.address).toBe('123 Main St');

      // Test case 2: Valid data with only required fields
      const validMinimalData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const dtoObject2 = plainToClass(CreateUserDto, validMinimalData);
      const errors2 = await validate(dtoObject2);

      expect(errors2.length).toBe(0);
      expect(dtoObject2.role).toBeUndefined();
      expect(dtoObject2.phoneNumber).toBeUndefined();
      expect(dtoObject2.address).toBeUndefined();

      // Test case 3: Invalid data with various validation errors
      const invalidDataSets = [
        {
          data: {
            firstName: '',
            lastName: '',
            email: 'invalid-email',
            password: '123' // Too short
          },
          expectedErrors: ['firstName', 'lastName', 'email', 'password']
        },
        {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            // email and password missing
          },
          expectedErrors: ['email', 'password']
        },
        {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            role: 'INVALID_ROLE'
          },
          expectedErrors: ['role']
        }
      ];

      for (const { data, expectedErrors } of invalidDataSets) {
        const dtoObject = plainToClass(CreateUserDto, data);
        const errors = await validate(dtoObject);
        
        expect(errors.length).toBeGreaterThan(0);
        expectedErrors.forEach(errorProperty => {
          expect(errors.some(error => error.property === errorProperty)).toBe(true);
        });
      }
    });

    it('should handle all transformation edge cases correctly', () => {
      // Test case 1: Optional fields with various values
      const dataWithOptionalFields = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: undefined,
        phoneNumber: null,
        address: ''
      };

      const dtoObject1 = plainToClass(CreateUserDto, dataWithOptionalFields);

      expect(dtoObject1.role).toBeUndefined();
      expect(dtoObject1.phoneNumber).toBeNull();
      expect(dtoObject1.address).toBe('');

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
          password: 'password123',
          role: input
        };

        const dtoObject = plainToClass(CreateUserDto, data);
        expect(dtoObject.role).toBe(expected);
      });
    });
  });
}); 
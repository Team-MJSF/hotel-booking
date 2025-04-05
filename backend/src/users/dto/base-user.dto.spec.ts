import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { BaseUserDto } from './base-user.dto';
import { UserRole } from '../entities/user.entity';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('BaseUserDto', () => {
  let baseUserDto: BaseUserDto;

  beforeEach(() => {
    baseUserDto = new BaseUserDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid DTO case
      baseUserDto.firstName = 'John';
      baseUserDto.lastName = 'Doe';
      baseUserDto.email = 'john@example.com';
      baseUserDto.role = UserRole.USER;
      baseUserDto.phoneNumber = '+1234567890';
      baseUserDto.address = '123 Main St';

      const errors = await validate(baseUserDto);
      expect(errors).toHaveLength(0);

      // Invalid email case
      baseUserDto.email = 'invalid-email';
      const emailErrors = await validate(baseUserDto);
      expect(emailErrors).toHaveLength(1);
      expect(emailErrors[0].constraints).toHaveProperty('isEmail');

      // Invalid role case
      baseUserDto.email = 'john@example.com';
      baseUserDto.role = 'INVALID_ROLE' as UserRole;
      const roleErrors = await validate(baseUserDto);
      expect(roleErrors).toHaveLength(1);
      expect(roleErrors[0].constraints).toHaveProperty('isEnum');

      // Missing required fields case
      baseUserDto = new BaseUserDto();
      const missingFieldsErrors = await validate(baseUserDto);
      expect(missingFieldsErrors).toHaveLength(3);
      expect(missingFieldsErrors.some(error => error.property === 'firstName')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'lastName')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'email')).toBe(true);

      // Valid with only required fields
      baseUserDto.firstName = 'John';
      baseUserDto.lastName = 'Doe';
      baseUserDto.email = 'john@example.com';
      const validMinimalErrors = await validate(baseUserDto);
      expect(validMinimalErrors).toHaveLength(0);
    });
  });

  describe('transformation', () => {
    it('should handle all transformation scenarios', () => {
      // Role transformation with different cases
      const roleCases = [
        { input: 'ADMIN', expected: UserRole.ADMIN },
        { input: 'admin', expected: UserRole.ADMIN },
        { input: 'Admin', expected: UserRole.ADMIN },
      ];

      roleCases.forEach(({ input, expected }) => {
        const data = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: input,
        };
        const dtoObject = plainToClass(BaseUserDto, data);
        expect(dtoObject.role).toBe(expected);
      });

      // Optional fields with various values
      const dataWithOptionalFields = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: undefined,
        phoneNumber: null,
        address: '',
      };

      const dtoObject = plainToClass(BaseUserDto, dataWithOptionalFields);
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeNull();
      expect(dtoObject.address).toBe('');
    });
  });
});

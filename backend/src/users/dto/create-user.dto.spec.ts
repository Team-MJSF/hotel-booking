import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('CreateUserDto', () => {
  let createUserDto: CreateUserDto;

  beforeEach(() => {
    createUserDto = new CreateUserDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid DTO case
      createUserDto.firstName = 'John';
      createUserDto.lastName = 'Doe';
      createUserDto.email = 'john@example.com';
      createUserDto.password = 'Password123!';
      createUserDto.confirmPassword = 'Password123!';
      createUserDto.role = UserRole.USER;
      createUserDto.phoneNumber = '+12345678901';
      createUserDto.address = '123 Main St';

      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(0);

      // Invalid email case
      createUserDto.email = 'invalid-email';
      const emailErrors = await validate(createUserDto);
      expect(emailErrors).toHaveLength(1);
      expect(emailErrors[0].constraints).toHaveProperty('isEmail');

      // Invalid password case - too short
      createUserDto.email = 'john@example.com';
      createUserDto.password = 'short';
      const shortPasswordErrors = await validate(createUserDto);
      expect(shortPasswordErrors).toHaveLength(1);
      expect(shortPasswordErrors[0].constraints).toHaveProperty('minLength');

      // Invalid password case - missing special character
      createUserDto.password = 'Password123';
      const specialCharErrors = await validate(createUserDto);
      expect(specialCharErrors).toHaveLength(1);
      expect(specialCharErrors[0].constraints).toHaveProperty('matches');

      // Invalid role case
      createUserDto.password = 'Password123!';
      createUserDto.role = 'INVALID_ROLE' as UserRole;
      const roleErrors = await validate(createUserDto);
      expect(roleErrors).toHaveLength(1);
      expect(roleErrors[0].constraints).toHaveProperty('isEnum');

      // Invalid phone number case
      createUserDto.role = UserRole.USER;
      createUserDto.phoneNumber = '123';
      const phoneErrors = await validate(createUserDto);
      expect(phoneErrors).toHaveLength(1);
      expect(phoneErrors[0].constraints).toHaveProperty('isPhoneNumber');

      // Missing required fields case
      createUserDto = new CreateUserDto();
      const missingFieldsErrors = await validate(createUserDto);
      expect(missingFieldsErrors).toHaveLength(5);
      expect(missingFieldsErrors.some(error => error.property === 'firstName')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'lastName')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'email')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'password')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'confirmPassword')).toBe(true);
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
          password: 'Password123!',
          role: input,
        };
        const dtoObject = plainToClass(CreateUserDto, data);
        expect(dtoObject.role).toBe(expected);
      });

      // Optional fields with various values
      const dataWithOptionalFields = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: undefined,
        phoneNumber: null,
        address: '',
      };

      const dtoObject = plainToClass(CreateUserDto, dataWithOptionalFields);
      expect(dtoObject.role).toBeUndefined();
      expect(dtoObject.phoneNumber).toBeNull();
      expect(dtoObject.address).toBe('');
    });
  });
});

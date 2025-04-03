import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';
import { UserRole } from '../entities/user.entity';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('UpdateUserDto', () => {
  let updateUserDto: UpdateUserDto;

  beforeEach(() => {
    updateUserDto = new UpdateUserDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid DTO case
      updateUserDto.firstName = 'John';
      updateUserDto.lastName = 'Doe';
      updateUserDto.email = 'john@example.com';
      updateUserDto.password = 'Password123!';
      updateUserDto.role = UserRole.USER;
      updateUserDto.phoneNumber = '1234567890';
      updateUserDto.address = '123 Main St';

      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);

      // Invalid email case
      updateUserDto.email = 'invalid-email';
      const emailErrors = await validate(updateUserDto);
      expect(emailErrors).toHaveLength(1);
      expect(emailErrors[0].constraints).toHaveProperty('isEmail');

      // Invalid password case - too short
      updateUserDto.email = 'john@example.com';
      updateUserDto.password = 'short';
      const shortPasswordErrors = await validate(updateUserDto);
      expect(shortPasswordErrors).toHaveLength(1);
      expect(shortPasswordErrors[0].constraints).toHaveProperty('minLength');

      // Invalid password case - missing special character
      updateUserDto.password = 'Password123';
      const specialCharErrors = await validate(updateUserDto);
      expect(specialCharErrors).toHaveLength(1);
      expect(specialCharErrors[0].constraints).toHaveProperty('matches');

      // Invalid role case
      updateUserDto.password = 'Password123!';
      updateUserDto.role = 'INVALID_ROLE' as UserRole;
      const roleErrors = await validate(updateUserDto);
      expect(roleErrors).toHaveLength(1);
      expect(roleErrors[0].constraints).toHaveProperty('isEnum');

      // Invalid phone number case
      updateUserDto.role = UserRole.USER;
      updateUserDto.phoneNumber = '123';
      const phoneErrors = await validate(updateUserDto);
      expect(phoneErrors).toHaveLength(1);
      expect(phoneErrors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('transformation', () => {
    it('should handle all transformation scenarios', async () => {
      // Only firstName update case
      updateUserDto.firstName = 'John';
      const firstNameErrors = await validate(updateUserDto);
      expect(firstNameErrors).toHaveLength(0);

      // Only email update case
      updateUserDto = new UpdateUserDto();
      updateUserDto.email = 'john@example.com';
      const emailErrors = await validate(updateUserDto);
      expect(emailErrors).toHaveLength(0);

      // Only password update case
      updateUserDto = new UpdateUserDto();
      updateUserDto.password = 'Password123!';
      const passwordErrors = await validate(updateUserDto);
      expect(passwordErrors).toHaveLength(0);

      // Only role update case
      updateUserDto = new UpdateUserDto();
      updateUserDto.role = UserRole.ADMIN;
      const roleErrors = await validate(updateUserDto);
      expect(roleErrors).toHaveLength(0);

      // Empty DTO case
      updateUserDto = new UpdateUserDto();
      const emptyErrors = await validate(updateUserDto);
      expect(emptyErrors).toHaveLength(0);
    });
  });
}); 
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAdminDto } from './create-admin.dto';

describe('CreateAdminDto', () => {
  describe('validation', () => {
    it('should validate all CreateAdminDto constraints correctly', async () => {
      // Scenario 1: Valid DTO with all fields
      const fullDto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phoneNumber: '+1234567890',
        address: '123 Main St, City, Country',
      });
      const fullErrors = await validate(fullDto);
      expect(fullErrors.length).toBe(0);
      
      // Scenario 2: Valid DTO with only required fields
      const minimalDto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
      });
      const minimalErrors = await validate(minimalDto);
      expect(minimalErrors.length).toBe(0);
      
      // Scenario 3: Missing required fields
      const emptyDto = plainToInstance(CreateAdminDto, {});
      const emptyErrors = await validate(emptyDto);
      expect(emptyErrors.length).toBeGreaterThan(0);
      const missingFields = emptyErrors.map(e => e.property);
      expect(missingFields).toContain('firstName');
      expect(missingFields).toContain('lastName');
      expect(missingFields).toContain('email');
      expect(missingFields).toContain('password');
      expect(missingFields).toContain('confirmPassword');
      
      // Scenario 4: Invalid email format
      const invalidEmailDto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'invalid-email',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
      });
      const emailErrors = await validate(invalidEmailDto);
      expect(emailErrors.length).toBeGreaterThan(0);
      const emailConstraints = emailErrors.find(e => e.property === 'email').constraints;
      expect(Object.keys(emailConstraints)).toContain('isEmail');
      
      // Scenario 5: Password too short
      const shortPasswordDto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'short',
        confirmPassword: 'short',
      });
      const passwordErrors = await validate(shortPasswordDto);
      expect(passwordErrors.length).toBeGreaterThan(0);
      const passwordConstraints = passwordErrors.find(e => e.property === 'password').constraints;
      expect(Object.keys(passwordConstraints)).toContain('minLength');
      
      // Scenario 6: Passwords don't match
      const mismatchedPasswordDto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'DifferentPass456!',
      });
      const mismatchErrors = await validate(mismatchedPasswordDto);
      expect(mismatchErrors.length).toBeGreaterThan(0);
      const confirmPassConstraints = mismatchErrors.find(e => e.property === 'confirmPassword').constraints;
      expect(Object.keys(confirmPassConstraints)).toContain('passwordMatch');
      
      // Scenario 7: Invalid phoneNumber type
      const invalidPhoneDto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phoneNumber: 12345, // Invalid: should be a string
      });
      const phoneErrors = await validate(invalidPhoneDto);
      expect(phoneErrors.length).toBeGreaterThan(0);
      const phoneConstraints = phoneErrors.find(e => e.property === 'phoneNumber').constraints;
      expect(Object.keys(phoneConstraints)).toContain('isString');
      
      // Scenario 8: Invalid address type
      const invalidAddressDto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        address: 12345, // Invalid: should be a string
      });
      const addressErrors = await validate(invalidAddressDto);
      expect(addressErrors.length).toBeGreaterThan(0);
      const addressConstraints = addressErrors.find(e => e.property === 'address').constraints;
      expect(Object.keys(addressConstraints)).toContain('isString');
    });
  });

  describe('transformation', () => {
    it('should correctly transform plain object to class instance', () => {
      const plainObject = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phoneNumber: '+1234567890',
        address: '123 Main St, City, Country',
      };

      const dto = plainToInstance(CreateAdminDto, plainObject);

      expect(dto).toBeInstanceOf(CreateAdminDto);
      expect(dto.firstName).toBe(plainObject.firstName);
      expect(dto.lastName).toBe(plainObject.lastName);
      expect(dto.email).toBe(plainObject.email);
      expect(dto.password).toBe(plainObject.password);
      expect(dto.confirmPassword).toBe(plainObject.confirmPassword);
      expect(dto.phoneNumber).toBe(plainObject.phoneNumber);
      expect(dto.address).toBe(plainObject.address);
    });
  });
});

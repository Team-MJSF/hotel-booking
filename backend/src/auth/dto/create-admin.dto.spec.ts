import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAdminDto } from './create-admin.dto';

describe('CreateAdminDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const dto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phoneNumber: '+1234567890',
        address: '123 Main St, City, Country'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should validate required fields', async () => {
      // Arrange
      const dto = plainToInstance(CreateAdminDto, {});

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map(e => e.property)).toContain('firstName');
      expect(errors.map(e => e.property)).toContain('lastName');
      expect(errors.map(e => e.property)).toContain('email');
      expect(errors.map(e => e.property)).toContain('password');
      expect(errors.map(e => e.property)).toContain('confirmPassword');
    });

    it('should validate email format', async () => {
      // Arrange
      const dto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'invalid-email',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const emailErrors = errors.find(e => e.property === 'email');
      expect(emailErrors).toBeDefined();
      expect(Object.keys(emailErrors.constraints)).toContain('isEmail');
    });

    it('should validate password minimum length', async () => {
      // Arrange
      const dto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'short',
        confirmPassword: 'short'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const passwordErrors = errors.find(e => e.property === 'password');
      expect(passwordErrors).toBeDefined();
      expect(Object.keys(passwordErrors.constraints)).toContain('minLength');
    });

    it('should validate that passwords match', async () => {
      // Arrange
      const dto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'DifferentPass456!'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const confirmPasswordErrors = errors.find(e => e.property === 'confirmPassword');
      expect(confirmPasswordErrors).toBeDefined();
      expect(Object.keys(confirmPasswordErrors.constraints)).toContain('passwordMatch');
    });

    it('should allow optional fields to be omitted', async () => {
      // Arrange
      const dto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!'
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should validate phoneNumber as string when provided', async () => {
      // Arrange
      const dto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phoneNumber: 12345 // Invalid: should be a string
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const phoneNumberErrors = errors.find(e => e.property === 'phoneNumber');
      expect(phoneNumberErrors).toBeDefined();
      expect(Object.keys(phoneNumberErrors.constraints)).toContain('isString');
    });

    it('should validate address as string when provided', async () => {
      // Arrange
      const dto = plainToInstance(CreateAdminDto, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        address: 12345 // Invalid: should be a string
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const addressErrors = errors.find(e => e.property === 'address');
      expect(addressErrors).toBeDefined();
      expect(Object.keys(addressErrors.constraints)).toContain('isString');
    });
  });

  describe('transformation', () => {
    it('should correctly transform plain object to class instance', () => {
      // Arrange
      const plainObject = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phoneNumber: '+1234567890',
        address: '123 Main St, City, Country'
      };

      // Act
      const dto = plainToInstance(CreateAdminDto, plainObject);

      // Assert
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
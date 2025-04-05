import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RegisterDto } from './register.dto';

// Define interface for RegisterDto with extra field
interface RegisterDtoWithExtra extends RegisterDto {
  extraField?: string;
}

// Increase timeout for all tests
jest.setTimeout(10000);

describe('RegisterDto', () => {
  let registerDto: RegisterDto;

  beforeEach(() => {
    registerDto = new RegisterDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid data cases
      const validTestCases = [
        {
          description: 'all valid fields',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          },
        },
        {
          description: 'valid email formats',
          data: [
            'user@example.com',
            'user.name@example.com',
            'user+tag@example.com',
            'user@subdomain.example.com',
            'user@example.co.uk',
            'user@example.io',
          ].map(email => ({
            firstName: 'John',
            lastName: 'Doe',
            email,
            password: 'password123',
            confirmPassword: 'password123',
          })),
        },
        {
          description: 'valid password formats',
          data: ['password123', 'P@ssw0rd', '12345678', 'verylongpassword', 'pass123word'].map(
            password => ({
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              password,
              confirmPassword: password,
            }),
          ),
        },
        {
          description: 'valid name formats',
          data: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Mary-Jane', lastName: 'Smith-Jones' },
            { firstName: 'Jean-Pierre', lastName: "O'Connor" },
            { firstName: 'José', lastName: 'González' },
            { firstName: 'Иван', lastName: 'Петров' },
          ].map(({ firstName, lastName }) => ({
            firstName,
            lastName,
            email: 'user@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          })),
        },
      ];

      for (const { description, data } of validTestCases) {
        const dataArray = Array.isArray(data) ? data : [data];
        for (const item of dataArray) {
          registerDto = plainToClass(RegisterDto, item);
          const errors = await validate(registerDto);
          expect(errors.length).toBe(0);
        }
      }

      // Invalid data cases
      const invalidTestCases = [
        {
          description: 'missing required fields',
          data: {
            firstName: 'John',
            lastName: 'Doe',
          },
          expectedErrors: ['email', 'password', 'confirmPassword'],
        },
        {
          description: 'empty first name',
          data: {
            firstName: '',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          },
          expectedErrors: ['firstName'],
        },
        {
          description: 'empty last name',
          data: {
            firstName: 'John',
            lastName: '',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          },
          expectedErrors: ['lastName'],
        },
        {
          description: 'invalid email format',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'not-an-email',
            password: 'password123',
            confirmPassword: 'password123',
          },
          expectedErrors: ['email'],
        },
        {
          description: 'empty email',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: '',
            password: 'password123',
            confirmPassword: 'password123',
          },
          expectedErrors: ['email'],
        },
        {
          description: 'password too short',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'short',
            confirmPassword: 'short',
          },
          expectedErrors: ['password', 'confirmPassword'],
        },
        {
          description: 'mismatched passwords',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'differentpassword',
          },
          expectedErrors: ['confirmPassword'],
        },
      ];

      for (const { description, data, expectedErrors } of invalidTestCases) {
        registerDto = plainToClass(RegisterDto, data);
        const errors = await validate(registerDto);
        expect(errors.length).toBeGreaterThan(0);
        expectedErrors.forEach(property => {
          const hasError = errors.some(error => error.property === property);
          expect(hasError).toBe(true);
        });
      }
    });
  });

  describe('transformation', () => {
    it('should handle all transformation cases correctly', () => {
      const testCases = [
        {
          description: 'basic transformation',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          },
          assertions: (dto: RegisterDto) => {
            expect(dto.firstName).toBe('John');
            expect(dto.lastName).toBe('Doe');
            expect(dto.email).toBe('john@example.com');
            expect(dto.password).toBe('password123');
            expect(dto.confirmPassword).toBe('password123');
          },
        },
        {
          description: 'undefined values',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: undefined,
            password: 'password123',
            confirmPassword: 'password123',
          },
          assertions: (dto: RegisterDto) => {
            expect(dto.email).toBeUndefined();
          },
        },
        {
          description: 'null values',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: null,
            password: 'password123',
            confirmPassword: 'password123',
          },
          assertions: (dto: RegisterDto) => {
            expect(dto.email).toBeNull();
          },
        },
        {
          description: 'empty string values',
          data: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
          },
          assertions: (dto: RegisterDto) => {
            expect(dto.firstName).toBe('');
            expect(dto.lastName).toBe('');
            expect(dto.email).toBe('');
            expect(dto.password).toBe('');
            expect(dto.confirmPassword).toBe('');
          },
        },
        {
          description: 'extra properties',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            extraField: 'extra value',
          },
          assertions: (dto: RegisterDtoWithExtra) => {
            expect(dto).toHaveProperty('extraField');
            expect(dto.extraField).toBe('extra value');
          },
        },
      ];

      for (const { description, data, assertions } of testCases) {
        const dtoObject = plainToClass(RegisterDto, data) as RegisterDtoWithExtra;
        expect(dtoObject).toBeInstanceOf(RegisterDto);
        assertions(dtoObject);
      }
    });
  });
});

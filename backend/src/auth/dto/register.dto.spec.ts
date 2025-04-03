import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const testCases = [
        {
          description: 'all valid fields',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123'
          }
        },
        {
          description: 'valid email formats',
          data: [
            'user@example.com',
            'user.name@example.com',
            'user+tag@example.com',
            'user@subdomain.example.com',
            'user@example.co.uk',
            'user@example.io'
          ].map(email => ({
            firstName: 'John',
            lastName: 'Doe',
            email,
            password: 'password123',
            confirmPassword: 'password123'
          }))
        },
        {
          description: 'valid password formats',
          data: [
            'password123',
            'P@ssw0rd',
            '12345678',
            'verylongpassword',
            'pass123word'
          ].map(password => ({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password,
            confirmPassword: password
          }))
        },
        {
          description: 'valid name formats',
          data: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Mary-Jane', lastName: 'Smith-Jones' },
            { firstName: 'Jean-Pierre', lastName: "O'Connor" },
            { firstName: 'José', lastName: 'González' },
            { firstName: 'Иван', lastName: 'Петров' }
          ].map(({ firstName, lastName }) => ({
            firstName,
            lastName,
            email: 'user@example.com',
            password: 'password123',
            confirmPassword: 'password123'
          }))
        }
      ];

      for (const { description, data } of testCases) {
        const dataArray = Array.isArray(data) ? data : [data];
        for (const item of dataArray) {
          const dtoObject = plainToClass(RegisterDto, item);
          const errors = await validate(dtoObject);
          const message = `Failed for case: ${description}`;
          expect(errors.length).toBe(0);
          if (errors.length > 0) {
            console.error(message, errors);
          }
        }
      }
    });

    it('should fail validation for invalid data', async () => {
      const testCases = [
        {
          description: 'missing required fields',
          data: {
            firstName: 'John',
            lastName: 'Doe'
          },
          expectedErrors: ['email', 'password', 'confirmPassword']
        },
        {
          description: 'empty first name',
          data: {
            firstName: '',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123'
          },
          expectedErrors: ['firstName']
        },
        {
          description: 'empty last name',
          data: {
            firstName: 'John',
            lastName: '',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123'
          },
          expectedErrors: ['lastName']
        },
        {
          description: 'invalid email format',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'not-an-email',
            password: 'password123',
            confirmPassword: 'password123'
          },
          expectedErrors: ['email']
        },
        {
          description: 'empty email',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: '',
            password: 'password123',
            confirmPassword: 'password123'
          },
          expectedErrors: ['email']
        },
        {
          description: 'password too short',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'short',
            confirmPassword: 'short'
          },
          expectedErrors: ['password', 'confirmPassword']
        },
        {
          description: 'mismatched passwords',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'differentpassword'
          },
          expectedErrors: ['confirmPassword']
        }
      ];

      for (const { description, data, expectedErrors } of testCases) {
        const dtoObject = plainToClass(RegisterDto, data);
        const errors = await validate(dtoObject);
        const message = `No errors found for invalid case: ${description}`;
        expect(errors.length).toBeGreaterThan(0);
        if (errors.length === 0) {
          console.error(message);
        }
        expectedErrors.forEach(property => {
          const message = `Expected error for property ${property} in case: ${description}`;
          const hasError = errors.some(error => error.property === property);
          expect(hasError).toBe(true);
          if (!hasError) {
            console.error(message);
          }
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
            confirmPassword: 'password123'
          },
          assertions: (dto: RegisterDto) => {
            expect(dto.firstName).toBe('John');
            expect(dto.lastName).toBe('Doe');
            expect(dto.email).toBe('john@example.com');
            expect(dto.password).toBe('password123');
            expect(dto.confirmPassword).toBe('password123');
          }
        },
        {
          description: 'undefined values',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: undefined,
            password: 'password123',
            confirmPassword: 'password123'
          },
          assertions: (dto: RegisterDto) => {
            expect(dto.email).toBeUndefined();
          }
        },
        {
          description: 'null values',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: null,
            password: 'password123',
            confirmPassword: 'password123'
          },
          assertions: (dto: RegisterDto) => {
            expect(dto.email).toBeNull();
          }
        },
        {
          description: 'empty string values',
          data: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
          },
          assertions: (dto: RegisterDto) => {
            expect(dto.firstName).toBe('');
            expect(dto.lastName).toBe('');
            expect(dto.email).toBe('');
            expect(dto.password).toBe('');
            expect(dto.confirmPassword).toBe('');
          }
        },
        {
          description: 'extra properties',
          data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            extraField: 'extra value'
          },
          assertions: (dto: RegisterDto) => {
            expect(dto).toHaveProperty('extraField');
            expect((dto as any).extraField).toBe('extra value');
          }
        }
      ];

      for (const { description, data, assertions } of testCases) {
        const dtoObject = plainToClass(RegisterDto, data);
        const message = `Failed instanceof check for: ${description}`;
        expect(dtoObject).toBeInstanceOf(RegisterDto);
        if (!(dtoObject instanceof RegisterDto)) {
          console.error(message);
        }
        assertions(dtoObject);
      }
    });
  });
}); 
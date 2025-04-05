import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProfileDto } from './profile.dto';
import { UserRole } from '../../users/entities/user.entity';

describe('ProfileDto', () => {
  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid cases
      const validScenarios = [
        {
          data: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: UserRole.USER,
            phoneNumber: '+1234567890',
            address: '123 Main St',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          shouldPass: true,
        },
        {
          data: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          shouldPass: true,
        },
        {
          data: {
            id: 1,
            firstName: 'Mary-Jane',
            lastName: 'Smith-Jones',
            email: 'mary@example.com',
            role: UserRole.ADMIN,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          shouldPass: true,
        },
      ];

      // Invalid cases
      const invalidScenarios = [
        {
          data: {
            id: 1,
            firstName: 'John',
            // Missing required fields
          },
          expectedErrors: ['lastName', 'email'],
        },
        {
          data: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'not-an-email',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expectedErrors: ['email'],
        },
        {
          data: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'invalid_role',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expectedErrors: ['role'],
        },
      ];

      // Test valid scenarios
      for (const scenario of validScenarios) {
        const dtoObject = plainToClass(ProfileDto, scenario.data);
        const errors = await validate(dtoObject);
        expect(errors.length).toBe(0);
      }

      // Test invalid scenarios
      for (const scenario of invalidScenarios) {
        const dtoObject = plainToClass(ProfileDto, scenario.data);
        const errors = await validate(dtoObject);
        expect(errors.length).toBeGreaterThan(0);
        scenario.expectedErrors.forEach(errorProperty => {
          expect(errors.some(error => error.property === errorProperty)).toBe(true);
        });
      }
    });
  });

  describe('transformation', () => {
    it('should handle all transformation scenarios', () => {
      const transformationScenarios = [
        {
          input: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: UserRole.USER,
            phoneNumber: '+1234567890',
            address: '123 Main St',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          expected: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: UserRole.USER,
            phoneNumber: '+1234567890',
            address: '123 Main St',
          },
        },
        {
          input: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: undefined,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
          expected: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: undefined,
          },
        },
        {
          input: {
            id: 1,
            firstName: '',
            lastName: 'Doe',
            email: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
          expected: {
            id: 1,
            firstName: '',
            lastName: 'Doe',
            email: null,
          },
        },
      ];

      for (const scenario of transformationScenarios) {
        const dtoObject = plainToClass(ProfileDto, scenario.input);

        expect(dtoObject).toBeInstanceOf(ProfileDto);
        expect(dtoObject.id).toBe(scenario.expected.id);
        expect(dtoObject.firstName).toBe(scenario.expected.firstName);
        expect(dtoObject.lastName).toBe(scenario.expected.lastName);
        expect(dtoObject.email).toBe(scenario.expected.email);

        if (scenario.input.role) {
          expect(dtoObject.role).toBe(scenario.input.role);
        }
        if (scenario.input.phoneNumber) {
          expect(dtoObject.phoneNumber).toBe(scenario.input.phoneNumber);
        }
        if (scenario.input.address) {
          expect(dtoObject.address).toBe(scenario.input.address);
        }

        expect(dtoObject.createdAt).toBeInstanceOf(Date);
        expect(dtoObject.updatedAt).toBeInstanceOf(Date);
      }
    });
  });
});

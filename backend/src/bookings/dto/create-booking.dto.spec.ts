import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateBookingDto } from './create-booking.dto';

describe('CreateBookingDto', () => {
  describe('validation', () => {
    it('should pass validation with all required fields', async () => {
      const validData = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2
      };

      const dtoObject = plainToClass(CreateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields including optional ones', async () => {
      const validData = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
        specialRequests: 'Please provide extra towels'
      };

      const dtoObject = plainToClass(CreateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        userId: 1,
        roomId: 101,
        // checkInDate, checkOutDate, and numberOfGuests are missing
      };

      const dtoObject = plainToClass(CreateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'checkInDate')).toBe(true);
      expect(errors.some(error => error.property === 'checkOutDate')).toBe(true);
      expect(errors.some(error => error.property === 'numberOfGuests')).toBe(true);
    });

    it('should fail validation with invalid user ID', async () => {
      const invalidData = {
        userId: 'not-a-number',
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2
      };

      const dtoObject = plainToClass(CreateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userId');
    });

    it('should fail validation with invalid room ID', async () => {
      const invalidData = {
        userId: 1,
        roomId: 'not-a-number',
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2
      };

      const dtoObject = plainToClass(CreateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('roomId');
    });

    it('should fail validation with invalid check-in date', async () => {
      const invalidData = {
        userId: 1,
        roomId: 101,
        checkInDate: 'not-a-date',
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2
      };

      const dtoObject = plainToClass(CreateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('checkInDate');
    });

    it('should fail validation with invalid check-out date', async () => {
      const invalidData = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: 'not-a-date',
        numberOfGuests: 2
      };

      const dtoObject = plainToClass(CreateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('checkOutDate');
    });

    it('should fail validation with invalid number of guests', async () => {
      const invalidData = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 'not-a-number'
      };

      const dtoObject = plainToClass(CreateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('numberOfGuests');
    });

    it('should pass validation with valid special requests', async () => {
      const validData = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
        specialRequests: 'Please provide extra towels'
      };

      const dtoObject = plainToClass(CreateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid date strings', async () => {
      const validData = {
        userId: 1,
        roomId: 101,
        checkInDate: '2024-03-20',
        checkOutDate: '2024-03-25',
        numberOfGuests: 2
      };

      const dtoObject = plainToClass(CreateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
      expect(dtoObject.checkInDate instanceof Date).toBe(true);
      expect(dtoObject.checkOutDate instanceof Date).toBe(true);
    });
  });
}); 
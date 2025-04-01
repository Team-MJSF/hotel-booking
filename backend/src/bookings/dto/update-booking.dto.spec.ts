import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateBookingDto } from './update-booking.dto';

describe('UpdateBookingDto', () => {
  describe('validation', () => {
    it('should pass validation with no fields (empty update)', async () => {
      const validData = {};

      const dtoObject = plainToClass(UpdateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with single field update', async () => {
      const validData = {
        numberOfGuests: 3
      };

      const dtoObject = plainToClass(UpdateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with multiple fields update', async () => {
      const validData = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        specialRequests: 'Updated request'
      };

      const dtoObject = plainToClass(UpdateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields populated', async () => {
      const validData = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
        specialRequests: 'Updated request'
      };

      const dtoObject = plainToClass(UpdateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid user ID', async () => {
      const invalidData = {
        userId: 'not-a-number'
      };

      const dtoObject = plainToClass(UpdateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userId');
    });

    it('should fail validation with invalid room ID', async () => {
      const invalidData = {
        roomId: 'not-a-number'
      };

      const dtoObject = plainToClass(UpdateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('roomId');
    });

    it('should fail validation with invalid check-in date', async () => {
      const invalidData = {
        checkInDate: 'not-a-date'
      };

      const dtoObject = plainToClass(UpdateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('checkInDate');
    });

    it('should fail validation with invalid check-out date', async () => {
      const invalidData = {
        checkOutDate: 'not-a-date'
      };

      const dtoObject = plainToClass(UpdateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('checkOutDate');
    });

    it('should fail validation with invalid number of guests', async () => {
      const invalidData = {
        numberOfGuests: 'not-a-number'
      };

      const dtoObject = plainToClass(UpdateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('numberOfGuests');
    });

    it('should pass validation with valid special requests', async () => {
      const validData = {
        specialRequests: 'Updated request'
      };

      const dtoObject = plainToClass(UpdateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid date strings', async () => {
      const validData = {
        checkInDate: '2024-03-20',
        checkOutDate: '2024-03-25'
      };

      const dtoObject = plainToClass(UpdateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
      expect(dtoObject.checkInDate instanceof Date).toBe(true);
      expect(dtoObject.checkOutDate instanceof Date).toBe(true);
    });
  });
}); 
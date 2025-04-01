import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateBookingDto } from './update-booking.dto';

describe('UpdateBookingDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        userId: 1,
        roomId: 2,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 86400000), // Tomorrow
        numberOfGuests: 2,
        specialRequests: 'Late check-in requested'
      };

      const dtoObject = plainToClass(UpdateBookingDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial data', async () => {
      const partialData = {
        checkInDate: new Date(),
        numberOfGuests: 2
      };

      const dtoObject = plainToClass(UpdateBookingDto, partialData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty object', async () => {
      const emptyData = {};

      const dtoObject = plainToClass(UpdateBookingDto, emptyData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid date format', async () => {
      const invalidData = {
        checkInDate: 'not-a-date'
      };

      const dtoObject = plainToClass(UpdateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('checkInDate');
    });

    it('should fail validation with invalid number format', async () => {
      const invalidData = {
        userId: 'not-a-number'
      };

      const dtoObject = plainToClass(UpdateBookingDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userId');
    });
  });

  describe('transformation', () => {
    it('should transform plain object to UpdateBookingDto instance', () => {
      const plainData = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        specialRequests: 'Late check-in requested'
      };

      const dtoObject = plainToClass(UpdateBookingDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateBookingDto);
      expect(dtoObject.userId).toBe(plainData.userId);
      expect(dtoObject.roomId).toBe(plainData.roomId);
      expect(dtoObject.checkInDate).toEqual(new Date(plainData.checkInDate));
      expect(dtoObject.checkOutDate).toEqual(new Date(plainData.checkOutDate));
      expect(dtoObject.numberOfGuests).toBe(plainData.numberOfGuests);
      expect(dtoObject.specialRequests).toBe(plainData.specialRequests);
    });

    it('should handle undefined values', () => {
      const plainData = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        specialRequests: undefined
      };

      const dtoObject = plainToClass(UpdateBookingDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateBookingDto);
      expect(dtoObject.specialRequests).toBeUndefined();
    });

    it('should handle null values', () => {
      const plainData = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        specialRequests: null
      };

      const dtoObject = plainToClass(UpdateBookingDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateBookingDto);
      expect(dtoObject.specialRequests).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        specialRequests: ''
      };

      const dtoObject = plainToClass(UpdateBookingDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateBookingDto);
      expect(dtoObject.specialRequests).toBe('');
    });

    it('should handle date string conversion', () => {
      const plainData = {
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z'
      };

      const dtoObject = plainToClass(UpdateBookingDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateBookingDto);
      expect(dtoObject.checkInDate).toBeInstanceOf(Date);
      expect(dtoObject.checkOutDate).toBeInstanceOf(Date);
      expect(dtoObject.checkInDate).toEqual(new Date(plainData.checkInDate));
      expect(dtoObject.checkOutDate).toEqual(new Date(plainData.checkOutDate));
    });

    it('should handle number conversion', () => {
      const plainData = {
        userId: '1',
        roomId: '2',
        numberOfGuests: '2'
      };

      const dtoObject = plainToClass(UpdateBookingDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateBookingDto);
      expect(typeof dtoObject.userId).toBe('number');
      expect(typeof dtoObject.roomId).toBe('number');
      expect(typeof dtoObject.numberOfGuests).toBe('number');
    });

    it('should ignore extra properties', () => {
      const plainData = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(UpdateBookingDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateBookingDto);
      expect(dtoObject.userId).toBe(plainData.userId);
      expect(dtoObject.roomId).toBe(plainData.roomId);
      expect(dtoObject.checkInDate).toEqual(new Date(plainData.checkInDate));
      expect(dtoObject.checkOutDate).toEqual(new Date(plainData.checkOutDate));
      expect(dtoObject.numberOfGuests).toBe(plainData.numberOfGuests);
      // Extra properties are automatically ignored by class-transformer
    });

    it('should handle partial updates', () => {
      const plainData = {
        checkInDate: '2024-01-01T00:00:00.000Z',
        numberOfGuests: 2
      };

      const dtoObject = plainToClass(UpdateBookingDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateBookingDto);
      expect(dtoObject.checkInDate).toEqual(new Date(plainData.checkInDate));
      expect(dtoObject.numberOfGuests).toBe(plainData.numberOfGuests);
      expect(dtoObject.userId).toBeUndefined();
      expect(dtoObject.roomId).toBeUndefined();
      expect(dtoObject.checkOutDate).toBeUndefined();
      expect(dtoObject.specialRequests).toBeUndefined();
    });
  });
}); 
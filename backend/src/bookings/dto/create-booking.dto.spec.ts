import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateBookingDto } from './create-booking.dto';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('CreateBookingDto', () => {
  let createBookingDto: CreateBookingDto;

  beforeEach(() => {
    createBookingDto = new CreateBookingDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid DTO case
      createBookingDto.userId = 1;
      createBookingDto.roomId = 101;
      createBookingDto.checkInDate = new Date('2024-03-20');
      createBookingDto.checkOutDate = new Date('2024-03-25');
      createBookingDto.numberOfGuests = 2;
      createBookingDto.specialRequests = 'Please provide extra towels';

      const errors = await validate(createBookingDto);
      expect(errors).toHaveLength(0);

      // Invalid userId case
      createBookingDto.userId = 'not-a-number' as unknown as number;
      const userIdErrors = await validate(createBookingDto);
      expect(userIdErrors).toHaveLength(1);
      expect(userIdErrors[0].constraints).toHaveProperty('isNumber');

      // Invalid roomId case
      createBookingDto.userId = 1;
      createBookingDto.roomId = 'not-a-number' as unknown as number;
      const roomIdErrors = await validate(createBookingDto);
      expect(roomIdErrors).toHaveLength(1);
      expect(roomIdErrors[0].constraints).toHaveProperty('isNumber');

      // Invalid checkInDate case
      createBookingDto.roomId = 101;
      createBookingDto.checkInDate = 'not-a-date' as unknown as Date;
      const checkInDateErrors = await validate(createBookingDto);
      expect(checkInDateErrors).toHaveLength(1);
      expect(checkInDateErrors[0].constraints).toHaveProperty('isDate');

      // Invalid checkOutDate case
      createBookingDto.checkInDate = new Date('2024-03-20');
      createBookingDto.checkOutDate = 'not-a-date' as unknown as Date;
      const checkOutDateErrors = await validate(createBookingDto);
      expect(checkOutDateErrors).toHaveLength(1);
      expect(checkOutDateErrors[0].constraints).toHaveProperty('isDate');

      // Invalid numberOfGuests case
      createBookingDto.checkOutDate = new Date('2024-03-25');
      createBookingDto.numberOfGuests = 'not-a-number' as unknown as number;
      const numberOfGuestsErrors = await validate(createBookingDto);
      expect(numberOfGuestsErrors).toHaveLength(1);
      expect(numberOfGuestsErrors[0].constraints).toHaveProperty('isNumber');

      // Missing required fields case
      createBookingDto = new CreateBookingDto();
      const missingFieldsErrors = await validate(createBookingDto);
      expect(missingFieldsErrors).toHaveLength(5);
      expect(missingFieldsErrors.some(error => error.property === 'userId')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'roomId')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'checkInDate')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'checkOutDate')).toBe(true);
      expect(missingFieldsErrors.some(error => error.property === 'numberOfGuests')).toBe(true);
    });
  });

  describe('transformation', () => {
    it('should handle all transformation scenarios', () => {
      // Date string transformation
      const dataWithDateStrings = {
        userId: 1,
        roomId: 101,
        checkInDate: '2024-03-20',
        checkOutDate: '2024-03-25',
        numberOfGuests: 2
      };

      const dtoObject1 = plainToClass(CreateBookingDto, dataWithDateStrings);
      expect(dtoObject1.checkInDate instanceof Date).toBe(true);
      expect(dtoObject1.checkOutDate instanceof Date).toBe(true);
      expect(dtoObject1.checkInDate.getTime()).toBe(new Date('2024-03-20').getTime());
      expect(dtoObject1.checkOutDate.getTime()).toBe(new Date('2024-03-25').getTime());

      // Number string transformation
      const dataWithNumberStrings = {
        userId: '1',
        roomId: '101',
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: '2'
      };

      const dtoObject2 = plainToClass(CreateBookingDto, dataWithNumberStrings);
      expect(typeof dtoObject2.userId).toBe('number');
      expect(typeof dtoObject2.roomId).toBe('number');
      expect(typeof dtoObject2.numberOfGuests).toBe('number');
      expect(dtoObject2.userId).toBe(1);
      expect(dtoObject2.roomId).toBe(101);
      expect(dtoObject2.numberOfGuests).toBe(2);

      // Optional fields with various values
      const dataWithOptionalFields = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
        specialRequests: undefined
      };

      const dtoObject3 = plainToClass(CreateBookingDto, dataWithOptionalFields);
      expect(dtoObject3.specialRequests).toBeUndefined();

      const dataWithNullOptionalField = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
        specialRequests: null
      };

      const dtoObject4 = plainToClass(CreateBookingDto, dataWithNullOptionalField);
      expect(dtoObject4.specialRequests).toBeNull();

      const dataWithEmptyStringOptionalField = {
        userId: 1,
        roomId: 101,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
        specialRequests: ''
      };

      const dtoObject5 = plainToClass(CreateBookingDto, dataWithEmptyStringOptionalField);
      expect(dtoObject5.specialRequests).toBe('');
    });
  });
}); 
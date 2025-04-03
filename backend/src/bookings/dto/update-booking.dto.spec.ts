import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateBookingDto } from './update-booking.dto';

// Define interface for test data with extra properties
interface UpdateBookingDtoWithExtra extends UpdateBookingDto {
  extraField?: string;
}

// Increase timeout for all tests
jest.setTimeout(10000);

describe('UpdateBookingDto', () => {
  let updateBookingDto: UpdateBookingDto;

  beforeEach(() => {
    updateBookingDto = new UpdateBookingDto();
  });

  describe('validation', () => {
    it('should handle all validation scenarios', async () => {
      // Valid DTO case with all fields
      updateBookingDto.userId = 1;
      updateBookingDto.roomId = 2;
      updateBookingDto.checkInDate = new Date();
      updateBookingDto.checkOutDate = new Date(Date.now() + 86400000); // Tomorrow
      updateBookingDto.numberOfGuests = 2;
      updateBookingDto.specialRequests = 'Late check-in requested';

      const errors = await validate(updateBookingDto);
      expect(errors).toHaveLength(0);

      // Valid DTO case with partial fields
      updateBookingDto = new UpdateBookingDto();
      updateBookingDto.checkInDate = new Date();
      updateBookingDto.numberOfGuests = 2;

      const partialErrors = await validate(updateBookingDto);
      expect(partialErrors).toHaveLength(0);

      // Valid DTO case with empty object
      updateBookingDto = new UpdateBookingDto();
      const emptyErrors = await validate(updateBookingDto);
      expect(emptyErrors).toHaveLength(0);

      // Invalid userId case
      updateBookingDto.userId = 'not-a-number' as unknown as number;
      const userIdErrors = await validate(updateBookingDto);
      expect(userIdErrors).toHaveLength(1);
      expect(userIdErrors[0].constraints).toHaveProperty('isNumber');

      // Invalid roomId case
      updateBookingDto = new UpdateBookingDto();
      updateBookingDto.roomId = 'not-a-number' as unknown as number;
      const roomIdErrors = await validate(updateBookingDto);
      expect(roomIdErrors).toHaveLength(1);
      expect(roomIdErrors[0].constraints).toHaveProperty('isNumber');

      // Invalid checkInDate case
      updateBookingDto = new UpdateBookingDto();
      updateBookingDto.checkInDate = 'not-a-date' as unknown as Date;
      const checkInDateErrors = await validate(updateBookingDto);
      expect(checkInDateErrors).toHaveLength(1);
      expect(checkInDateErrors[0].constraints).toHaveProperty('isDate');

      // Invalid checkOutDate case
      updateBookingDto = new UpdateBookingDto();
      updateBookingDto.checkOutDate = 'not-a-date' as unknown as Date;
      const checkOutDateErrors = await validate(updateBookingDto);
      expect(checkOutDateErrors).toHaveLength(1);
      expect(checkOutDateErrors[0].constraints).toHaveProperty('isDate');

      // Invalid numberOfGuests case
      updateBookingDto = new UpdateBookingDto();
      updateBookingDto.numberOfGuests = 'not-a-number' as unknown as number;
      const numberOfGuestsErrors = await validate(updateBookingDto);
      expect(numberOfGuestsErrors).toHaveLength(1);
      expect(numberOfGuestsErrors[0].constraints).toHaveProperty('isNumber');
    });
  });

  describe('transformation', () => {
    it('should handle all transformation scenarios', async () => {
      // String number conversion
      const dataWithStringNumbers = {
        userId: '1',
        roomId: '2',
        numberOfGuests: '2'
      };

      const dtoObject1 = plainToClass(UpdateBookingDto, dataWithStringNumbers);
      expect(typeof dtoObject1.userId).toBe('number');
      expect(typeof dtoObject1.roomId).toBe('number');
      expect(typeof dtoObject1.numberOfGuests).toBe('number');
      expect(dtoObject1.userId).toBe(1);
      expect(dtoObject1.roomId).toBe(2);
      expect(dtoObject1.numberOfGuests).toBe(2);

      // Date string conversion
      const dataWithDateStrings = {
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z'
      };

      const dtoObject2 = plainToClass(UpdateBookingDto, dataWithDateStrings);
      expect(dtoObject2.checkInDate instanceof Date).toBe(true);
      expect(dtoObject2.checkOutDate instanceof Date).toBe(true);
      expect(dtoObject2.checkInDate.getTime()).toBe(new Date('2024-01-01T00:00:00.000Z').getTime());
      expect(dtoObject2.checkOutDate.getTime()).toBe(new Date('2024-01-02T00:00:00.000Z').getTime());

      // Optional fields with various values
      const dataWithUndefinedOptionalField = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        specialRequests: undefined
      };

      const dtoObject3 = plainToClass(UpdateBookingDto, dataWithUndefinedOptionalField);
      expect(dtoObject3.specialRequests).toBeUndefined();

      const dataWithNullOptionalField = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        specialRequests: null
      };

      const dtoObject4 = plainToClass(UpdateBookingDto, dataWithNullOptionalField);
      expect(dtoObject4.specialRequests).toBeNull();

      const dataWithEmptyStringOptionalField = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        specialRequests: ''
      };

      const dtoObject5 = plainToClass(UpdateBookingDto, dataWithEmptyStringOptionalField);
      expect(dtoObject5.specialRequests).toBe('');

      // Extra properties should be preserved but not validated
      const dataWithExtraProperties = {
        userId: 1,
        roomId: 2,
        checkInDate: '2024-01-01T00:00:00.000Z',
        checkOutDate: '2024-01-02T00:00:00.000Z',
        numberOfGuests: 2,
        extraField: 'extra value'
      };

      const dtoObject6 = plainToClass(UpdateBookingDto, dataWithExtraProperties) as UpdateBookingDtoWithExtra;
      expect(dtoObject6.extraField).toBe('extra value');
      
      // Validate that extra properties don't cause validation errors
      const errors = await validate(dtoObject6);
      expect(errors).toHaveLength(0);
    });
  });
}); 
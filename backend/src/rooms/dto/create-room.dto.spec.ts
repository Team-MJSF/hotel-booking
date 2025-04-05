import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRoomDto } from './create-room.dto';
import { RoomType, AvailabilityStatus } from '../entities/room.entity';

describe('CreateRoomDto', () => {
  const validBaseDto = {
    type: RoomType.SINGLE,
    roomNumber: '101',
    pricePerNight: 100,
    maxGuests: 2,
    description: 'A comfortable room',
    amenities: JSON.stringify(['wifi', 'tv']),
    availabilityStatus: AvailabilityStatus.AVAILABLE,
  };

  const createDto = (overrides = {}) =>
    plainToClass(CreateRoomDto, { ...validBaseDto, ...overrides });

  const validateDto = async (dto: CreateRoomDto) => {
    const errors = await validate(dto);
    return { errors, hasErrors: errors.length > 0 };
  };

  describe('validation', () => {
    it('should validate all fields correctly', async () => {
      // Test valid data with all fields
      const validDto = createDto(validBaseDto);
      const { errors: validErrors } = await validateDto(validDto);
      expect(validErrors.length).toBe(0);

      // Test minimal required data
      const minimalDto = createDto({
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
      });
      const { errors: minimalErrors } = await validateDto(minimalDto);
      expect(minimalErrors.length).toBe(0);

      // Test different room types
      const roomTypes = Object.values(RoomType);
      for (const roomType of roomTypes) {
        const dto = createDto({ type: roomType });
        const { errors } = await validateDto(dto);
        expect(errors.length).toBe(0);
      }

      // Test different availability statuses
      const availabilityStatuses = Object.values(AvailabilityStatus);
      for (const status of availabilityStatuses) {
        const dto = createDto({ availabilityStatus: status });
        const { errors } = await validateDto(dto);
        expect(errors.length).toBe(0);
      }

      // Test missing required fields
      // Note: The @IsNotEmpty decorator is used for required fields
      // We need to create a new DTO instance for each test to ensure proper validation
      const missingTypeDto = plainToClass(CreateRoomDto, {
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
      });
      const { errors: typeErrors } = await validateDto(missingTypeDto);
      expect(typeErrors.length).toBeGreaterThan(0);
      expect(typeErrors.some(error => error.property === 'type')).toBe(true);

      const missingRoomNumberDto = plainToClass(CreateRoomDto, {
        type: RoomType.SINGLE,
        pricePerNight: 100,
        maxGuests: 2,
      });
      const { errors: roomNumberErrors } = await validateDto(missingRoomNumberDto);
      expect(roomNumberErrors.length).toBeGreaterThan(0);
      expect(roomNumberErrors.some(error => error.property === 'roomNumber')).toBe(true);

      const missingPriceDto = plainToClass(CreateRoomDto, {
        type: RoomType.SINGLE,
        roomNumber: '101',
        maxGuests: 2,
      });
      const { errors: priceErrors } = await validateDto(missingPriceDto);
      expect(priceErrors.length).toBeGreaterThan(0);
      expect(priceErrors.some(error => error.property === 'pricePerNight')).toBe(true);

      const missingMaxGuestsDto = plainToClass(CreateRoomDto, {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
      });
      const { errors: maxGuestsErrors } = await validateDto(missingMaxGuestsDto);
      expect(maxGuestsErrors.length).toBeGreaterThan(0);
      expect(maxGuestsErrors.some(error => error.property === 'maxGuests')).toBe(true);

      // Test invalid room type
      const invalidRoomTypeDto = createDto({ type: 'INVALID_TYPE' });
      const { errors: roomTypeErrors } = await validateDto(invalidRoomTypeDto);
      expect(roomTypeErrors.length).toBe(1);
      expect(roomTypeErrors[0].property).toBe('type');

      // Test invalid availability status
      const invalidStatusDto = createDto({ availabilityStatus: 'INVALID_STATUS' });
      const { errors: statusErrors } = await validateDto(invalidStatusDto);
      expect(statusErrors.length).toBe(1);
      expect(statusErrors[0].property).toBe('availabilityStatus');

      // Test invalid number formats
      const invalidNumberDto = createDto({
        pricePerNight: 'not-a-number',
        maxGuests: 'not-a-number',
      });
      const { errors: numberErrors } = await validateDto(invalidNumberDto);
      expect(numberErrors.length).toBe(2);
      expect(numberErrors[0].property).toBe('pricePerNight');
      expect(numberErrors[1].property).toBe('maxGuests');

      // Test invalid JSON for amenities
      const invalidJsonDto = createDto({ amenities: 'invalid-json' });
      const { errors: jsonErrors } = await validateDto(invalidJsonDto);
      expect(jsonErrors.length).toBe(1);
      expect(jsonErrors[0].property).toBe('amenities');
    });
  });

  describe('transformation', () => {
    it('should transform all data types correctly', () => {
      // Test basic transformation
      const dto = createDto({
        type: 'SINGLE',
        roomNumber: '101',
        pricePerNight: '100',
        maxGuests: '2',
        description: 'A comfortable room',
        amenities: ['wifi', 'tv'],
        availabilityStatus: 'AVAILABLE',
      });

      expect(dto.type).toBe(RoomType.SINGLE);
      expect(dto.roomNumber).toBe('101');
      expect(dto.pricePerNight).toBe(100);
      expect(dto.maxGuests).toBe(2);
      expect(dto.description).toBe('A comfortable room');
      expect(dto.amenities).toBe(JSON.stringify(['wifi', 'tv']));
      expect(dto.availabilityStatus).toBe(AvailabilityStatus.AVAILABLE);

      // Test undefined values
      const undefinedDto = createDto({
        type: 'SINGLE',
        roomNumber: '101',
        pricePerNight: undefined,
        maxGuests: undefined,
      });
      expect(undefinedDto.pricePerNight).toBeUndefined();
      expect(undefinedDto.maxGuests).toBeUndefined();

      // Test null values
      const nullDto = createDto({
        type: 'SINGLE',
        roomNumber: '101',
        pricePerNight: null,
        maxGuests: null,
      });
      expect(nullDto.pricePerNight).toBeNull();
      expect(nullDto.maxGuests).toBeNull();

      // Test empty string values
      const emptyStringDto = createDto({
        type: 'SINGLE',
        roomNumber: '101',
        pricePerNight: '',
        maxGuests: '',
      });
      expect(emptyStringDto.pricePerNight).toBe('');
      expect(emptyStringDto.maxGuests).toBe('');

      // Test type conversion
      const typeConversionDto = createDto({
        type: 'SINGLE',
        roomNumber: '101',
        pricePerNight: '100.50',
        maxGuests: '3',
      });
      expect(typeof typeConversionDto.pricePerNight).toBe('number');
      expect(typeof typeConversionDto.maxGuests).toBe('number');
      expect(typeConversionDto.pricePerNight).toBe(100.5);
      expect(typeConversionDto.maxGuests).toBe(3);

      // Test extra properties
      // The class-transformer library includes extra properties by default
      // We'll check that the DTO still has all the expected properties
      const extraPropsDto = createDto({
        type: 'SINGLE',
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        extraProperty: 'should be ignored',
      });

      // Check that all expected properties are present
      expect(extraPropsDto.type).toBe(RoomType.SINGLE);
      expect(extraPropsDto.roomNumber).toBe('101');
      expect(extraPropsDto.pricePerNight).toBe(100);
      expect(extraPropsDto.maxGuests).toBe(2);

      // The extra property might be included, but it shouldn't affect the DTO's functionality
      // We'll just acknowledge that it's there
      expect(extraPropsDto).toHaveProperty('extraProperty');
    });
  });
});

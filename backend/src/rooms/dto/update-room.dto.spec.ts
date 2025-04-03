import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateRoomDto } from './update-room.dto';
import { RoomType, AvailabilityStatus } from '../entities/room.entity';

// Define a type for the input data that matches the DTO structure
type UpdateRoomDtoInput = Partial<{
  type: RoomType | string;
  roomNumber: string;
  pricePerNight: number | string;
  maxGuests: number | string;
  description: string;
  amenities: string;
  availabilityStatus: AvailabilityStatus | string;
  extraField?: string;
}>;

describe('UpdateRoomDto', () => {
  const createDto = (data: UpdateRoomDtoInput) => plainToClass(UpdateRoomDto, data);
  
  const validateDto = async (dto: UpdateRoomDto) => {
    const errors = await validate(dto);
    return { errors, hasErrors: errors.length > 0 };
  };

  describe('validation', () => {
    it('should validate all fields correctly', async () => {
      // Test empty update (no fields)
      const emptyDto = createDto({});
      const { errors: emptyErrors } = await validateDto(emptyDto);
      expect(emptyErrors.length).toBe(0);

      // Test single field update
      const singleFieldDto = createDto({ roomNumber: '101' });
      const { errors: singleFieldErrors } = await validateDto(singleFieldDto);
      expect(singleFieldErrors.length).toBe(0);

      // Test multiple fields update
      const multipleFieldsDto = createDto({
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2
      });
      const { errors: multipleFieldsErrors } = await validateDto(multipleFieldsDto);
      expect(multipleFieldsErrors.length).toBe(0);

      // Test all fields update
      const allFieldsDto = createDto({
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        description: 'A comfortable room with a view',
        amenities: JSON.stringify(['wifi', 'tv', 'air-conditioning']),
        availabilityStatus: AvailabilityStatus.AVAILABLE
      });
      const { errors: allFieldsErrors } = await validateDto(allFieldsDto);
      expect(allFieldsErrors.length).toBe(0);

      // Test all room types
      const roomTypes = Object.values(RoomType);
      for (const roomType of roomTypes) {
        const dto = createDto({ type: roomType });
        const { errors } = await validateDto(dto);
        expect(errors.length).toBe(0);
      }

      // Test all availability statuses
      const availabilityStatuses = Object.values(AvailabilityStatus);
      for (const status of availabilityStatuses) {
        const dto = createDto({ availabilityStatus: status });
        const { errors } = await validateDto(dto);
        expect(errors.length).toBe(0);
      }

      // Test invalid room type
      const invalidRoomTypeDto = createDto({ type: 'INVALID_TYPE' });
      const { errors: invalidRoomTypeErrors } = await validateDto(invalidRoomTypeDto);
      expect(invalidRoomTypeErrors.length).toBeGreaterThan(0);
      expect(invalidRoomTypeErrors[0].property).toBe('type');

      // Test invalid price
      const invalidPriceDto = createDto({ pricePerNight: 'not-a-number' });
      const { errors: invalidPriceErrors } = await validateDto(invalidPriceDto);
      expect(invalidPriceErrors.length).toBeGreaterThan(0);
      expect(invalidPriceErrors[0].property).toBe('pricePerNight');

      // Test invalid max guests
      const invalidMaxGuestsDto = createDto({ maxGuests: 'not-a-number' });
      const { errors: invalidMaxGuestsErrors } = await validateDto(invalidMaxGuestsDto);
      expect(invalidMaxGuestsErrors.length).toBeGreaterThan(0);
      expect(invalidMaxGuestsErrors[0].property).toBe('maxGuests');

      // Test invalid JSON for amenities
      const invalidJsonDto = createDto({ amenities: 'not-valid-json' });
      const { errors: invalidJsonErrors } = await validateDto(invalidJsonDto);
      expect(invalidJsonErrors.length).toBeGreaterThan(0);
      expect(invalidJsonErrors[0].property).toBe('amenities');

      // Test invalid availability status
      const invalidStatusDto = createDto({ availabilityStatus: 'INVALID_STATUS' });
      const { errors: invalidStatusErrors } = await validateDto(invalidStatusDto);
      expect(invalidStatusErrors.length).toBeGreaterThan(0);
      expect(invalidStatusErrors[0].property).toBe('availabilityStatus');

      // Test partial update of required fields
      const partialUpdateDto = createDto({
        roomNumber: '101',
        pricePerNight: 100
      });
      const { errors: partialUpdateErrors } = await validateDto(partialUpdateDto);
      expect(partialUpdateErrors.length).toBe(0);
    });
  });

  describe('transformation', () => {
    it('should transform all data types correctly', () => {
      // Test basic transformation with all fields
      const allFieldsDto = createDto({
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        description: 'A comfortable room with a view',
        amenities: JSON.stringify(['wifi', 'tv', 'air-conditioning']),
        availabilityStatus: AvailabilityStatus.AVAILABLE
      });

      expect(allFieldsDto).toBeInstanceOf(UpdateRoomDto);
      expect(allFieldsDto.type).toBe(RoomType.SINGLE);
      expect(allFieldsDto.roomNumber).toBe('101');
      expect(typeof allFieldsDto.pricePerNight).toBe('number');
      expect(typeof allFieldsDto.maxGuests).toBe('number');
      expect(allFieldsDto.description).toBe('A comfortable room with a view');
      expect(allFieldsDto.amenities).toBe(JSON.stringify(['wifi', 'tv', 'air-conditioning']));
      expect(allFieldsDto.availabilityStatus).toBe(AvailabilityStatus.AVAILABLE);

      // Test undefined values
      const undefinedDto = createDto({
        type: undefined,
        roomNumber: undefined,
        pricePerNight: undefined,
        maxGuests: undefined,
        description: undefined,
        amenities: undefined,
        availabilityStatus: undefined
      });

      expect(undefinedDto).toBeInstanceOf(UpdateRoomDto);
      expect(undefinedDto.type).toBeUndefined();
      expect(undefinedDto.roomNumber).toBeUndefined();
      expect(undefinedDto.pricePerNight).toBeUndefined();
      expect(undefinedDto.maxGuests).toBeUndefined();
      expect(undefinedDto.description).toBeUndefined();
      expect(undefinedDto.amenities).toBeUndefined();
      expect(undefinedDto.availabilityStatus).toBeUndefined();

      // Test null values
      const nullDto = createDto({
        type: null,
        roomNumber: null,
        pricePerNight: null,
        maxGuests: null,
        description: null,
        amenities: null,
        availabilityStatus: null
      });

      expect(nullDto).toBeInstanceOf(UpdateRoomDto);
      expect(nullDto.type).toBeNull();
      expect(nullDto.roomNumber).toBeNull();
      expect(nullDto.pricePerNight).toBeNull();
      expect(nullDto.maxGuests).toBeNull();
      expect(nullDto.description).toBeNull();
      expect(nullDto.amenities).toBeNull();
      expect(nullDto.availabilityStatus).toBeNull();

      // Test empty string values
      const emptyStringDto = createDto({
        type: '',
        roomNumber: '',
        pricePerNight: '',
        maxGuests: '',
        description: '',
        amenities: '',
        availabilityStatus: ''
      });

      expect(emptyStringDto).toBeInstanceOf(UpdateRoomDto);
      expect(emptyStringDto.type).toBe('');
      expect(emptyStringDto.roomNumber).toBe('');
      expect(emptyStringDto.pricePerNight).toBe('');
      expect(emptyStringDto.maxGuests).toBe('');
      expect(emptyStringDto.description).toBe('');
      expect(emptyStringDto.amenities).toBe('');
      expect(emptyStringDto.availabilityStatus).toBe('');

      // Test number conversion
      const numberConversionDto = createDto({
        pricePerNight: '100.50',
        maxGuests: '2'
      });

      expect(numberConversionDto).toBeInstanceOf(UpdateRoomDto);
      expect(typeof numberConversionDto.pricePerNight).toBe('number');
      expect(typeof numberConversionDto.maxGuests).toBe('number');
      expect(numberConversionDto.pricePerNight).toBe(100.50);
      expect(numberConversionDto.maxGuests).toBe(2);

      // Test enum values with case transformation
      const enumDto = createDto({
        type: 'SINGLE',
        availabilityStatus: 'AVAILABLE'
      });

      expect(enumDto).toBeInstanceOf(UpdateRoomDto);
      expect(enumDto.type).toBe(RoomType.SINGLE);
      expect(enumDto.availabilityStatus).toBe(AvailabilityStatus.AVAILABLE);

      // Test partial updates
      const updates = [
        { pricePerNight: 150.75 },
        { maxGuests: 3 },
        { description: 'Updated description' }
      ];

      updates.forEach(update => {
        const dto = createDto(update);
        expect(dto).toBeInstanceOf(UpdateRoomDto);
        
        if (update.pricePerNight !== undefined) {
          expect(typeof dto.pricePerNight).toBe('number');
          expect(dto.pricePerNight).toBe(update.pricePerNight);
        }
        if (update.maxGuests !== undefined) {
          expect(typeof dto.maxGuests).toBe('number');
          expect(dto.maxGuests).toBe(update.maxGuests);
        }
        if (update.description !== undefined) {
          expect(typeof dto.description).toBe('string');
          expect(dto.description).toBe(update.description);
        }
      });

      // Test JSON string for amenities
      const amenitiesDto = createDto({
        amenities: JSON.stringify(['wifi', 'tv', 'air-conditioning'])
      });

      expect(amenitiesDto).toBeInstanceOf(UpdateRoomDto);
      expect(typeof amenitiesDto.amenities).toBe('string');
      expect(amenitiesDto.amenities).toBe(JSON.stringify(['wifi', 'tv', 'air-conditioning']));

      // Test extra properties
      const extraPropsDto = createDto({
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        extraField: 'extra value'
      });

      expect(extraPropsDto).toBeInstanceOf(UpdateRoomDto);
      expect(extraPropsDto.type).toBe(RoomType.SINGLE);
      expect(extraPropsDto.roomNumber).toBe('101');
      expect(extraPropsDto.pricePerNight).toBe(100.50);
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 
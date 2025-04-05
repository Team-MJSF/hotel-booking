import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SearchRoomsDto, SortField, SortOrder } from './search-rooms.dto';
import { RoomType } from '../entities/room.entity';

describe('SearchRoomsDto', () => {
  const validBaseDto = {
    checkInDate: new Date('2024-03-20'),
    checkOutDate: new Date('2024-03-25'),
  };

  const createDto = (overrides = {}) =>
    plainToClass(SearchRoomsDto, { ...validBaseDto, ...overrides });

  const validateDto = async (dto: SearchRoomsDto) => {
    const errors = await validate(dto);
    return { errors, hasErrors: errors.length > 0 };
  };

  describe('validation', () => {
    it('should validate all fields correctly', async () => {
      // Test valid data with all fields
      const validDto = createDto({
        ...validBaseDto,
        roomType: RoomType.DELUXE,
        maxGuests: 2,
        minPrice: 100,
        maxPrice: 300,
        amenities: ['wifi', 'tv'],
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.ASC,
      });
      const { errors: validErrors } = await validateDto(validDto);
      expect(validErrors.length).toBe(0);

      // Test minimal required data
      const minimalDto = createDto(validBaseDto);
      const { errors: minimalErrors } = await validateDto(minimalDto);
      expect(minimalErrors.length).toBe(0);

      // Test invalid dates
      const invalidDatesDto = createDto({
        checkInDate: 'invalid-date',
        checkOutDate: new Date('2024-03-25'),
      });
      const { errors: dateErrors } = await validateDto(invalidDatesDto);
      expect(dateErrors.length).toBe(2);
      expect(dateErrors[0].property).toBe('checkInDate');
      expect(dateErrors[1].property).toBe('checkOutDate');

      // Test invalid room type
      const invalidRoomTypeDto = createDto({
        ...validBaseDto,
        roomType: 'INVALID_TYPE',
      });
      const { errors: roomTypeErrors } = await validateDto(invalidRoomTypeDto);
      expect(roomTypeErrors.length).toBe(1);
      expect(roomTypeErrors[0].property).toBe('roomType');

      // Test invalid max guests
      const invalidMaxGuestsDto = createDto({
        ...validBaseDto,
        maxGuests: 0,
      });
      const { errors: maxGuestsErrors } = await validateDto(invalidMaxGuestsDto);
      expect(maxGuestsErrors.length).toBe(1);
      expect(maxGuestsErrors[0].property).toBe('maxGuests');

      // Test invalid price range
      const invalidPriceRangeDto = createDto({
        ...validBaseDto,
        minPrice: 300,
        maxPrice: 100,
      });
      const { errors: priceRangeErrors } = await validateDto(invalidPriceRangeDto);
      expect(priceRangeErrors.length).toBe(1);
      expect(priceRangeErrors[0].property).toBe('maxPrice');

      // Test invalid amenities
      const invalidAmenitiesDto = createDto({
        ...validBaseDto,
        amenities: ['wifi', 123],
      });
      const { errors: amenitiesErrors } = await validateDto(invalidAmenitiesDto);
      expect(amenitiesErrors.length).toBe(1);
      expect(amenitiesErrors[0].property).toBe('amenities');
    });
  });

  describe('sorting', () => {
    it('should validate sorting fields correctly', async () => {
      // Test valid sort field
      const validSortFieldDto = createDto({
        ...validBaseDto,
        sortBy: SortField.PRICE,
      });
      const { errors: validSortFieldErrors } = await validateDto(validSortFieldDto);
      expect(validSortFieldErrors.length).toBe(0);

      // Test valid sort order
      const validSortOrderDto = createDto({
        ...validBaseDto,
        sortOrder: SortOrder.ASC,
      });
      const { errors: validSortOrderErrors } = await validateDto(validSortOrderDto);
      expect(validSortOrderErrors.length).toBe(0);

      // Test invalid sort field
      const invalidSortFieldDto = createDto({
        ...validBaseDto,
        sortBy: 'INVALID_FIELD',
      });
      const { errors: invalidSortFieldErrors } = await validateDto(invalidSortFieldDto);
      expect(invalidSortFieldErrors.length).toBe(1);
      expect(invalidSortFieldErrors[0].property).toBe('sortBy');

      // Test invalid sort order
      const invalidSortOrderDto = createDto({
        ...validBaseDto,
        sortOrder: 'INVALID_ORDER',
      });
      const { errors: invalidSortOrderErrors } = await validateDto(invalidSortOrderDto);
      expect(invalidSortOrderErrors.length).toBe(1);
      expect(invalidSortOrderErrors[0].property).toBe('sortOrder');
    });
  });

  describe('transformation', () => {
    it('should transform all data types correctly', () => {
      // Test date transformation
      const dateDto = createDto({
        checkInDate: '2024-03-20',
        checkOutDate: '2024-03-25',
      });
      expect(dateDto.checkInDate).toBeInstanceOf(Date);
      expect(dateDto.checkOutDate).toBeInstanceOf(Date);

      // Test number transformation
      const numberDto = createDto({
        ...validBaseDto,
        maxGuests: '2',
        minPrice: '100',
        maxPrice: '300',
      });
      expect(typeof numberDto.maxGuests).toBe('number');
      expect(typeof numberDto.minPrice).toBe('number');
      expect(typeof numberDto.maxPrice).toBe('number');

      // Test enum transformation
      const enumDto = createDto({
        ...validBaseDto,
        roomType: RoomType.DELUXE,
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.ASC,
      });
      expect(enumDto.roomType).toBeDefined();
      expect(typeof enumDto.roomType).toBe('string');
      expect(enumDto.sortBy).toBeDefined();
      expect(typeof enumDto.sortBy).toBe('string');
      expect(enumDto.sortOrder).toBeDefined();
      expect(typeof enumDto.sortOrder).toBe('string');

      // Test array transformation
      const arrayDto = createDto({
        ...validBaseDto,
        amenities: ['wifi', 'tv', 'minibar'],
      });
      expect(arrayDto.amenities).toBeInstanceOf(Array);
      expect(arrayDto.amenities.length).toBe(3);
      expect(arrayDto.amenities).toEqual(['wifi', 'tv', 'minibar']);
    });
  });
});

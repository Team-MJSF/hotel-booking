import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SearchRoomsDto, SortField, SortOrder } from './search-rooms.dto';
import { RoomType } from '../entities/room.entity';

describe('SearchRoomsDto', () => {
  let searchDto: SearchRoomsDto;

  beforeEach(() => {
    searchDto = new SearchRoomsDto();
  });

  it('should be defined', () => {
    expect(searchDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        roomType: RoomType.DELUXE,
        maxGuests: 2,
        minPrice: 100,
        maxPrice: 300,
        amenities: ['wifi', 'tv'],
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.ASC
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with minimal required data', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25')
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid dates', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: 'invalid-date',
        checkOutDate: new Date('2024-03-25')
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('checkInDate');
    });

    it('should fail validation with invalid room type', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        roomType: 'INVALID_TYPE'
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('roomType');
    });

    it('should fail validation with invalid max guests', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        maxGuests: 0
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxGuests');
    });

    it('should fail validation with invalid price range', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        minPrice: -100,
        maxPrice: -50
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'minPrice')).toBe(true);
      expect(errors.some(error => error.property === 'maxPrice')).toBe(true);
    });

    it('should fail validation with invalid amenities', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        amenities: [123, 456] // Should be strings
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amenities');
    });
  });

  describe('sorting', () => {
    it('should validate valid sort field', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.PRICE
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid sort order', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.DESC
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid sort field', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: 'INVALID_SORT_FIELD'
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('sortBy');
    });

    it('should fail validation with invalid sort order', async () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.PRICE,
        sortOrder: 'INVALID_SORT_ORDER'
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('sortOrder');
    });
  });

  describe('transformation', () => {
    it('should transform dates correctly', () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: '2024-03-20',
        checkOutDate: '2024-03-25'
      });

      expect(dto.checkInDate).toBeInstanceOf(Date);
      expect(dto.checkOutDate).toBeInstanceOf(Date);
    });

    it('should transform amenities array correctly', () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        amenities: ['wifi', 'tv']
      });

      expect(dto.amenities).toEqual(['wifi', 'tv']);
    });

    it('should transform numeric values correctly', () => {
      const dto = plainToClass(SearchRoomsDto, {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        maxGuests: '2',
        minPrice: '100',
        maxPrice: '300'
      });

      expect(typeof dto.maxGuests).toBe('number');
      expect(typeof dto.minPrice).toBe('number');
      expect(typeof dto.maxPrice).toBe('number');
    });
  });
}); 
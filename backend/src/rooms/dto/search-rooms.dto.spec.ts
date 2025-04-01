import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SearchRoomsDto } from './search-rooms.dto';
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
    it('should pass with valid data', async () => {
      const validData = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        roomType: RoomType.DELUXE,
        maxGuests: 2,
        minPrice: 100,
        maxPrice: 300,
        amenities: ['wifi', 'tv']
      };

      const dto = plainToClass(SearchRoomsDto, validData);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail without required checkInDate', async () => {
      const invalidData = {
        checkOutDate: new Date('2024-03-25')
      };

      const dto = plainToClass(SearchRoomsDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('checkInDate');
    });

    it('should fail without required checkOutDate', async () => {
      const invalidData = {
        checkInDate: new Date('2024-03-20')
      };

      const dto = plainToClass(SearchRoomsDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('checkOutDate');
    });

    it('should fail with invalid room type', async () => {
      const invalidData = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        roomType: 'INVALID_TYPE'
      };

      const dto = plainToClass(SearchRoomsDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('roomType');
    });

    it('should fail with negative maxGuests', async () => {
      const invalidData = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        maxGuests: -1
      };

      const dto = plainToClass(SearchRoomsDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxGuests');
    });

    it('should fail with negative minPrice', async () => {
      const invalidData = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        minPrice: -100
      };

      const dto = plainToClass(SearchRoomsDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('minPrice');
    });

    it('should fail with negative maxPrice', async () => {
      const invalidData = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        maxPrice: -300
      };

      const dto = plainToClass(SearchRoomsDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxPrice');
    });
  });

  describe('transformation', () => {
    it('should transform string dates to Date objects', () => {
      const data = {
        checkInDate: '2024-03-20',
        checkOutDate: '2024-03-25'
      };

      const dto = plainToClass(SearchRoomsDto, data);
      expect(dto.checkInDate).toBeInstanceOf(Date);
      expect(dto.checkOutDate).toBeInstanceOf(Date);
    });

    it('should transform string numbers to numbers', () => {
      const data = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        maxGuests: '2',
        minPrice: '100',
        maxPrice: '300'
      };

      const dto = plainToClass(SearchRoomsDto, data);
      expect(typeof dto.maxGuests).toBe('number');
      expect(typeof dto.minPrice).toBe('number');
      expect(typeof dto.maxPrice).toBe('number');
    });

    it('should handle string array for amenities', () => {
      const data = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        amenities: 'wifi,tv'
      };

      const dto = plainToClass(SearchRoomsDto, data);
      expect(Array.isArray(dto.amenities)).toBe(true);
      expect(dto.amenities).toEqual(['wifi', 'tv']);
    });
  });
}); 
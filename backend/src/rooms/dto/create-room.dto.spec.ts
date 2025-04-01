import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRoomDto } from './create-room.dto';
import { RoomType, AvailabilityStatus } from '../entities/room.entity';

describe('CreateRoomDto', () => {
  describe('validation', () => {
    it('should pass validation with all required fields', async () => {
      const validData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2
      };

      const dtoObject = plainToClass(CreateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields including optional ones', async () => {
      const validData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        description: 'A comfortable room with a view',
        amenities: JSON.stringify(['wifi', 'tv', 'air-conditioning']),
        availabilityStatus: AvailabilityStatus.AVAILABLE
      };

      const dtoObject = plainToClass(CreateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        // pricePerNight and maxGuests are missing
      };

      const dtoObject = plainToClass(CreateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'pricePerNight')).toBe(true);
      expect(errors.some(error => error.property === 'maxGuests')).toBe(true);
    });

    it('should fail validation with invalid room type', async () => {
      const invalidData = {
        type: 'INVALID_TYPE',
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2
      };

      const dtoObject = plainToClass(CreateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('type');
    });

    it('should fail validation with invalid price', async () => {
      const invalidData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 'not-a-number',
        maxGuests: 2
      };

      const dtoObject = plainToClass(CreateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pricePerNight');
    });

    it('should fail validation with invalid max guests', async () => {
      const invalidData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 'not-a-number'
      };

      const dtoObject = plainToClass(CreateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxGuests');
    });

    it('should fail validation with invalid JSON for amenities when provided', async () => {
      const invalidData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        amenities: 'not-valid-json'
      };

      const dtoObject = plainToClass(CreateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amenities');
    });

    it('should pass validation with valid JSON for amenities when provided', async () => {
      const validData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        amenities: JSON.stringify(['wifi', 'tv'])
      };

      const dtoObject = plainToClass(CreateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid availability status when provided', async () => {
      const invalidData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        availabilityStatus: 'INVALID_STATUS'
      };

      const dtoObject = plainToClass(CreateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('availabilityStatus');
    });

    it('should pass validation with valid availability status when provided', async () => {
      const validData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        availabilityStatus: AvailabilityStatus.MAINTENANCE
      };

      const dtoObject = plainToClass(CreateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with different room types', async () => {
      const validData = {
        type: RoomType.DELUXE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2
      };

      const dtoObject = plainToClass(CreateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with different availability statuses', async () => {
      const validData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        availabilityStatus: AvailabilityStatus.CLEANING
      };

      const dtoObject = plainToClass(CreateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });
  });
}); 
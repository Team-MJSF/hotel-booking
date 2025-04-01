import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateRoomDto } from './update-room.dto';
import { RoomType, AvailabilityStatus } from '../entities/room.entity';

describe('UpdateRoomDto', () => {
  describe('validation', () => {
    it('should pass validation with no fields (empty update)', async () => {
      const validData = {};

      const dtoObject = plainToClass(UpdateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with single field update', async () => {
      const validData = {
        roomNumber: '101'
      };

      const dtoObject = plainToClass(UpdateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with multiple fields update', async () => {
      const validData = {
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2
      };

      const dtoObject = plainToClass(UpdateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields', async () => {
      const validData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100,
        maxGuests: 2,
        description: 'A comfortable room with a view',
        amenities: JSON.stringify(['wifi', 'tv', 'air-conditioning']),
        availabilityStatus: AvailabilityStatus.AVAILABLE
      };

      const dtoObject = plainToClass(UpdateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid room type when type is provided', async () => {
      const invalidData = {
        type: 'INVALID_TYPE'
      };

      const dtoObject = plainToClass(UpdateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('type');
    });

    it('should pass validation with valid room type when type is provided', async () => {
      const validData = {
        type: RoomType.DELUXE
      };

      const dtoObject = plainToClass(UpdateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid price when price is provided', async () => {
      const invalidData = {
        pricePerNight: 'not-a-number'
      };

      const dtoObject = plainToClass(UpdateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pricePerNight');
    });

    it('should fail validation with invalid max guests when max guests is provided', async () => {
      const invalidData = {
        maxGuests: 'not-a-number'
      };

      const dtoObject = plainToClass(UpdateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxGuests');
    });

    it('should fail validation with invalid JSON for amenities when amenities is provided', async () => {
      const invalidData = {
        amenities: 'not-valid-json'
      };

      const dtoObject = plainToClass(UpdateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amenities');
    });

    it('should pass validation with valid JSON for amenities when amenities is provided', async () => {
      const validData = {
        amenities: JSON.stringify(['wifi', 'tv'])
      };

      const dtoObject = plainToClass(UpdateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid availability status when status is provided', async () => {
      const invalidData = {
        availabilityStatus: 'INVALID_STATUS'
      };

      const dtoObject = plainToClass(UpdateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('availabilityStatus');
    });

    it('should pass validation with valid availability status when status is provided', async () => {
      const validData = {
        availabilityStatus: AvailabilityStatus.MAINTENANCE
      };

      const dtoObject = plainToClass(UpdateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial update of required fields', async () => {
      const validData = {
        roomNumber: '101',
        pricePerNight: 100
      };

      const dtoObject = plainToClass(UpdateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });
  });
}); 
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRoomDto } from './create-room.dto';
import { RoomType, AvailabilityStatus } from '../entities/room.entity';

describe('CreateRoomDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        description: 'A comfortable single room',
        amenities: JSON.stringify(['WiFi', 'TV', 'AC']),
        availabilityStatus: AvailabilityStatus.AVAILABLE
      };

      const dtoObject = plainToClass(CreateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should pass validation without optional fields', async () => {
      const validData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2
      };

      const dtoObject = plainToClass(CreateRoomDto, validData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing required fields', async () => {
      const invalidData = {
        type: RoomType.SINGLE,
        roomNumber: '101'
      };

      const dtoObject = plainToClass(CreateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'pricePerNight')).toBe(true);
      expect(errors.some(error => error.property === 'maxGuests')).toBe(true);
    });

    it('should fail validation with invalid enum values', async () => {
      const invalidData = {
        type: 'INVALID_TYPE',
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        availabilityStatus: 'INVALID_STATUS'
      };

      const dtoObject = plainToClass(CreateRoomDto, invalidData);
      const errors = await validate(dtoObject);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'type')).toBe(true);
      expect(errors.some(error => error.property === 'availabilityStatus')).toBe(true);
    });

    it('should fail validation with invalid number format', async () => {
      const invalidData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 'not-a-number',
        maxGuests: 'not-a-number'
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

  describe('transformation', () => {
    it('should transform plain object to CreateRoomDto instance', () => {
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        description: 'A comfortable single room',
        amenities: JSON.stringify(['WiFi', 'TV', 'AC']),
        availabilityStatus: AvailabilityStatus.AVAILABLE
      };

      const dtoObject = plainToClass(CreateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateRoomDto);
      expect(dtoObject.type).toBe(plainData.type);
      expect(dtoObject.roomNumber).toBe(plainData.roomNumber);
      expect(dtoObject.pricePerNight).toBe(plainData.pricePerNight);
      expect(dtoObject.maxGuests).toBe(plainData.maxGuests);
      expect(dtoObject.description).toBe(plainData.description);
      expect(dtoObject.amenities).toBe(plainData.amenities);
      expect(dtoObject.availabilityStatus).toBe(plainData.availabilityStatus);
    });

    it('should handle undefined values', () => {
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        description: undefined,
        amenities: undefined,
        availabilityStatus: undefined
      };

      const dtoObject = plainToClass(CreateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateRoomDto);
      expect(dtoObject.description).toBeUndefined();
      expect(dtoObject.amenities).toBeUndefined();
      expect(dtoObject.availabilityStatus).toBeUndefined();
    });

    it('should handle null values', () => {
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        description: null,
        amenities: null,
        availabilityStatus: null
      };

      const dtoObject = plainToClass(CreateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateRoomDto);
      expect(dtoObject.description).toBeNull();
      expect(dtoObject.amenities).toBeNull();
      expect(dtoObject.availabilityStatus).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        description: '',
        amenities: '',
        availabilityStatus: ''
      };

      const dtoObject = plainToClass(CreateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateRoomDto);
      expect(dtoObject.description).toBe('');
      expect(dtoObject.amenities).toBe('');
      expect(dtoObject.availabilityStatus).toBe('');
    });

    it('should handle number conversion', () => {
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: '100.50',
        maxGuests: '2'
      };

      const dtoObject = plainToClass(CreateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateRoomDto);
      expect(typeof dtoObject.pricePerNight).toBe('number');
      expect(typeof dtoObject.maxGuests).toBe('number');
      expect(dtoObject.pricePerNight).toBe(100.50);
      expect(dtoObject.maxGuests).toBe(2);
    });

    it('should handle enum values', () => {
      const plainData = {
        type: 'SINGLE',
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        availabilityStatus: 'AVAILABLE'
      };

      const dtoObject = plainToClass(CreateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateRoomDto);
      expect(dtoObject.type).toBe(RoomType.SINGLE);
      expect(dtoObject.availabilityStatus).toBe(AvailabilityStatus.AVAILABLE);
    });

    it('should handle JSON string for amenities', () => {
      const amenities = ['WiFi', 'TV', 'AC'];
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        amenities: JSON.stringify(amenities)
      };

      const dtoObject = plainToClass(CreateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateRoomDto);
      expect(dtoObject.amenities).toBe(JSON.stringify(amenities));
    });

    it('should ignore extra properties', () => {
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(CreateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(CreateRoomDto);
      expect(dtoObject.type).toBe(plainData.type);
      expect(dtoObject.roomNumber).toBe(plainData.roomNumber);
      expect(dtoObject.pricePerNight).toBe(plainData.pricePerNight);
      expect(dtoObject.maxGuests).toBe(plainData.maxGuests);
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 
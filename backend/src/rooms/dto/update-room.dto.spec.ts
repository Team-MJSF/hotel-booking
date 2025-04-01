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

  describe('transformation', () => {
    it('should transform plain object to UpdateRoomDto instance with correct types', () => {
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        maxGuests: 2,
        description: 'A comfortable room with a view',
        amenities: JSON.stringify(['wifi', 'tv', 'air-conditioning']),
        availabilityStatus: AvailabilityStatus.AVAILABLE
      };

      const dtoObject = plainToClass(UpdateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
      expect(dtoObject.type).toBe(plainData.type);
      expect(dtoObject.roomNumber).toBe(plainData.roomNumber);
      expect(typeof dtoObject.pricePerNight).toBe('number');
      expect(typeof dtoObject.maxGuests).toBe('number');
      expect(dtoObject.description).toBe(plainData.description);
      expect(dtoObject.amenities).toBe(plainData.amenities);
      expect(dtoObject.availabilityStatus).toBe(plainData.availabilityStatus);
    });

    it('should handle undefined values', () => {
      const plainData = {
        type: undefined,
        roomNumber: undefined,
        pricePerNight: undefined,
        maxGuests: undefined,
        description: undefined,
        amenities: undefined,
        availabilityStatus: undefined
      };

      const dtoObject = plainToClass(UpdateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
      expect(dtoObject.type).toBeUndefined();
      expect(dtoObject.roomNumber).toBeUndefined();
      expect(dtoObject.pricePerNight).toBeUndefined();
      expect(dtoObject.maxGuests).toBeUndefined();
      expect(dtoObject.description).toBeUndefined();
      expect(dtoObject.amenities).toBeUndefined();
      expect(dtoObject.availabilityStatus).toBeUndefined();
    });

    it('should handle null values', () => {
      const plainData = {
        type: null,
        roomNumber: null,
        pricePerNight: null,
        maxGuests: null,
        description: null,
        amenities: null,
        availabilityStatus: null
      };

      const dtoObject = plainToClass(UpdateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
      expect(dtoObject.type).toBeNull();
      expect(dtoObject.roomNumber).toBeNull();
      expect(dtoObject.pricePerNight).toBeNull();
      expect(dtoObject.maxGuests).toBeNull();
      expect(dtoObject.description).toBeNull();
      expect(dtoObject.amenities).toBeNull();
      expect(dtoObject.availabilityStatus).toBeNull();
    });

    it('should handle empty string values', () => {
      const plainData = {
        type: '',
        roomNumber: '',
        pricePerNight: '',
        maxGuests: '',
        description: '',
        amenities: '',
        availabilityStatus: ''
      };

      const dtoObject = plainToClass(UpdateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
      expect(dtoObject.type).toBe('');
      expect(dtoObject.roomNumber).toBe('');
      expect(dtoObject.pricePerNight).toBe('');
      expect(dtoObject.maxGuests).toBe('');
      expect(dtoObject.description).toBe('');
      expect(dtoObject.amenities).toBe('');
      expect(dtoObject.availabilityStatus).toBe('');
    });

    it('should handle number conversion', () => {
      const plainData = {
        pricePerNight: '100.50',
        maxGuests: '2'
      };

      const dtoObject = plainToClass(UpdateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
      expect(typeof dtoObject.pricePerNight).toBe('number');
      expect(typeof dtoObject.maxGuests).toBe('number');
      expect(dtoObject.pricePerNight).toBe(100.50);
      expect(dtoObject.maxGuests).toBe(2);
    });

    it('should handle enum values with case transformation', () => {
      const plainData = {
        type: 'SINGLE',
        availabilityStatus: 'AVAILABLE'
      };

      const dtoObject = plainToClass(UpdateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
      expect(dtoObject.type).toBe(RoomType.SINGLE);
      expect(dtoObject.availabilityStatus).toBe(AvailabilityStatus.AVAILABLE);
    });

    it('should handle partial updates', () => {
      const updates = [
        { pricePerNight: 150.75 },
        { maxGuests: 3 },
        { description: 'Updated description' }
      ];

      updates.forEach(update => {
        const dtoObject = plainToClass(UpdateRoomDto, update);
        expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
        
        if (update.pricePerNight !== undefined) {
          expect(typeof dtoObject.pricePerNight).toBe('number');
          expect(dtoObject.pricePerNight).toBe(update.pricePerNight);
        }
        if (update.maxGuests !== undefined) {
          expect(typeof dtoObject.maxGuests).toBe('number');
          expect(dtoObject.maxGuests).toBe(update.maxGuests);
        }
        if (update.description !== undefined) {
          expect(typeof dtoObject.description).toBe('string');
          expect(dtoObject.description).toBe(update.description);
        }
      });
    });

    it('should handle JSON string for amenities', () => {
      const plainData = {
        amenities: JSON.stringify(['wifi', 'tv', 'air-conditioning'])
      };

      const dtoObject = plainToClass(UpdateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
      expect(typeof dtoObject.amenities).toBe('string');
      expect(dtoObject.amenities).toBe(JSON.stringify(['wifi', 'tv', 'air-conditioning']));
    });

    it('should ignore extra properties', () => {
      const plainData = {
        type: RoomType.SINGLE,
        roomNumber: '101',
        pricePerNight: 100.50,
        extraField: 'extra value'
      };

      const dtoObject = plainToClass(UpdateRoomDto, plainData);

      expect(dtoObject).toBeInstanceOf(UpdateRoomDto);
      expect(dtoObject.type).toBe(plainData.type);
      expect(dtoObject.roomNumber).toBe(plainData.roomNumber);
      expect(dtoObject.pricePerNight).toBe(plainData.pricePerNight);
      // Extra properties are automatically ignored by class-transformer
    });
  });
}); 
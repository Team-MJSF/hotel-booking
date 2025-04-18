import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomTypesService } from './room-types.service';
import { RoomType } from './entities/room-type.entity';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import {
  ResourceNotFoundException,
  ConflictException,
  DatabaseException,
} from '../common/exceptions/hotel-booking.exception';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('RoomTypesService', () => {
  let service: RoomTypesService;
  let repository: MockRepository<RoomType>;

  const mockRoomType: Partial<RoomType> = {
    id: 1,
    name: 'Deluxe Room',
    code: 'deluxe',
    description: 'A spacious deluxe room with all amenities',
    pricePerNight: 150,
    maxGuests: 2,
    imageUrl: 'https://example.com/deluxe.jpg',
    displayOrder: 1,
    amenities: ['wifi', 'tv', 'minibar'],
  };

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomTypesService,
        {
          provide: getRepositoryToken(RoomType),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<RoomTypesService>(RoomTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of room types', async () => {
      repository.find.mockResolvedValue([mockRoomType]);
      const result = await service.findAll();
      expect(result).toEqual([mockRoomType]);
      expect(repository.find).toHaveBeenCalledWith({ order: { displayOrder: 'ASC' } });
    });

    it('should throw a DatabaseException on error', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));
      await expect(service.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should return a room type by id', async () => {
      repository.findOne.mockResolvedValue(mockRoomType);
      const result = await service.findOne(1);
      expect(result).toEqual(mockRoomType);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a ResourceNotFoundException if room type not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw a DatabaseException on error', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));
      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should create a new room type', async () => {
      const createDto: CreateRoomTypeDto = {
        name: 'New Room',
        code: 'new',
        description: 'A brand new room type',
        pricePerNight: 120,
        maxGuests: 2,
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({ ...createDto, id: 2 });
      repository.save.mockResolvedValue({ ...createDto, id: 2 });

      const result = await service.create(createDto);

      expect(result).toEqual({ ...createDto, id: 2 });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { code: 'new' } });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw a ConflictException if room type code already exists', async () => {
      const createDto: CreateRoomTypeDto = {
        name: 'New Room',
        code: 'deluxe',
        description: 'A brand new room type',
        pricePerNight: 120,
        maxGuests: 2,
      };

      repository.findOne.mockResolvedValue(mockRoomType);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update an existing room type', async () => {
      const updateDto: UpdateRoomTypeDto = {
        name: 'Updated Room',
        pricePerNight: 200,
      };

      repository.findOne.mockResolvedValueOnce(mockRoomType);
      repository.update.mockResolvedValue({ affected: 1 });
      repository.findOne.mockResolvedValueOnce({ 
        ...mockRoomType, 
        name: 'Updated Room',
        pricePerNight: 200 
      });

      const result = await service.update(1, updateDto);

      expect(result).toEqual({
        ...mockRoomType,
        name: 'Updated Room',
        pricePerNight: 200,
      });
      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw ResourceNotFoundException if room type not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw ConflictException if updating to an existing code', async () => {
      const existingRoomType = { ...mockRoomType, id: 2, code: 'existing' };
      
      repository.findOne.mockResolvedValueOnce(mockRoomType); // First call to findOne for the target room
      repository.findOne.mockResolvedValueOnce(existingRoomType); // Second call to findOne to check code uniqueness

      await expect(service.update(1, { code: 'existing' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a room type', async () => {
      repository.findOne.mockResolvedValue(mockRoomType);
      repository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException if room type not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a room type by code', async () => {
      repository.findOne.mockResolvedValue(mockRoomType);
      const result = await service.findByCode('deluxe');
      expect(result).toEqual(mockRoomType);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { code: 'deluxe' } });
    });

    it('should throw ResourceNotFoundException if room type not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findByCode('nonexistent')).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('getRoomCount', () => {
    it('should return a fixed count of 10 for a valid room type', async () => {
      repository.findOne.mockResolvedValue(mockRoomType);
      const result = await service.getRoomCount(1);
      expect(result).toEqual(10);
    });

    it('should throw ResourceNotFoundException if room type not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.getRoomCount(999)).rejects.toThrow(ResourceNotFoundException);
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomTypesService } from './room-types.service';
import { RoomType } from './entities/room-type.entity';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import {
  ResourceNotFoundException,
  DatabaseException,
  ConflictException
} from '../common/exceptions/hotel-booking.exception';

type MockRepository<T = RoomType> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('RoomTypesService', () => {
  let service: RoomTypesService;
  let repository: MockRepository<RoomType>;

  const mockRoomType = {
    id: 1,
    name: 'Deluxe Room',
    code: 'deluxe',
    description: 'A spacious deluxe room with all amenities',
    pricePerNight: 150,
    maxGuests: 2,
    imageUrl: 'https://example.com/deluxe.jpg',
    displayOrder: 1,
    amenities: ['wifi', 'tv', 'minibar'],
  } as RoomType;

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

  it('should handle finding room types correctly', async () => {
    // Test findAll - success case
    repository.find.mockResolvedValue([mockRoomType]);
    const result = await service.findAll();
    expect(result).toEqual([mockRoomType]);
    expect(repository.find).toHaveBeenCalledWith({ order: { displayOrder: 'ASC' } });
    
    // Test findAll - error case
    repository.find.mockRejectedValue(new Error('Database error'));
    await expect(service.findAll()).rejects.toThrow(DatabaseException);
    
    // Initialize a separate variable for singular results
    let singleResult: RoomType;
    
    // Test findOne - success case
    repository.findOne.mockResolvedValue(mockRoomType);
    singleResult = await service.findOne(1);
    expect(singleResult).toEqual(mockRoomType);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    
    // Test findOne - not found case
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(ResourceNotFoundException);
    
    // Test findOne - error case
    repository.findOne.mockRejectedValue(new Error('Database error'));
    await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    
    // Test findByCode - success case
    repository.findOne.mockResolvedValue(mockRoomType);
    singleResult = await service.findByCode('deluxe');
    expect(singleResult).toEqual(mockRoomType);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { code: 'deluxe' } });
    
    // Test findByCode - not found case
    repository.findOne.mockResolvedValue(null);
    await expect(service.findByCode('nonexistent')).rejects.toThrow(ResourceNotFoundException);
  });

  it('should handle room type creation and updates correctly', async () => {
    const createDto: CreateRoomTypeDto = {
      name: 'New Room',
      code: 'new',
      description: 'A brand new room type',
      pricePerNight: 120,
      maxGuests: 2,
    };

    // Test create - success case
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue({ ...createDto, id: 2 } as RoomType);
    repository.save.mockResolvedValue({ ...createDto, id: 2 } as RoomType);

    const result = await service.create(createDto);
    expect(result).toEqual({ ...createDto, id: 2 });
    expect(repository.findOne).toHaveBeenCalledWith({ where: { code: 'new' } });
    expect(repository.create).toHaveBeenCalledWith(createDto);
    expect(repository.save).toHaveBeenCalled();

    // Test create - conflict case
    repository.findOne.mockResolvedValue(mockRoomType);
    await expect(service.create({ ...createDto, code: 'deluxe' })).rejects.toThrow(ConflictException);

    // Test update - success case
    const updateDto: UpdateRoomTypeDto = {
      name: 'Updated Room',
      pricePerNight: 200,
    };

    const updatedRoomType = { 
      ...mockRoomType, 
      name: 'Updated Room',
      pricePerNight: 200 
    } as RoomType;

    repository.findOne.mockResolvedValueOnce(mockRoomType);
    repository.update.mockResolvedValue({ affected: 1 });
    repository.findOne.mockResolvedValueOnce(updatedRoomType);

    const updateResult = await service.update(1, updateDto);
    expect(updateResult).toEqual(updatedRoomType);
    expect(repository.update).toHaveBeenCalledWith(1, updateDto);

    // Test update - not found case
    repository.findOne.mockResolvedValue(null);
    await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(ResourceNotFoundException);

    // Test update - conflict case
    const existingRoomType = { ...mockRoomType, id: 2, code: 'existing' } as RoomType;
    repository.findOne.mockResolvedValueOnce(mockRoomType); // First call: finding the target room
    repository.findOne.mockResolvedValueOnce(existingRoomType); // Second call: checking code uniqueness
    await expect(service.update(1, { code: 'existing' })).rejects.toThrow(ConflictException);
  });

  it('should handle room type deletion and counts correctly', async () => {
    // Test remove - success case
    repository.findOne.mockResolvedValue(mockRoomType);
    repository.delete.mockResolvedValue({ affected: 1 });

    await service.remove(1);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(repository.delete).toHaveBeenCalledWith(1);

    // Test remove - not found case
    repository.findOne.mockResolvedValue(null);
    await expect(service.remove(999)).rejects.toThrow(ResourceNotFoundException);

    // Test getRoomCount - success case
    repository.findOne.mockResolvedValue(mockRoomType);
    const count = await service.getRoomCount(1);
    expect(count).toEqual(10);

    // Test getRoomCount - not found case
    repository.findOne.mockResolvedValue(null);
    await expect(service.getRoomCount(999)).rejects.toThrow(ResourceNotFoundException);
  });
}); 
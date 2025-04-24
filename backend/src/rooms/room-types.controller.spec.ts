import { Test, TestingModule } from '@nestjs/testing';
import { RoomTypesController } from './room-types.controller';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import { RoomType } from './entities/room-type.entity';

describe('RoomTypesController', () => {
  let controller: RoomTypesController;
  let service: RoomTypesService;

  // Simple mock data
  const mockRoomType: Partial<RoomType> = {
    id: 1,
    name: 'Standard Room',
    code: 'standard',
    description: 'A simple standard room',
    pricePerNight: 100,
    maxGuests: 2,
    displayOrder: 1,
    imageUrl: 'https://example.com/image.jpg'
  };

  beforeEach(async () => {
    // Simple service mock with basic implementations
    const serviceMock = {
      findAll: jest.fn().mockResolvedValue([mockRoomType]),
      findOne: jest.fn().mockResolvedValue(mockRoomType),
      findByCode: jest.fn().mockResolvedValue(mockRoomType),
      getRoomCount: jest.fn().mockResolvedValue(10),
      create: jest.fn().mockResolvedValue(mockRoomType),
      update: jest.fn().mockResolvedValue(mockRoomType),
      remove: jest.fn().mockResolvedValue(undefined)
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomTypesController],
      providers: [
        {
          provide: RoomTypesService,
          useValue: serviceMock
        }
      ],
    }).compile();

    controller = module.get<RoomTypesController>(RoomTypesController);
    service = module.get<RoomTypesService>(RoomTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Minimal tests for each method to improve coverage
  
  describe('findAll', () => {
    it('should return an array of room types', async () => {
      const result = await controller.findAll();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockRoomType]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single room type', async () => {
      const result = await controller.findOne('1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoomType);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByCode', () => {
    it('should return a room type by code', async () => {
      const result = await controller.findByCode('standard');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoomType);
      expect(service.findByCode).toHaveBeenCalledWith('standard');
    });
  });

  describe('getRoomCount', () => {
    it('should return the count of rooms for a room type', async () => {
      const result = await controller.getRoomCount('1');
      expect(result.success).toBe(true);
      expect(result.data.totalRooms).toBe(10);
      expect(service.getRoomCount).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a room type', async () => {
      const createDto: CreateRoomTypeDto = {
        name: 'Standard Room',
        code: 'standard',
        description: 'A simple standard room',
        pricePerNight: 100,
        maxGuests: 2
      };
      
      const result = await controller.create(createDto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoomType);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a room type', async () => {
      const updateDto: UpdateRoomTypeDto = {
        name: 'Updated Room'
      };
      
      const result = await controller.update('1', updateDto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoomType);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a room type', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
}); 
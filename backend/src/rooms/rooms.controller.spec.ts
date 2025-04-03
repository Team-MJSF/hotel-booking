import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller.js';
import { RoomsService } from './rooms.service.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { UpdateRoomDto } from './dto/update-room.dto.js';
import { Room, RoomType, AvailabilityStatus } from './entities/room.entity.js';
import { ResourceNotFoundException, DatabaseException, ConflictException } from '../common/exceptions/hotel-booking.exception';
import { SearchRoomsDto } from './dto/search-rooms.dto';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('RoomsController', () => {
  let controller: RoomsController;
  let mockRoomsService: jest.Mocked<Pick<RoomsService, 'findAll' | 'findOne' | 'create' | 'update' | 'remove' | 'searchAvailableRooms' | 'findAvailableRooms'>>;

  const mockRoom: Room = {
    id: 1,
    roomNumber: '101',
    type: RoomType.DOUBLE,
    pricePerNight: 100,
    maxGuests: 2,
    description: 'A comfortable double room',
    availabilityStatus: AvailabilityStatus.AVAILABLE,
    amenities: JSON.stringify({
      wifi: true,
      tv: true,
      airConditioning: true,
    }),
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRoomsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      searchAvailableRooms: jest.fn(),
      findAvailableRooms: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should handle all findAll scenarios', async () => {
      // Test successful retrieval
      const rooms = [mockRoom];
      mockRoomsService.findAll.mockResolvedValue(rooms);
      const result = await controller.findAll();
      expect(result).toEqual(rooms);
      expect(mockRoomsService.findAll).toHaveBeenCalled();

      // Test error handling
      const error = new DatabaseException('Failed to fetch rooms', new Error('Database error'));
      mockRoomsService.findAll.mockRejectedValue(error);
      await expect(controller.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('searchRooms', () => {
    it('should handle all searchRooms scenarios', async () => {
      // Test with all filters
      const searchDtoWithFilters: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        roomType: RoomType.DELUXE,
        maxGuests: 2,
        minPrice: 100,
        maxPrice: 300,
        amenities: ['wifi', 'tv']
      };

      const availableRooms: Room[] = [
        {
          id: 1,
          roomNumber: '101',
          type: RoomType.DELUXE,
          pricePerNight: 200,
          maxGuests: 2,
          description: 'Deluxe Room',
          amenities: JSON.stringify(['wifi', 'tv']),
          photos: [],
          availabilityStatus: AvailabilityStatus.AVAILABLE,
          bookings: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRoomsService.searchAvailableRooms.mockResolvedValue(availableRooms);
      const resultWithFilters = await controller.searchRooms(searchDtoWithFilters);
      expect(resultWithFilters).toEqual(availableRooms);
      expect(mockRoomsService.searchAvailableRooms).toHaveBeenCalledWith(searchDtoWithFilters);

      // Test with minimal filters
      const searchDtoMinimal: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25')
      };

      mockRoomsService.searchAvailableRooms.mockResolvedValue(availableRooms);
      const resultMinimal = await controller.searchRooms(searchDtoMinimal);
      expect(resultMinimal).toEqual(availableRooms);
      expect(mockRoomsService.searchAvailableRooms).toHaveBeenCalledWith(searchDtoMinimal);

      // Test error handling
      const error = new DatabaseException('Failed to search rooms', new Error('Database error'));
      mockRoomsService.searchAvailableRooms.mockRejectedValue(error);
      await expect(controller.searchRooms(searchDtoMinimal)).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should handle all findOne scenarios', async () => {
      // Test successful retrieval
      mockRoomsService.findOne.mockResolvedValue(mockRoom);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockRoom);
      expect(mockRoomsService.findOne).toHaveBeenCalledWith(1);

      // Test not found error
      mockRoomsService.findOne.mockRejectedValue(new ResourceNotFoundException('Room', 1));
      await expect(controller.findOne('1')).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to fetch room', new Error('Database error'));
      mockRoomsService.findOne.mockRejectedValue(error);
      await expect(controller.findOne('1')).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should handle all create scenarios', async () => {
      const createRoomDto: CreateRoomDto = {
        roomNumber: '101',
        type: RoomType.DOUBLE,
        pricePerNight: 100,
        maxGuests: 2,
        description: 'A comfortable double room',
        amenities: JSON.stringify({
          wifi: true,
          tv: true,
          airConditioning: true,
        }),
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      };

      // Test successful creation
      mockRoomsService.create.mockResolvedValue(mockRoom);
      const result = await controller.create(createRoomDto);
      expect(result).toEqual(mockRoom);
      expect(mockRoomsService.create).toHaveBeenCalledWith(createRoomDto);

      // Test conflict error
      mockRoomsService.create.mockRejectedValue(
        new ConflictException('Room with number 101 already exists'),
      );
      await expect(controller.create(createRoomDto)).rejects.toThrow(ConflictException);

      // Test database error
      const error = new DatabaseException('Failed to create room', new Error('Database error'));
      mockRoomsService.create.mockRejectedValue(error);
      await expect(controller.create(createRoomDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should handle all update scenarios', async () => {
      const updateRoomDto: UpdateRoomDto = {
        pricePerNight: 150,
        availabilityStatus: AvailabilityStatus.MAINTENANCE,
      };

      // Test successful update
      const updatedRoom = { ...mockRoom, ...updateRoomDto };
      mockRoomsService.update.mockResolvedValue(updatedRoom);
      const result = await controller.update('1', updateRoomDto);
      expect(result).toEqual(updatedRoom);
      expect(mockRoomsService.update).toHaveBeenCalledWith(1, updateRoomDto);

      // Test not found error
      mockRoomsService.update.mockRejectedValue(new ResourceNotFoundException('Room', 1));
      await expect(controller.update('1', updateRoomDto)).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to update room', new Error('Database error'));
      mockRoomsService.update.mockRejectedValue(error);
      await expect(controller.update('1', updateRoomDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should handle all remove scenarios', async () => {
      // Test successful removal
      mockRoomsService.remove.mockResolvedValue(undefined);
      await controller.remove('1');
      expect(mockRoomsService.remove).toHaveBeenCalledWith(1);

      // Test not found error
      mockRoomsService.remove.mockRejectedValue(new ResourceNotFoundException('Room', 1));
      await expect(controller.remove('1')).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to delete room', new Error('Database error'));
      mockRoomsService.remove.mockRejectedValue(error);
      await expect(controller.remove('1')).rejects.toThrow(DatabaseException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller.js';
import { RoomsService } from './rooms.service.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { UpdateRoomDto } from './dto/update-room.dto.js';
import { Room, RoomType, AvailabilityStatus } from './entities/room.entity.js';
import { NotFoundException } from '@nestjs/common';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('RoomsController', () => {
  let controller: RoomsController;

  const mockRoomsService = {
    findAll: jest.fn(),
    findAvailableRooms: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

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
    it('should return an array of rooms', async () => {
      const rooms = [mockRoom];
      mockRoomsService.findAll.mockResolvedValue(rooms);

      const result = await controller.findAll();

      expect(result).toEqual(rooms);
      expect(mockRoomsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findAvailableRooms', () => {
    it('should return available rooms with filters', async () => {
      const checkInDate = '2024-03-20';
      const checkOutDate = '2024-03-25';
      const roomType = RoomType.DOUBLE;
      const maxGuests = '2';
      const maxPrice = '200';

      const availableRooms = [mockRoom];
      mockRoomsService.findAvailableRooms.mockResolvedValue(availableRooms);

      const result = await controller.findAvailableRooms(
        checkInDate,
        checkOutDate,
        roomType,
        maxGuests,
        maxPrice,
      );

      expect(result).toEqual(availableRooms);
      expect(mockRoomsService.findAvailableRooms).toHaveBeenCalledWith(
        new Date(checkInDate),
        new Date(checkOutDate),
        roomType,
        parseInt(maxGuests),
        parseFloat(maxPrice),
      );
    });

    it('should handle optional filters', async () => {
      const checkInDate = '2024-03-20';
      const checkOutDate = '2024-03-25';

      const availableRooms = [mockRoom];
      mockRoomsService.findAvailableRooms.mockResolvedValue(availableRooms);

      const result = await controller.findAvailableRooms(checkInDate, checkOutDate);

      expect(result).toEqual(availableRooms);
      expect(mockRoomsService.findAvailableRooms).toHaveBeenCalledWith(
        new Date(checkInDate),
        new Date(checkOutDate),
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single room', async () => {
      mockRoomsService.findOne.mockResolvedValue(mockRoom);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockRoom);
      expect(mockRoomsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when room is not found', async () => {
      mockRoomsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new room', async () => {
      const createRoomDto: CreateRoomDto = {
        number: '101',
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
        floor: 1,
      };

      mockRoomsService.create.mockResolvedValue(mockRoom);

      const result = await controller.create(createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(mockRoomsService.create).toHaveBeenCalledWith(createRoomDto);
    });
  });

  describe('update', () => {
    it('should update a room', async () => {
      const updateRoomDto: UpdateRoomDto = {
        pricePerNight: 150,
        availabilityStatus: AvailabilityStatus.MAINTENANCE,
      };

      const updatedRoom = { ...mockRoom, ...updateRoomDto };
      mockRoomsService.update.mockResolvedValue(updatedRoom);

      const result = await controller.update('1', updateRoomDto);

      expect(result).toEqual(updatedRoom);
      expect(mockRoomsService.update).toHaveBeenCalledWith(1, updateRoomDto);
    });

    it('should throw NotFoundException when room is not found', async () => {
      const updateRoomDto: UpdateRoomDto = {
        pricePerNight: 150,
      };

      mockRoomsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('999', updateRoomDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a room', async () => {
      mockRoomsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockRoomsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when room is not found', async () => {
      mockRoomsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});

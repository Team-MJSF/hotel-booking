import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RoomsService } from './rooms.service';
import { Room, RoomType, AvailabilityStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';

describe('RoomsService', () => {
  let service: RoomsService;
  let roomsRepository: Repository<Room>;

  const mockRoomsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockRoom: Room = {
    id: 1,
    roomNumber: '101',
    type: RoomType.SINGLE,
    pricePerNight: 100,
    maxGuests: 2,
    description: 'Standard Room',
    amenities: '[]',
    availabilityStatus: AvailabilityStatus.AVAILABLE,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomsRepository,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    roomsRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of rooms', async () => {
      const rooms = [mockRoom];
      mockRoomsRepository.find.mockResolvedValue(rooms);

      const result = await service.findAll();

      expect(result).toEqual(rooms);
      expect(roomsRepository.find).toHaveBeenCalled();
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRoomsRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should return a room by id', async () => {
      mockRoomsRepository.findOne.mockResolvedValue(mockRoom);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRoom);
      expect(roomsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw ResourceNotFoundException when room not found', async () => {
      mockRoomsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRoomsRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    const createRoomDto: CreateRoomDto = {
      roomNumber: '101',
      type: RoomType.SINGLE,
      pricePerNight: 100,
      maxGuests: 2,
      description: 'Standard Room',
      amenities: '[]',
      availabilityStatus: AvailabilityStatus.AVAILABLE,
    };

    it('should create a new room', async () => {
      mockRoomsRepository.findOne.mockResolvedValue(null);
      mockRoomsRepository.create.mockReturnValue(mockRoom);
      mockRoomsRepository.save.mockResolvedValue(mockRoom);

      const result = await service.create(createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(roomsRepository.findOne).toHaveBeenCalledWith({
        where: { roomNumber: createRoomDto.roomNumber },
      });
      expect(roomsRepository.create).toHaveBeenCalledWith(createRoomDto);
      expect(roomsRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when room number already exists', async () => {
      mockRoomsRepository.findOne.mockResolvedValue(mockRoom);

      await expect(service.create(createRoomDto)).rejects.toThrow(ConflictException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRoomsRepository.findOne.mockResolvedValue(null);
      mockRoomsRepository.create.mockReturnValue(mockRoom);
      mockRoomsRepository.save.mockRejectedValue(error);

      await expect(service.create(createRoomDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    const updateRoomDto: UpdateRoomDto = {
      pricePerNight: 150,
      maxGuests: 3,
    };

    it('should update a room', async () => {
      const updatedRoom = { ...mockRoom, ...updateRoomDto };
      mockRoomsRepository.update.mockResolvedValue({ affected: 1 });
      mockRoomsRepository.findOne.mockResolvedValue(updatedRoom);

      const result = await service.update(1, updateRoomDto);

      expect(result).toEqual(updatedRoom);
      expect(roomsRepository.update).toHaveBeenCalledWith(1, updateRoomDto);
      expect(roomsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw ResourceNotFoundException when room not found', async () => {
      mockRoomsRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(1, updateRoomDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRoomsRepository.update.mockRejectedValue(error);

      await expect(service.update(1, updateRoomDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should remove a room', async () => {
      mockRoomsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(roomsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when room not found', async () => {
      mockRoomsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRoomsRepository.delete.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('findAvailableRooms', () => {
    const checkInDate = new Date('2024-04-01');
    const checkOutDate = new Date('2024-04-05');
    const roomType = RoomType.SINGLE;
    const maxGuests = 2;
    const maxPrice = 200;

    const mockQueryBuilder: Partial<SelectQueryBuilder<Room>> = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    } as unknown as SelectQueryBuilder<Room>;

    beforeEach(() => {
      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as SelectQueryBuilder<Room>);
    });

    it('should return available rooms with all filters', async () => {
      const availableRooms = [mockRoom];
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(availableRooms);

      const result = await service.findAvailableRooms(
        checkInDate,
        checkOutDate,
        roomType,
        maxGuests,
        maxPrice,
      );

      expect(result).toEqual(availableRooms);
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('room.bookings', 'booking');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('room.availabilityStatus = :status', {
        status: AvailabilityStatus.AVAILABLE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(4); // 1 for booking conflict + 3 for filters
      expect(mockQueryBuilder.distinct).toHaveBeenCalledWith(true);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should return available rooms without optional filters', async () => {
      const availableRooms = [mockRoom];
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(availableRooms);

      const result = await service.findAvailableRooms(checkInDate, checkOutDate);

      expect(result).toEqual(availableRooms);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(1); // Only for booking conflict
    });

    it('should throw DatabaseException when query fails', async () => {
      const error = new Error('Database error');
      (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(error);

      await expect(
        service.findAvailableRooms(checkInDate, checkOutDate),
      ).rejects.toThrow(DatabaseException);
    });
  });
}); 
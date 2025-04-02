import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomsService } from './rooms.service';
import { Room, RoomType, AvailabilityStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SearchRoomsDto, SortField, SortOrder } from './dto/search-rooms.dto';
import { ResourceNotFoundException, ConflictException, DatabaseException } from '../common/exceptions/hotel-booking.exception';

type MockQueryBuilder = {
  leftJoin: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  distinct: jest.Mock;
  orderBy: jest.Mock;
  getMany: jest.Mock;
};

describe('RoomsService', () => {
  let service: RoomsService;
  let roomsRepository: Repository<Room>;

  const mockRoomsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
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
      mockRoomsRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(roomsRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when room not found', async () => {
      mockRoomsRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockRoomsRepository.softDelete.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('searchAvailableRooms', () => {
    const mockRooms = [
      { ...mockRoom, type: RoomType.DELUXE, pricePerNight: 200, availabilityStatus: AvailabilityStatus.AVAILABLE },
      { ...mockRoom, type: RoomType.DELUXE, pricePerNight: 150, availabilityStatus: AvailabilityStatus.AVAILABLE },
      { ...mockRoom, type: RoomType.SUITE, pricePerNight: 300, availabilityStatus: AvailabilityStatus.AVAILABLE },
      { ...mockRoom, type: RoomType.DELUXE, pricePerNight: 250, availabilityStatus: AvailabilityStatus.OCCUPIED },
    ];

    it('should filter rooms by type and price range', async () => {
      const searchDto: SearchRoomsDto = {
        roomType: RoomType.DELUXE,
        minPrice: 150,
        maxPrice: 250,
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRooms.filter(room => 
          room.type === RoomType.DELUXE && 
          room.pricePerNight >= 150 && 
          room.pricePerNight <= 250 &&
          room.availabilityStatus === AvailabilityStatus.AVAILABLE
        )),
      });

      const result = await service.searchAvailableRooms(searchDto);

      expect(result).toHaveLength(2);
      expect(result.every(room => room.type === RoomType.DELUXE)).toBe(true);
      expect(result.every(room => room.pricePerNight >= 150 && room.pricePerNight <= 250)).toBe(true);
      expect(result.every(room => room.availabilityStatus === AvailabilityStatus.AVAILABLE)).toBe(true);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter rooms by type and availability', async () => {
      const searchDto: SearchRoomsDto = {
        roomType: RoomType.DELUXE,
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRooms.filter(room => 
          room.type === RoomType.DELUXE && 
          room.availabilityStatus === AvailabilityStatus.AVAILABLE
        )),
      });

      const result = await service.searchAvailableRooms(searchDto);

      expect(result).toHaveLength(2);
      expect(result.every(room => room.type === RoomType.DELUXE)).toBe(true);
      expect(result.every(room => room.availabilityStatus === AvailabilityStatus.AVAILABLE)).toBe(true);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should sort rooms by price within type', async () => {
      const searchDto: SearchRoomsDto = {
        roomType: RoomType.DELUXE,
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.ASC,
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(
          mockRooms
            .filter(room => room.type === RoomType.DELUXE && room.availabilityStatus === AvailabilityStatus.AVAILABLE)
            .sort((a, b) => a.pricePerNight - b.pricePerNight)
        ),
      });

      const result = await service.searchAvailableRooms(searchDto);

      expect(result).toHaveLength(2);
      expect(result[0].pricePerNight).toBe(150);
      expect(result[1].pricePerNight).toBe(200);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should throw DatabaseException when query fails', async () => {
      const searchDto: SearchRoomsDto = {
        roomType: RoomType.DELUXE,
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.searchAvailableRooms(searchDto)).rejects.toThrow(DatabaseException);
    });

    it('should return available rooms with all filters', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        roomType: RoomType.DELUXE,
        maxGuests: 2,
        minPrice: 100,
        maxPrice: 300,
        amenities: ['wifi', 'tv']
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

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

      mockQueryBuilder.getMany.mockResolvedValue(availableRooms);

      const result = await service.searchAvailableRooms(searchDto);

      expect(result).toEqual(availableRooms);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalledWith('room');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('room.bookings', 'booking');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('room.availabilityStatus = :status', {
        status: AvailabilityStatus.AVAILABLE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(7); // 1 for booking conflict + 6 for filters
    });

    it('should sort rooms by price in ascending order', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.ASC
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      const availableRooms: Room[] = [mockRoom];
      mockQueryBuilder.getMany.mockResolvedValue(availableRooms);

      await service.searchAvailableRooms(searchDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('room.pricePerNight', SortOrder.ASC);
    });

    it('should sort rooms by type in descending order', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.TYPE,
        sortOrder: SortOrder.DESC
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      const availableRooms: Room[] = [mockRoom];
      mockQueryBuilder.getMany.mockResolvedValue(availableRooms);

      await service.searchAvailableRooms(searchDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('room.type', SortOrder.DESC);
    });

    it('should use default ASC order when sortOrder is not specified', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.MAX_GUESTS
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      const availableRooms: Room[] = [mockRoom];
      mockQueryBuilder.getMany.mockResolvedValue(availableRooms);

      await service.searchAvailableRooms(searchDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('room.maxGuests', SortOrder.ASC);
    });

    it('should return available rooms without optional filters', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      const availableRooms: Room[] = [mockRoom];
      mockQueryBuilder.getMany.mockResolvedValue(availableRooms);

      const result = await service.searchAvailableRooms(searchDto);

      expect(result).toEqual(availableRooms);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalledWith('room');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('room.bookings', 'booking');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('room.availabilityStatus = :status', {
        status: AvailabilityStatus.AVAILABLE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(1); // Only for booking conflict
    });

    it('should throw DatabaseException when repository fails', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      const error = new Error('Database error');
      mockQueryBuilder.getMany.mockRejectedValue(error);

      await expect(service.searchAvailableRooms(searchDto)).rejects.toThrow(DatabaseException);
    });

    it('should sort rooms by room number in ascending order', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.ROOM_NUMBER,
        sortOrder: SortOrder.ASC
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      const availableRooms: Room[] = [mockRoom];
      mockQueryBuilder.getMany.mockResolvedValue(availableRooms);

      await service.searchAvailableRooms(searchDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('room.roomNumber', SortOrder.ASC);
    });

    it('should apply sorting after all filters', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        roomType: RoomType.DELUXE,
        maxPrice: 300,
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.DESC
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      const availableRooms: Room[] = [mockRoom];
      mockQueryBuilder.getMany.mockResolvedValue(availableRooms);

      await service.searchAvailableRooms(searchDto);

      // Verify that filters are applied before sorting
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('room.type = :type', { type: RoomType.DELUXE });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('room.pricePerNight <= :maxPrice', { maxPrice: 300 });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('room.pricePerNight', SortOrder.DESC);
    });

    it('should handle sorting with amenities filter', async () => {
      const searchDto: SearchRoomsDto = {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        amenities: ['wifi', 'tv'],
        sortBy: SortField.MAX_GUESTS,
        sortOrder: SortOrder.DESC
      };

      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      const availableRooms: Room[] = [mockRoom];
      mockQueryBuilder.getMany.mockResolvedValue(availableRooms);

      await service.searchAvailableRooms(searchDto);

      // Verify that amenities filter is applied before sorting
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('JSON_CONTAINS(room.amenities, :amenity0)', {
        amenity0: JSON.stringify('wifi'),
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('JSON_CONTAINS(room.amenities, :amenity1)', {
        amenity1: JSON.stringify('tv'),
      });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('room.maxGuests', SortOrder.DESC);
    });
  });

  describe('findByRoomNumber', () => {
    it('should find a room by room number', async () => {
      const roomNumber = '101';
      const mockRoomWithNumber = { ...mockRoom, roomNumber };

      mockRoomsRepository.findOne.mockResolvedValue(mockRoomWithNumber);

      const result = await service.findByRoomNumber(roomNumber);

      expect(result).toEqual(mockRoomWithNumber);
      expect(mockRoomsRepository.findOne).toHaveBeenCalledWith({
        where: { roomNumber },
      });
    });

    it('should return null when room is not found', async () => {
      const roomNumber = '999';
      mockRoomsRepository.findOne.mockResolvedValue(null);

      const result = await service.findByRoomNumber(roomNumber);

      expect(result).toBeNull();
      expect(mockRoomsRepository.findOne).toHaveBeenCalledWith({
        where: { roomNumber },
      });
    });

    it('should throw DatabaseException when query fails', async () => {
      const roomNumber = '101';
      mockRoomsRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findByRoomNumber(roomNumber)).rejects.toThrow(DatabaseException);
    });
  });

  describe('searchRoomsByDescription', () => {
    const mockRooms = [
      { ...mockRoom, description: 'Luxury suite with ocean view' },
      { ...mockRoom, description: 'Standard room with city view' },
      { ...mockRoom, description: 'Deluxe room with mountain view' },
    ];

    it('should find rooms by description text', async () => {
      const searchText = 'ocean';
      const expectedRooms = mockRooms.filter(room => 
        room.description.toLowerCase().includes(searchText.toLowerCase())
      );

      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedRooms),
      });

      const result = await service.searchRoomsByDescription(searchText);

      expect(result).toHaveLength(1);
      expect(result[0].description).toContain('ocean');
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should return empty array when no rooms match description', async () => {
      const searchText = 'nonexistent';
      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.searchRoomsByDescription(searchText);

      expect(result).toHaveLength(0);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should throw DatabaseException when query fails', async () => {
      const searchText = 'ocean';
      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.searchRoomsByDescription(searchText)).rejects.toThrow(DatabaseException);
    });

    it('should handle case-insensitive search', async () => {
      const searchText = 'OCEAN';
      const expectedRooms = mockRooms.filter(room => 
        room.description.toLowerCase().includes(searchText.toLowerCase())
      );

      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedRooms),
      });

      const result = await service.searchRoomsByDescription(searchText);

      expect(result).toHaveLength(1);
      expect(result[0].description).toContain('ocean');
    });

    it('should handle partial word matches', async () => {
      const searchText = 'lux';
      const expectedRooms = mockRooms.filter(room => 
        room.description.toLowerCase().includes(searchText.toLowerCase())
      );

      mockRoomsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedRooms),
      });

      const result = await service.searchRoomsByDescription(searchText);

      expect(result).toHaveLength(2);
      expect(result.some(room => room.description.includes('Luxury'))).toBe(true);
      expect(result.some(room => room.description.includes('Deluxe'))).toBe(true);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findByRoomNumberAndAvailability', () => {
    const mockRooms = [
      { ...mockRoom, roomNumber: '101', availabilityStatus: AvailabilityStatus.AVAILABLE },
      { ...mockRoom, roomNumber: '102', availabilityStatus: AvailabilityStatus.OCCUPIED },
      { ...mockRoom, roomNumber: '103', availabilityStatus: AvailabilityStatus.AVAILABLE },
    ];

    it('should find available room by room number', async () => {
      const roomNumber = '101';
      const expectedRoom = mockRooms.find(room => 
        room.roomNumber === roomNumber && 
        room.availabilityStatus === AvailabilityStatus.AVAILABLE
      );

      mockRoomsRepository.findOne.mockResolvedValue(expectedRoom);

      const result = await service.findByRoomNumberAndAvailability(roomNumber);

      expect(result).toEqual(expectedRoom);
      expect(mockRoomsRepository.findOne).toHaveBeenCalledWith({
        where: {
          roomNumber,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
        },
      });
    });

    it('should return null when room is not available', async () => {
      const roomNumber = '102';
      mockRoomsRepository.findOne.mockResolvedValue(null);

      const result = await service.findByRoomNumberAndAvailability(roomNumber);

      expect(result).toBeNull();
      expect(mockRoomsRepository.findOne).toHaveBeenCalledWith({
        where: {
          roomNumber,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
        },
      });
    });

    it('should throw DatabaseException when query fails', async () => {
      const roomNumber = '101';
      mockRoomsRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findByRoomNumberAndAvailability(roomNumber)).rejects.toThrow(DatabaseException);
    });
  });
}); 
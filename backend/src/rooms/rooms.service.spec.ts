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
    it('should handle findAll operations correctly', async () => {
      const testCases = [
        {
          description: 'return an array of rooms',
          mockResult: [mockRoom],
          expectedResult: [mockRoom],
          mockError: null,
          expectedError: null,
          assertions: (result: Room[]) => {
            expect(result).toEqual([mockRoom]);
            expect(roomsRepository.find).toHaveBeenCalled();
          }
        },
        {
          description: 'throw DatabaseException when repository fails',
          mockResult: null,
          expectedResult: null,
          mockError: new Error('Database error'),
          expectedError: DatabaseException,
          assertions: () => {
            expect(roomsRepository.find).toHaveBeenCalled();
          }
        }
      ];

      for (const { description, mockResult, expectedResult, mockError, expectedError, assertions } of testCases) {
        if (mockError) {
          mockRoomsRepository.find.mockRejectedValue(mockError);
        } else {
          mockRoomsRepository.find.mockResolvedValue(mockResult);
        }

        if (expectedError) {
          await expect(service.findAll()).rejects.toThrow(expectedError);
        } else {
      const result = await service.findAll();
          expect(result).toEqual(expectedResult);
        }
        
        assertions(expectedResult);
      }
    });
  });

  describe('findOne', () => {
    it('should handle findOne operations correctly', async () => {
      const testCases = [
        {
          description: 'return a room by id',
          id: 1,
          mockResult: mockRoom,
          expectedResult: mockRoom,
          mockError: null,
          expectedError: null,
          assertions: (result: Room) => {
      expect(result).toEqual(mockRoom);
      expect(roomsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
          }
        },
        {
          description: 'throw ResourceNotFoundException when room not found',
          id: 1,
          mockResult: null,
          expectedResult: null,
          mockError: null,
          expectedError: ResourceNotFoundException,
          assertions: () => {
            expect(roomsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
          }
        },
        {
          description: 'throw DatabaseException when repository fails',
          id: 1,
          mockResult: null,
          expectedResult: null,
          mockError: new Error('Database error'),
          expectedError: DatabaseException,
          assertions: () => {
            expect(roomsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
          }
        }
      ];

      for (const { description, id, mockResult, expectedResult, mockError, expectedError, assertions } of testCases) {
        if (mockError) {
          mockRoomsRepository.findOne.mockRejectedValue(mockError);
        } else {
          mockRoomsRepository.findOne.mockResolvedValue(mockResult);
        }

        if (expectedError) {
          await expect(service.findOne(id)).rejects.toThrow(expectedError);
        } else {
          const result = await service.findOne(id);
          expect(result).toEqual(expectedResult);
        }
        
        assertions(expectedResult);
      }
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

    it('should handle create operations correctly', async () => {
      const testCases = [
        {
          description: 'create a new room',
          mockFindResult: null,
          mockCreateResult: mockRoom,
          mockSaveResult: mockRoom,
          mockSaveError: null,
          expectedResult: mockRoom,
          expectedError: null,
          assertions: (result: Room) => {
      expect(result).toEqual(mockRoom);
      expect(roomsRepository.findOne).toHaveBeenCalledWith({
        where: { roomNumber: createRoomDto.roomNumber },
      });
      expect(roomsRepository.create).toHaveBeenCalledWith(createRoomDto);
      expect(roomsRepository.save).toHaveBeenCalled();
          }
        },
        {
          description: 'throw ConflictException when room number already exists',
          mockFindResult: mockRoom,
          mockCreateResult: null,
          mockSaveResult: null,
          mockSaveError: null,
          expectedResult: null,
          expectedError: ConflictException,
          assertions: () => {
            expect(roomsRepository.findOne).toHaveBeenCalledWith({
              where: { roomNumber: createRoomDto.roomNumber },
            });
          }
        },
        {
          description: 'throw DatabaseException when repository fails',
          mockFindResult: null,
          mockCreateResult: mockRoom,
          mockSaveResult: null,
          mockSaveError: new Error('Database error'),
          expectedResult: null,
          expectedError: DatabaseException,
          assertions: () => {
            expect(roomsRepository.findOne).toHaveBeenCalledWith({
              where: { roomNumber: createRoomDto.roomNumber },
            });
            expect(roomsRepository.create).toHaveBeenCalledWith(createRoomDto);
            expect(roomsRepository.save).toHaveBeenCalled();
          }
        }
      ];

      for (const { 
        description, 
        mockFindResult, 
        mockCreateResult, 
        mockSaveResult, 
        mockSaveError, 
        expectedResult, 
        expectedError, 
        assertions 
      } of testCases) {
        mockRoomsRepository.findOne.mockResolvedValue(mockFindResult);
        mockRoomsRepository.create.mockReturnValue(mockCreateResult);
        
        if (mockSaveError) {
          mockRoomsRepository.save.mockRejectedValue(mockSaveError);
        } else {
          mockRoomsRepository.save.mockResolvedValue(mockSaveResult);
        }

        if (expectedError) {
          await expect(service.create(createRoomDto)).rejects.toThrow(expectedError);
        } else {
          const result = await service.create(createRoomDto);
          expect(result).toEqual(expectedResult);
        }
        
        assertions(expectedResult);
      }
    });
  });

  describe('update', () => {
    const updateRoomDto: UpdateRoomDto = {
      pricePerNight: 150,
      maxGuests: 3,
    };

    it('should handle update operations correctly', async () => {
      const testCases = [
        {
          description: 'update a room',
          id: 1,
          mockUpdateResult: { affected: 1 },
          mockFindResult: { ...mockRoom, ...updateRoomDto },
          mockUpdateError: null,
          expectedResult: { ...mockRoom, ...updateRoomDto },
          expectedError: null,
          assertions: (result: Room) => {
            expect(result).toEqual({ ...mockRoom, ...updateRoomDto });
      expect(roomsRepository.update).toHaveBeenCalledWith(1, updateRoomDto);
      expect(roomsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
          }
        },
        {
          description: 'throw ResourceNotFoundException when room not found',
          id: 1,
          mockUpdateResult: { affected: 0 },
          mockFindResult: null,
          mockUpdateError: null,
          expectedResult: null,
          expectedError: ResourceNotFoundException,
          assertions: () => {
            expect(roomsRepository.update).toHaveBeenCalledWith(1, updateRoomDto);
          }
        },
        {
          description: 'throw DatabaseException when repository fails',
          id: 1,
          mockUpdateResult: null,
          mockFindResult: null,
          mockUpdateError: new Error('Database error'),
          expectedResult: null,
          expectedError: DatabaseException,
          assertions: () => {
            expect(roomsRepository.update).toHaveBeenCalledWith(1, updateRoomDto);
          }
        }
      ];

      for (const { 
        description, 
        id, 
        mockUpdateResult, 
        mockFindResult, 
        mockUpdateError, 
        expectedResult, 
        expectedError, 
        assertions 
      } of testCases) {
        if (mockUpdateError) {
          mockRoomsRepository.update.mockRejectedValue(mockUpdateError);
        } else {
          mockRoomsRepository.update.mockResolvedValue(mockUpdateResult);
        }
        
        mockRoomsRepository.findOne.mockResolvedValue(mockFindResult);

        if (expectedError) {
          await expect(service.update(id, updateRoomDto)).rejects.toThrow(expectedError);
        } else {
          const result = await service.update(id, updateRoomDto);
          expect(result).toEqual(expectedResult);
        }
        
        assertions(expectedResult);
      }
    });
  });

  describe('remove', () => {
    it('should handle remove operations correctly', async () => {
      const testCases = [
        {
          description: 'remove a room',
          id: 1,
          mockResult: { affected: 1 },
          mockError: null,
          expectedError: null,
          assertions: () => {
            expect(roomsRepository.softDelete).toHaveBeenCalledWith(1);
          }
        },
        {
          description: 'throw ResourceNotFoundException when room not found',
          id: 1,
          mockResult: { affected: 0 },
          mockError: null,
          expectedError: ResourceNotFoundException,
          assertions: () => {
            expect(roomsRepository.softDelete).toHaveBeenCalledWith(1);
          }
        },
        {
          description: 'throw DatabaseException when repository fails',
          id: 1,
          mockResult: null,
          mockError: new Error('Database error'),
          expectedError: DatabaseException,
          assertions: () => {
      expect(roomsRepository.softDelete).toHaveBeenCalledWith(1);
          }
        }
      ];

      for (const { description, id, mockResult, mockError, expectedError, assertions } of testCases) {
        if (mockError) {
          mockRoomsRepository.softDelete.mockRejectedValue(mockError);
        } else {
          mockRoomsRepository.softDelete.mockResolvedValue(mockResult);
        }

        if (expectedError) {
          await expect(service.remove(id)).rejects.toThrow(expectedError);
        } else {
          await service.remove(id);
        }
        
        assertions();
      }
    });
  });

  describe('searchAvailableRooms', () => {
    const mockRooms = [
      { ...mockRoom, type: RoomType.DELUXE, pricePerNight: 200, availabilityStatus: AvailabilityStatus.AVAILABLE },
      { ...mockRoom, type: RoomType.DELUXE, pricePerNight: 150, availabilityStatus: AvailabilityStatus.AVAILABLE },
      { ...mockRoom, type: RoomType.SUITE, pricePerNight: 300, availabilityStatus: AvailabilityStatus.AVAILABLE },
      { ...mockRoom, type: RoomType.DELUXE, pricePerNight: 250, availabilityStatus: AvailabilityStatus.OCCUPIED },
    ];

    it('should handle search operations correctly', async () => {
      const testCases = [
        {
          description: 'filter rooms by type and price range',
          searchDto: {
        roomType: RoomType.DELUXE,
        minPrice: 150,
        maxPrice: 250,
          },
          expectedRooms: mockRooms.filter(room => 
          room.type === RoomType.DELUXE && 
          room.pricePerNight >= 150 && 
          room.pricePerNight <= 250 &&
          room.availabilityStatus === AvailabilityStatus.AVAILABLE
          ),
          mockError: null,
          expectedError: null,
          assertions: (result: Room[]) => {
      expect(result).toHaveLength(2);
      expect(result.every(room => room.type === RoomType.DELUXE)).toBe(true);
      expect(result.every(room => room.pricePerNight >= 150 && room.pricePerNight <= 250)).toBe(true);
      expect(result.every(room => room.availabilityStatus === AvailabilityStatus.AVAILABLE)).toBe(true);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
          }
        },
        {
          description: 'filter rooms by type and availability',
          searchDto: {
        roomType: RoomType.DELUXE,
          },
          expectedRooms: mockRooms.filter(room => 
          room.type === RoomType.DELUXE && 
          room.availabilityStatus === AvailabilityStatus.AVAILABLE
          ),
          mockError: null,
          expectedError: null,
          assertions: (result: Room[]) => {
      expect(result).toHaveLength(2);
      expect(result.every(room => room.type === RoomType.DELUXE)).toBe(true);
      expect(result.every(room => room.availabilityStatus === AvailabilityStatus.AVAILABLE)).toBe(true);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
          }
        },
        {
          description: 'throw DatabaseException when query fails',
          searchDto: {
        roomType: RoomType.DELUXE,
          },
          expectedRooms: null,
          mockError: new Error('Database error'),
          expectedError: DatabaseException,
          assertions: () => {
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
          }
        }
      ];

      for (const { description, searchDto, expectedRooms, mockError, expectedError, assertions } of testCases) {
      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

        if (mockError) {
          mockQueryBuilder.getMany.mockRejectedValue(mockError);
        } else {
          mockQueryBuilder.getMany.mockResolvedValue(expectedRooms);
        }

        if (expectedError) {
          await expect(service.searchAvailableRooms(searchDto)).rejects.toThrow(expectedError);
        } else {
      const result = await service.searchAvailableRooms(searchDto);
          expect(result).toEqual(expectedRooms);
        }
        
        assertions(expectedRooms);
      }
    });

    it('should handle sorting operations correctly', async () => {
      const testCases = [
        {
          description: 'sort rooms by price in ascending order',
          searchDto: {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.ASC
          },
          expectedOrderBy: 'room.pricePerNight',
          expectedOrder: SortOrder.ASC
        },
        {
          description: 'sort rooms by type in descending order',
          searchDto: {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.TYPE,
        sortOrder: SortOrder.DESC
          },
          expectedOrderBy: 'room.type',
          expectedOrder: SortOrder.DESC
        },
        {
          description: 'use default ASC order when sortOrder is not specified',
          searchDto: {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        sortBy: SortField.MAX_GUESTS
          },
          expectedOrderBy: 'room.maxGuests',
          expectedOrder: SortOrder.ASC
        },
        {
          description: 'sort rooms by room number in ascending order',
          searchDto: {
            checkInDate: new Date('2024-03-20'),
            checkOutDate: new Date('2024-03-25'),
            sortBy: SortField.ROOM_NUMBER,
            sortOrder: SortOrder.ASC
          },
          expectedOrderBy: 'room.roomNumber',
          expectedOrder: SortOrder.ASC
        }
      ];

      for (const { description, searchDto, expectedOrderBy, expectedOrder } of testCases) {
      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([mockRoom]),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      await service.searchAvailableRooms(searchDto);

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(expectedOrderBy, expectedOrder);
      }
    });

    it('should handle complex search scenarios correctly', async () => {
      const testCases = [
        {
          description: 'return available rooms with all filters',
          searchDto: {
            checkInDate: new Date('2024-03-20'),
            checkOutDate: new Date('2024-03-25'),
            roomType: RoomType.DELUXE,
            maxGuests: 2,
            minPrice: 100,
            maxPrice: 300,
            amenities: ['wifi', 'tv']
          },
          expectedRooms: [mockRoom],
          assertions: (mockQueryBuilder: MockQueryBuilder) => {
            expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalledWith('room');
            expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('room.bookings', 'booking');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('room.availabilityStatus = :status', {
              status: AvailabilityStatus.AVAILABLE,
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(7); // 1 for booking conflict + 6 for filters
          }
        },
        {
          description: 'return available rooms without optional filters',
          searchDto: {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
          },
          expectedRooms: [mockRoom],
          assertions: (mockQueryBuilder: MockQueryBuilder) => {
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalledWith('room');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('room.bookings', 'booking');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('room.availabilityStatus = :status', {
        status: AvailabilityStatus.AVAILABLE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(1); // Only for booking conflict
          }
        },
        {
          description: 'apply sorting after all filters',
          searchDto: {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        roomType: RoomType.DELUXE,
        maxPrice: 300,
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.DESC
          },
          expectedRooms: [mockRoom],
          assertions: (mockQueryBuilder: MockQueryBuilder) => {
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('room.type = :type', { type: RoomType.DELUXE });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('room.pricePerNight <= :maxPrice', { maxPrice: 300 });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('room.pricePerNight', SortOrder.DESC);
          }
        },
        {
          description: 'handle sorting with amenities filter',
          searchDto: {
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        amenities: ['wifi', 'tv'],
        sortBy: SortField.MAX_GUESTS,
        sortOrder: SortOrder.DESC
          },
          expectedRooms: [mockRoom],
          assertions: (mockQueryBuilder: MockQueryBuilder) => {
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('JSON_CONTAINS(room.amenities, :amenity0)', {
              amenity0: JSON.stringify('wifi'),
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('JSON_CONTAINS(room.amenities, :amenity1)', {
              amenity1: JSON.stringify('tv'),
            });
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('room.maxGuests', SortOrder.DESC);
          }
        }
      ];

      for (const { description, searchDto, expectedRooms, assertions } of testCases) {
      const mockQueryBuilder: MockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(expectedRooms),
      };

      mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as Repository<Room>['createQueryBuilder']);

      await service.searchAvailableRooms(searchDto);

        assertions(mockQueryBuilder);
      }
    });
  });

  describe('findByRoomNumber', () => {
    it('should handle findByRoomNumber operations correctly', async () => {
      const testCases = [
        {
          description: 'find a room by room number',
          roomNumber: '101',
          mockResult: { ...mockRoom, roomNumber: '101' },
          expectedResult: { ...mockRoom, roomNumber: '101' },
          mockError: null,
          expectedError: null,
          assertions: (result: Room) => {
            expect(result).toEqual({ ...mockRoom, roomNumber: '101' });
            expect(roomsRepository.findOne).toHaveBeenCalledWith({
              where: { roomNumber: '101' },
            });
          }
        },
        {
          description: 'return null when room is not found',
          roomNumber: '999',
          mockResult: null,
          expectedResult: null,
          mockError: null,
          expectedError: null,
          assertions: (result: Room) => {
      expect(result).toBeNull();
            expect(roomsRepository.findOne).toHaveBeenCalledWith({
              where: { roomNumber: '999' },
            });
          }
        },
        {
          description: 'throw DatabaseException when query fails',
          roomNumber: '101',
          mockResult: null,
          expectedResult: null,
          mockError: new Error('Database error'),
          expectedError: DatabaseException,
          assertions: () => {
            expect(roomsRepository.findOne).toHaveBeenCalledWith({
              where: { roomNumber: '101' },
            });
          }
        }
      ];

      for (const { description, roomNumber, mockResult, expectedResult, mockError, expectedError, assertions } of testCases) {
        if (mockError) {
          mockRoomsRepository.findOne.mockRejectedValue(mockError);
        } else {
          mockRoomsRepository.findOne.mockResolvedValue(mockResult);
        }

        if (expectedError) {
          await expect(service.findByRoomNumber(roomNumber)).rejects.toThrow(expectedError);
        } else {
          const result = await service.findByRoomNumber(roomNumber);
          expect(result).toEqual(expectedResult);
        }
        
        assertions(expectedResult);
      }
    });
  });

  describe('searchRoomsByDescription', () => {
    const mockRooms = [
      { ...mockRoom, description: 'Luxury suite with ocean view' },
      { ...mockRoom, description: 'Standard room with city view' },
      { ...mockRoom, description: 'Deluxe room with mountain view' },
    ];

    it('should handle searchRoomsByDescription operations correctly', async () => {
      const testCases = [
        {
          description: 'find rooms by description text',
          searchText: 'ocean',
          expectedRooms: mockRooms.filter(room => 
            room.description.toLowerCase().includes('ocean'.toLowerCase())
          ),
          mockError: null,
          expectedError: null,
          assertions: (result: Room[]) => {
      expect(result).toHaveLength(1);
      expect(result[0].description).toContain('ocean');
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
          }
        },
        {
          description: 'return empty array when no rooms match description',
          searchText: 'nonexistent',
          expectedRooms: [],
          mockError: null,
          expectedError: null,
          assertions: (result: Room[]) => {
      expect(result).toHaveLength(0);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
          }
        },
        {
          description: 'throw DatabaseException when query fails',
          searchText: 'ocean',
          expectedRooms: null,
          mockError: new Error('Database error'),
          expectedError: DatabaseException,
          assertions: () => {
            expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
          }
        },
        {
          description: 'handle case-insensitive search',
          searchText: 'OCEAN',
          expectedRooms: mockRooms.filter(room => 
            room.description.toLowerCase().includes('OCEAN'.toLowerCase())
          ),
          mockError: null,
          expectedError: null,
          assertions: (result: Room[]) => {
      expect(result).toHaveLength(1);
      expect(result[0].description).toContain('ocean');
          }
        },
        {
          description: 'handle partial word matches',
          searchText: 'lux',
          expectedRooms: mockRooms.filter(room => 
            room.description.toLowerCase().includes('lux'.toLowerCase())
          ),
          mockError: null,
          expectedError: null,
          assertions: (result: Room[]) => {
      expect(result).toHaveLength(2);
      expect(result.some(room => room.description.includes('Luxury'))).toBe(true);
      expect(result.some(room => room.description.includes('Deluxe'))).toBe(true);
      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalled();
          }
        }
      ];

      for (const { description, searchText, expectedRooms, mockError, expectedError, assertions } of testCases) {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn(),
        };

        mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        if (mockError) {
          mockQueryBuilder.getMany.mockRejectedValue(mockError);
        } else {
          mockQueryBuilder.getMany.mockResolvedValue(expectedRooms);
        }

        if (expectedError) {
          await expect(service.searchRoomsByDescription(searchText)).rejects.toThrow(expectedError);
        } else {
          const result = await service.searchRoomsByDescription(searchText);
          expect(result).toEqual(expectedRooms);
        }
        
        assertions(expectedRooms);
      }
    });
  });

  describe('findByRoomNumberAndAvailability', () => {
    const mockRooms = [
      { ...mockRoom, roomNumber: '101', availabilityStatus: AvailabilityStatus.AVAILABLE },
      { ...mockRoom, roomNumber: '102', availabilityStatus: AvailabilityStatus.OCCUPIED },
      { ...mockRoom, roomNumber: '103', availabilityStatus: AvailabilityStatus.AVAILABLE },
    ];

    it('should handle findByRoomNumberAndAvailability operations correctly', async () => {
      const testCases = [
        {
          description: 'find available room by room number',
          roomNumber: '101',
          mockResult: mockRooms.find(room => 
            room.roomNumber === '101' && 
            room.availabilityStatus === AvailabilityStatus.AVAILABLE
          ),
          expectedResult: mockRooms.find(room => 
            room.roomNumber === '101' && 
            room.availabilityStatus === AvailabilityStatus.AVAILABLE
          ),
          mockError: null,
          expectedError: null,
          assertions: (result: Room) => {
            expect(result).toEqual(mockRooms.find(room => 
              room.roomNumber === '101' && 
        room.availabilityStatus === AvailabilityStatus.AVAILABLE
            ));
            expect(roomsRepository.findOne).toHaveBeenCalledWith({
        where: {
                roomNumber: '101',
          availabilityStatus: AvailabilityStatus.AVAILABLE,
        },
      });
          }
        },
        {
          description: 'return null when room is not available',
          roomNumber: '102',
          mockResult: null,
          expectedResult: null,
          mockError: null,
          expectedError: null,
          assertions: (result: Room) => {
      expect(result).toBeNull();
            expect(roomsRepository.findOne).toHaveBeenCalledWith({
        where: {
                roomNumber: '102',
          availabilityStatus: AvailabilityStatus.AVAILABLE,
        },
      });
          }
        },
        {
          description: 'throw DatabaseException when query fails',
          roomNumber: '101',
          mockResult: null,
          expectedResult: null,
          mockError: new Error('Database error'),
          expectedError: DatabaseException,
          assertions: () => {
            expect(roomsRepository.findOne).toHaveBeenCalledWith({
              where: {
                roomNumber: '101',
                availabilityStatus: AvailabilityStatus.AVAILABLE,
              },
            });
          }
        }
      ];

      for (const { description, roomNumber, mockResult, expectedResult, mockError, expectedError, assertions } of testCases) {
        if (mockError) {
          mockRoomsRepository.findOne.mockRejectedValue(mockError);
        } else {
          mockRoomsRepository.findOne.mockResolvedValue(mockResult);
        }

        if (expectedError) {
          await expect(service.findByRoomNumberAndAvailability(roomNumber)).rejects.toThrow(expectedError);
        } else {
          const result = await service.findByRoomNumberAndAvailability(roomNumber);
          expect(result).toEqual(expectedResult);
        }
        
        assertions(expectedResult);
      }
    });
  });
}); 
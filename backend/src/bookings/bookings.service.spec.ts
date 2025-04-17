import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Room, RoomType, AvailabilityStatus } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  ResourceNotFoundException,
  DatabaseException,
  BookingValidationException,
} from '../common/exceptions/hotel-booking.exception';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepository: Repository<Booking>;
  let userRepository: Repository<User>;
  let roomRepository: Repository<Room>;

  const mockBookingRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockRoomRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Test St',
    bookings: [],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenVersion: 0,
    isActive: true,
  };

  const mockRoom: Room = {
    id: 1,
    roomNumber: '101',
    type: RoomType.STANDARD,
    pricePerNight: 100,
    maxGuests: 2,
    description: 'Standard Room',
    amenities: '[]',
    availabilityStatus: AvailabilityStatus.AVAILABLE,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBooking: Booking = {
    bookingId: 1,
    checkInDate: new Date('2024-04-01'),
    checkOutDate: new Date('2024-04-05'),
    numberOfGuests: 2,
    status: BookingStatus.PENDING,
    user: mockUser,
    room: mockRoom,
    payment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should handle all findAll scenarios', async () => {
      // Success case
      const bookings = [mockBooking];
      // Mock the count to return a value greater than 0
      mockBookingRepository.count = jest.fn().mockResolvedValueOnce(1);
      mockBookingRepository.find.mockResolvedValueOnce(bookings);
      const result = await service.findAll();
      expect(result).toEqual(bookings);
      expect(bookingRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'room', 'payment'],
      });

      // Empty bookings case
      mockBookingRepository.count = jest.fn().mockResolvedValueOnce(0);
      const emptyResult = await service.findAll();
      expect(emptyResult).toEqual([]);
      
      // Error case
      mockBookingRepository.count = jest.fn().mockResolvedValueOnce(1);
      const error = new Error('Database error');
      mockBookingRepository.find.mockRejectedValueOnce(error);
      const errorResult = await service.findAll();
      expect(errorResult).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should handle all findOne scenarios', async () => {
      // Success case
      mockBookingRepository.findOne.mockResolvedValueOnce(mockBooking);
      const result = await service.findOne(1);
      expect(result).toEqual(mockBooking);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId: 1 },
        relations: ['user', 'room', 'payment'],
      });

      // Not found case
      mockBookingRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(ResourceNotFoundException);

      // Error case
      const error = new Error('Database error');
      mockBookingRepository.findOne.mockRejectedValueOnce(error);
      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should handle all create scenarios', async () => {
      const validBookingDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-04-01'),
        checkOutDate: new Date('2024-04-05'),
        numberOfGuests: 2,
      };

      const invalidBookingDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-04-05'),
        checkOutDate: new Date('2024-04-01'),
        numberOfGuests: 2,
      };

      // Success case
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRoomRepository.findOne.mockResolvedValueOnce(mockRoom);
      mockBookingRepository.create.mockReturnValueOnce(mockBooking);
      mockBookingRepository.save.mockResolvedValueOnce(mockBooking);
      const result = await service.create(validBookingDto);
      expect(result).toEqual(mockBooking);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: validBookingDto.userId },
      });
      expect(roomRepository.findOne).toHaveBeenCalledWith({
        where: { id: validBookingDto.roomId },
      });
      expect(bookingRepository.create).toHaveBeenCalledWith({
        ...validBookingDto,
        user: mockUser,
        room: mockRoom,
        status: BookingStatus.PENDING,
      });
      expect(bookingRepository.save).toHaveBeenCalled();

      // Validation error case
      await expect(service.create(invalidBookingDto)).rejects.toThrow(BookingValidationException);

      // User not found case
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.create(validBookingDto)).rejects.toThrow(ResourceNotFoundException);

      // Room not found case
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRoomRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.create(validBookingDto)).rejects.toThrow(ResourceNotFoundException);

      // Database error case
      const error = new Error('Database error');
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRoomRepository.findOne.mockResolvedValueOnce(mockRoom);
      mockBookingRepository.create.mockReturnValueOnce(mockBooking);
      mockBookingRepository.save.mockRejectedValueOnce(error);
      await expect(service.create(validBookingDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should handle all update scenarios', async () => {
      const validUpdateDto: UpdateBookingDto = {
        checkInDate: new Date('2024-04-02'),
        checkOutDate: new Date('2024-04-06'),
        numberOfGuests: 3,
      };

      const invalidUpdateDto: UpdateBookingDto = {
        checkInDate: new Date('2024-04-06'),
        checkOutDate: new Date('2024-04-02'),
        numberOfGuests: 3,
      };

      const dtoWithNewUser: UpdateBookingDto = {
        ...validUpdateDto,
        userId: 2,
      };

      const dtoWithNewRoom: UpdateBookingDto = {
        ...validUpdateDto,
        roomId: 2,
      };

      // Success case
      const updatedBooking = {
        ...mockBooking,
        ...validUpdateDto,
      };
      mockBookingRepository.findOne.mockResolvedValueOnce(mockBooking);
      mockBookingRepository.merge.mockReturnValueOnce(updatedBooking);
      mockBookingRepository.save.mockResolvedValueOnce(updatedBooking);
      const result = await service.update(1, validUpdateDto);
      expect(result).toEqual(updatedBooking);
      expect(bookingRepository.merge).toHaveBeenCalledWith(mockBooking, {
        ...validUpdateDto,
        user: mockBooking.user,
        room: mockBooking.room,
      });

      // Not found case
      mockBookingRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.update(1, validUpdateDto)).rejects.toThrow(ResourceNotFoundException);

      // Validation error case
      mockBookingRepository.findOne.mockResolvedValueOnce(mockBooking);
      await expect(service.update(1, invalidUpdateDto)).rejects.toThrow(BookingValidationException);

      // New user not found case
      mockBookingRepository.findOne.mockResolvedValueOnce(mockBooking);
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.update(1, dtoWithNewUser)).rejects.toThrow(ResourceNotFoundException);

      // New room not found case
      mockBookingRepository.findOne.mockResolvedValueOnce(mockBooking);
      mockRoomRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.update(1, dtoWithNewRoom)).rejects.toThrow(ResourceNotFoundException);

      // Database error case
      const error = new Error('Database error');
      mockBookingRepository.findOne.mockResolvedValueOnce(mockBooking);
      mockBookingRepository.merge.mockReturnValueOnce(mockBooking);
      mockBookingRepository.save.mockRejectedValueOnce(error);
      await expect(service.update(1, validUpdateDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should handle all remove scenarios', async () => {
      // Success case
      mockBookingRepository.findOne.mockResolvedValueOnce({
        ...mockBooking,
        room: mockRoom,
      });
      mockBookingRepository.save.mockResolvedValueOnce({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });
      mockRoomRepository.save.mockResolvedValueOnce({
        ...mockRoom,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      });

      await service.remove(1);

      expect(bookingRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId: 1 },
        relations: ['user', 'room', 'payment'],
      });
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(roomRepository.save).toHaveBeenCalled();

      // Not found case
      mockBookingRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);

      // Database error case
      const error = new Error('Database error');
      mockBookingRepository.findOne.mockResolvedValueOnce({
        ...mockBooking,
        room: mockRoom,
      });
      mockBookingRepository.save.mockRejectedValueOnce(error);
      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });
});

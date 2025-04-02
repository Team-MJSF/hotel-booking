import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Room, RoomType, AvailabilityStatus } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ResourceNotFoundException, DatabaseException, BookingValidationException } from '../common/exceptions/hotel-booking.exception';

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
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockRoomRepository = {
    findOne: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
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
    it('should return an array of bookings', async () => {
      const bookings = [mockBooking];
      mockBookingRepository.find.mockResolvedValue(bookings);

      const result = await service.findAll();

      expect(result).toEqual(bookings);
      expect(bookingRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'room', 'payment'],
      });
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockBookingRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne(1);

      expect(result).toEqual(mockBooking);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId: 1 },
        relations: ['user', 'room', 'payment'],
      });
    });

    it('should throw ResourceNotFoundException when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockBookingRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    const createBookingDto: CreateBookingDto = {
      userId: 1,
      roomId: 1,
      checkInDate: new Date('2024-04-01'),
      checkOutDate: new Date('2024-04-05'),
      numberOfGuests: 2,
    };

    it('should create a new booking', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockBookingRepository.create.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(mockBooking);

      const result = await service.create(createBookingDto);

      expect(result).toEqual(mockBooking);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: createBookingDto.userId } });
      expect(roomRepository.findOne).toHaveBeenCalledWith({ where: { id: createBookingDto.roomId } });
      expect(bookingRepository.create).toHaveBeenCalledWith({
        ...createBookingDto,
        user: mockUser,
        room: mockRoom,
      });
      expect(bookingRepository.save).toHaveBeenCalled();
    });

    it('should throw BookingValidationException when check-in date is after check-out date', async () => {
      const invalidDto = {
        ...createBookingDto,
        checkInDate: new Date('2024-04-05'),
        checkOutDate: new Date('2024-04-01'),
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BookingValidationException);
    });

    it('should throw ResourceNotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBookingDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw ResourceNotFoundException when room not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBookingDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockBookingRepository.create.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockRejectedValue(error);

      await expect(service.create(createBookingDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    const updateBookingDto: UpdateBookingDto = {
      checkInDate: new Date('2024-04-02'),
      checkOutDate: new Date('2024-04-06'),
      numberOfGuests: 3,
    };

    it('should update a booking', async () => {
      const updatedBooking = {
        ...mockBooking,
        ...updateBookingDto,
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.merge.mockReturnValue(updatedBooking);
      mockBookingRepository.save.mockResolvedValue(updatedBooking);

      const result = await service.update(1, updateBookingDto);

      expect(result).toEqual(updatedBooking);
      expect(bookingRepository.merge).toHaveBeenCalledWith(mockBooking, {
        ...updateBookingDto,
        user: mockBooking.user,
        room: mockBooking.room,
      });
    });

    it('should throw ResourceNotFoundException when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateBookingDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw BookingValidationException when check-in date is after check-out date', async () => {
      const invalidDto = {
        checkInDate: new Date('2024-04-06'),
        checkOutDate: new Date('2024-04-02'),
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);

      await expect(service.update(1, invalidDto)).rejects.toThrow(BookingValidationException);
    });

    it('should throw ResourceNotFoundException when new user not found', async () => {
      const dtoWithNewUser = { ...updateBookingDto, userId: 2 };
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, dtoWithNewUser)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw ResourceNotFoundException when new room not found', async () => {
      const dtoWithNewRoom = { ...updateBookingDto, roomId: 2 };
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, dtoWithNewRoom)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.merge.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockRejectedValue(error);

      await expect(service.update(1, updateBookingDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should remove a booking', async () => {
      mockBookingRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(bookingRepository.softDelete).toHaveBeenCalledWith({ bookingId: 1 });
    });

    it('should throw ResourceNotFoundException when booking not found', async () => {
      mockBookingRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockBookingRepository.softDelete.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });
}); 
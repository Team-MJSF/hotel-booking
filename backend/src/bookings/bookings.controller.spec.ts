import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { ResourceNotFoundException, DatabaseException, BookingValidationException } from '../common/exceptions/hotel-booking.exception';
import { RoomType, AvailabilityStatus } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { User } from '../users/entities/user.entity';

// Increase timeout for all tests
jest.setTimeout(10000);

type MockBookingsService = {
  findAll: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  findByUserId: jest.Mock;
  findByRoomId: jest.Mock;
  updateStatus: jest.Mock;
};

describe('BookingsController', () => {
  let controller: BookingsController;
  let mockBookingsService: MockBookingsService;

  const mockBooking: Booking = {
    bookingId: 1,
    user: {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      role: 'user',
      bookings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User,
    room: {
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
    },
    checkInDate: new Date('2024-03-20'),
    checkOutDate: new Date('2024-03-25'),
    numberOfGuests: 2,
    status: BookingStatus.PENDING,
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockBookingsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByUserId: jest.fn(),
      findByRoomId: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of bookings', async () => {
      const bookings = [mockBooking];
      mockBookingsService.findAll.mockResolvedValue(bookings);

      const result = await controller.findAll();

      expect(result).toEqual(bookings);
      expect(mockBookingsService.findAll).toHaveBeenCalled();
    });

    it('should throw DatabaseException when service fails', async () => {
      const error = new DatabaseException('Failed to fetch bookings', new Error('Database error'));
      mockBookingsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should return a single booking', async () => {
      mockBookingsService.findOne.mockResolvedValue(mockBooking);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when booking is not found', async () => {
      mockBookingsService.findOne.mockRejectedValue(new ResourceNotFoundException('Booking', 1));

      await expect(controller.findOne('1')).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const error = new DatabaseException('Failed to fetch booking', new Error('Database error'));
      mockBookingsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('1')).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const createBookingDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
      };

      mockBookingsService.create.mockResolvedValue(mockBooking);

      const result = await controller.create(createBookingDto);

      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.create).toHaveBeenCalledWith(createBookingDto);
    });

    it('should throw BookingValidationException for invalid dates', async () => {
      const createBookingDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-03-25'),
        checkOutDate: new Date('2024-03-20'),
        numberOfGuests: 2,
      };

      mockBookingsService.create.mockRejectedValue(
        new BookingValidationException('Check-in date must be before check-out date', [
          { field: 'checkInDate', message: 'Check-in date must be before check-out date' },
          { field: 'checkOutDate', message: 'Check-out date must be after check-in date' },
        ]),
      );

      await expect(controller.create(createBookingDto)).rejects.toThrow(BookingValidationException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const createBookingDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
      };

      const error = new DatabaseException('Failed to create booking', new Error('Database error'));
      mockBookingsService.create.mockRejectedValue(error);

      await expect(controller.create(createBookingDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should update a booking', async () => {
      const updateBookingDto: Partial<Booking> = {
        status: BookingStatus.CONFIRMED,
      };

      const updatedBooking = { ...mockBooking, ...updateBookingDto };
      mockBookingsService.update.mockResolvedValue(updatedBooking);

      const result = await controller.update('1', updateBookingDto);

      expect(result).toEqual(updatedBooking);
      expect(mockBookingsService.update).toHaveBeenCalledWith(1, updateBookingDto);
    });

    it('should throw ResourceNotFoundException when booking is not found', async () => {
      const updateBookingDto: Partial<Booking> = {
        status: BookingStatus.CONFIRMED,
      };

      mockBookingsService.update.mockRejectedValue(new ResourceNotFoundException('Booking', 1));

      await expect(controller.update('1', updateBookingDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw BookingValidationException for invalid dates', async () => {
      const updateBookingDto: Partial<Booking> = {
        checkInDate: new Date('2024-03-25'),
        checkOutDate: new Date('2024-03-20'),
      };

      mockBookingsService.update.mockRejectedValue(
        new BookingValidationException('Check-in date must be before check-out date', [
          { field: 'checkInDate', message: 'Check-in date must be before check-out date' },
          { field: 'checkOutDate', message: 'Check-out date must be after check-in date' },
        ]),
      );

      await expect(controller.update('1', updateBookingDto)).rejects.toThrow(BookingValidationException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const updateBookingDto: Partial<Booking> = {
        status: BookingStatus.CONFIRMED,
      };

      const error = new DatabaseException('Failed to update booking', new Error('Database error'));
      mockBookingsService.update.mockRejectedValue(error);

      await expect(controller.update('1', updateBookingDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should remove a booking', async () => {
      mockBookingsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockBookingsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when booking is not found', async () => {
      mockBookingsService.remove.mockRejectedValue(new ResourceNotFoundException('Booking', 1));

      await expect(controller.remove('1')).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const error = new DatabaseException('Failed to delete booking', new Error('Database error'));
      mockBookingsService.remove.mockRejectedValue(error);

      await expect(controller.remove('1')).rejects.toThrow(DatabaseException);
    });
  });
});

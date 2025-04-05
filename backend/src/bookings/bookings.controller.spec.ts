import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { ResourceNotFoundException, DatabaseException, BookingValidationException } from '../common/exceptions/hotel-booking.exception';
import { RoomType, AvailabilityStatus } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { Payment, PaymentStatus, PaymentMethod, Currency } from '../payments/entities/payment.entity';
import { UserRole } from '../users/entities/user.entity';

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
  findAvailableRooms: jest.Mock;
};

describe('BookingsController', () => {
  let controller: BookingsController;
  let mockBookingsService: MockBookingsService;

  const mockRoom: Room = {
    id: 1,
    roomNumber: '101',
    type: RoomType.SINGLE,
    pricePerNight: 100,
    maxGuests: 2,
    description: 'Test room',
    amenities: '[]',
    photos: [],
    availabilityStatus: AvailabilityStatus.AVAILABLE,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
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
    isActive: true
  };

  const mockPayment: Payment = {
    paymentId: 1,
    booking: null,
    amount: 100.00,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    currency: Currency.USD,
  };

  const mockBooking: Booking = {
    bookingId: 1,
    checkInDate: new Date(),
    checkOutDate: new Date(),
    numberOfGuests: 2,
    status: BookingStatus.PENDING,
    room: mockRoom,
    user: mockUser,
    payment: mockPayment,
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
      findAvailableRooms: jest.fn(),
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
    it('should handle all findAll scenarios', async () => {
      // Success case
      const bookings = [mockBooking];
      mockBookingsService.findAll.mockResolvedValueOnce(bookings);
      const result = await controller.findAll();
      expect(result).toEqual(bookings);
      expect(mockBookingsService.findAll).toHaveBeenCalled();

      // Error case
      const error = new DatabaseException('Failed to fetch bookings', new Error('Database error'));
      mockBookingsService.findAll.mockRejectedValueOnce(error);
      await expect(controller.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should handle all findOne scenarios', async () => {
      // Success case
      mockBookingsService.findOne.mockResolvedValueOnce(mockBooking);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith(1);

      // Not found case
      mockBookingsService.findOne.mockRejectedValueOnce(new ResourceNotFoundException('Booking', 1));
      await expect(controller.findOne('1')).rejects.toThrow(ResourceNotFoundException);

      // Database error case
      const error = new DatabaseException('Failed to fetch booking', new Error('Database error'));
      mockBookingsService.findOne.mockRejectedValueOnce(error);
      await expect(controller.findOne('1')).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should handle all create scenarios', async () => {
      const validBookingDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 2,
      };

      const invalidBookingDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-03-25'),
        checkOutDate: new Date('2024-03-20'),
        numberOfGuests: 2,
      };

      // Success case
      mockBookingsService.create.mockResolvedValueOnce(mockBooking);
      const result = await controller.create(validBookingDto);
      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.create).toHaveBeenCalledWith(validBookingDto);

      // Validation error case
      const validationError = new BookingValidationException('Check-in date must be before check-out date', [
        { field: 'checkInDate', message: 'Check-in date must be before check-out date' },
        { field: 'checkOutDate', message: 'Check-out date must be after check-in date' },
      ]);
      mockBookingsService.create.mockRejectedValueOnce(validationError);
      await expect(controller.create(invalidBookingDto)).rejects.toThrow(BookingValidationException);

      // Database error case
      const error = new DatabaseException('Failed to create booking', new Error('Database error'));
      mockBookingsService.create.mockRejectedValueOnce(error);
      await expect(controller.create(validBookingDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should handle all update scenarios', async () => {
      const validUpdateDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-03-20'),
        checkOutDate: new Date('2024-03-25'),
        numberOfGuests: 3,
      };

      const invalidUpdateDto: CreateBookingDto = {
        userId: 1,
        roomId: 1,
        checkInDate: new Date('2024-03-25'),
        checkOutDate: new Date('2024-03-20'),
        numberOfGuests: 3,
      };

      // Success case
      const updatedBooking = { ...mockBooking, ...validUpdateDto };
      mockBookingsService.update.mockResolvedValueOnce(updatedBooking);
      const result = await controller.update('1', validUpdateDto);
      expect(result).toEqual(updatedBooking);
      expect(mockBookingsService.update).toHaveBeenCalledWith(1, validUpdateDto);

      // Not found case
      mockBookingsService.update.mockRejectedValueOnce(new ResourceNotFoundException('Booking', 1));
      await expect(controller.update('1', validUpdateDto)).rejects.toThrow(ResourceNotFoundException);

      // Validation error case
      const validationError = new BookingValidationException('Check-in date must be before check-out date', [
        { field: 'checkInDate', message: 'Check-in date must be before check-out date' },
        { field: 'checkOutDate', message: 'Check-out date must be after check-in date' },
      ]);
      mockBookingsService.update.mockRejectedValueOnce(validationError);
      await expect(controller.update('1', invalidUpdateDto)).rejects.toThrow(BookingValidationException);

      // Database error case
      const error = new DatabaseException('Failed to update booking', new Error('Database error'));
      mockBookingsService.update.mockRejectedValueOnce(error);
      await expect(controller.update('1', validUpdateDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should handle all remove scenarios', async () => {
      // Success case
      mockBookingsService.remove.mockResolvedValueOnce(undefined);
      await controller.remove('1');
      expect(mockBookingsService.remove).toHaveBeenCalledWith(1);

      // Not found case
      mockBookingsService.remove.mockRejectedValueOnce(new ResourceNotFoundException('Booking', 1));
      await expect(controller.remove('1')).rejects.toThrow(ResourceNotFoundException);

      // Database error case
      const error = new DatabaseException('Failed to delete booking', new Error('Database error'));
      mockBookingsService.remove.mockRejectedValueOnce(error);
      await expect(controller.remove('1')).rejects.toThrow(DatabaseException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import {
  ResourceNotFoundException,
  DatabaseException,
  BookingValidationException,
} from '../common/exceptions/hotel-booking.exception';
import { RoomType, AvailabilityStatus } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  Currency,
} from '../payments/entities/payment.entity';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Increase timeout for all tests
jest.setTimeout(10000);

// Mock the CurrentUser decorator
jest.mock('../auth/decorators/current-user.decorator', () => ({
  CurrentUser: () => jest.fn(),
}));

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
  createTemporary: jest.Mock;
};

describe('BookingsController', () => {
  let controller: BookingsController;
  let mockBookingsService: MockBookingsService;

  const mockRoom: Room = {
    id: 1,
    roomNumber: '101',
    type: RoomType.STANDARD,
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
    isActive: true,
  };

  const mockPayment: Payment = {
    paymentId: 1,
    booking: null,
    amount: 100.0,
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
    isTemporary: false,
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
      createTemporary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

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
      const result = await controller.findAll(mockUser);
      expect(result).toEqual(bookings);
      expect(mockBookingsService.findAll).toHaveBeenCalled();

      // Empty array case
      mockBookingsService.findAll.mockResolvedValueOnce([]);
      const emptyResult = await controller.findAll(mockUser);
      expect(emptyResult).toEqual([]);

      // Error case
      const error = new DatabaseException('Failed to fetch bookings', new Error('Database error'));
      mockBookingsService.findAll.mockRejectedValueOnce(error);
      await expect(controller.findAll(mockUser)).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should handle all findOne scenarios', async () => {
      // Success case
      mockBookingsService.findOne.mockResolvedValueOnce(mockBooking);
      const result = await controller.findOne('1', mockUser);
      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith(1);

      // Not found case
      mockBookingsService.findOne.mockRejectedValueOnce(
        new ResourceNotFoundException('Booking', 1),
      );
      await expect(controller.findOne('1', mockUser)).rejects.toThrow(ResourceNotFoundException);

      // Database error case
      const error = new DatabaseException('Failed to fetch booking', new Error('Database error'));
      mockBookingsService.findOne.mockRejectedValueOnce(error);
      await expect(controller.findOne('1', mockUser)).rejects.toThrow(ResourceNotFoundException);
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
      const result = await controller.create(validBookingDto, mockUser);
      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.create).toHaveBeenCalledWith(validBookingDto);

      // Validation error case - the controller catches service errors and creates a temporary booking
      const validationError = new BookingValidationException(
        'Check-in date must be before check-out date',
        [
          { field: 'checkInDate', message: 'Check-in date must be before check-out date' },
          { field: 'checkOutDate', message: 'Check-out date must be after check-in date' },
        ],
      );
      
      // Mock the createTemporary method to return a temporary booking
      mockBookingsService.create.mockRejectedValueOnce(validationError);
      mockBookingsService.createTemporary = jest.fn().mockResolvedValueOnce({
        ...mockBooking,
        isTemporary: true,
      });
      
      const mockResult = await controller.create(invalidBookingDto, mockUser);
      expect(mockResult).toBeDefined();
      expect(mockResult.isTemporary).toBe(true);
      expect(mockBookingsService.createTemporary).toHaveBeenCalled();

      // Database error case - should also create a temporary booking
      const dbError = new DatabaseException('Failed to create booking', new Error('Database error'));
      mockBookingsService.create.mockRejectedValueOnce(dbError);
      mockBookingsService.createTemporary.mockResolvedValueOnce({
        ...mockBooking,
        isTemporary: true,
      });
      
      const mockResult2 = await controller.create(validBookingDto, mockUser);
      expect(mockResult2).toBeDefined();
      expect(mockResult2.isTemporary).toBe(true);
      expect(mockBookingsService.createTemporary).toHaveBeenCalled();
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
      // Mock findOne first since the controller now calls it to check permissions
      mockBookingsService.findOne.mockResolvedValueOnce(mockBooking);
      const updatedBooking = { ...mockBooking, ...validUpdateDto };
      mockBookingsService.update.mockResolvedValueOnce(updatedBooking);
      const result = await controller.update('1', validUpdateDto, mockUser);
      expect(result).toEqual(updatedBooking);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith(1);
      expect(mockBookingsService.update).toHaveBeenCalled();

      // Not found case - findOne throws - controller creates a temporary booking
      mockBookingsService.findOne.mockRejectedValueOnce(
        new ResourceNotFoundException('Booking', 1),
      );
      mockBookingsService.createTemporary = jest.fn().mockResolvedValueOnce({
        ...mockBooking,
        bookingId: 1,
        isTemporary: true,
      });
      const notFoundResult = await controller.update('1', validUpdateDto, mockUser);
      expect(notFoundResult).toBeDefined();
      expect(notFoundResult.isTemporary).toBe(true);
      expect(mockBookingsService.createTemporary).toHaveBeenCalled();

      // Validation error case - controller throws these errors
      mockBookingsService.findOne.mockResolvedValueOnce(mockBooking); // Mock findOne to succeed
      const validationError = new BookingValidationException(
        'Check-in date must be before check-out date',
        [
          { field: 'checkInDate', message: 'Check-in date must be before check-out date' },
          { field: 'checkOutDate', message: 'Check-out date must be after check-in date' },
        ],
      );
      mockBookingsService.update.mockRejectedValueOnce(validationError);
      await expect(controller.update('1', invalidUpdateDto, mockUser)).rejects.toThrow(
        BookingValidationException,
      );

      // Database error case - controller throws these errors too
      mockBookingsService.findOne.mockResolvedValueOnce(mockBooking); // Mock findOne to succeed
      const error = new DatabaseException('Failed to update booking', new Error('Database error'));
      mockBookingsService.update.mockRejectedValueOnce(error);
      await expect(controller.update('1', validUpdateDto, mockUser)).rejects.toThrow(
        DatabaseException,
      );
    });

    // Test for temporary booking handling
    it('should handle temporary booking flag', async () => {
      // Setup a temporary booking
      const temporaryBooking = {
        ...mockBooking,
        isTemporary: true
      };
      
      mockBookingsService.findOne.mockResolvedValueOnce(temporaryBooking);
      mockBookingsService.update.mockResolvedValueOnce({
        ...temporaryBooking,
        status: BookingStatus.CONFIRMED,
        isTemporary: false
      });
      
      const result = await controller.update('1', { status: 'confirmed' }, mockUser);
      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(result.isTemporary).toBe(false);
      expect(mockBookingsService.update).toHaveBeenCalled();
    });
  });

  // Test for updateStatus method
  describe('updateStatus', () => {
    it('should call update method with status', async () => {
      // Mock the update method to return a successful result
      jest.spyOn(controller, 'update').mockResolvedValueOnce({
        bookingId: 1,
        status: BookingStatus.CONFIRMED,
        user: mockUser,
        room: mockRoom,
        checkInDate: new Date(),
        checkOutDate: new Date(),
        numberOfGuests: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemporary: false
      } as Booking);
      
      const result = await controller.updateStatus('1', { status: 'confirmed' }, mockUser);
      expect(controller.update).toHaveBeenCalledWith('1', { status: 'confirmed' }, mockUser);
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });
  });

  // Test for cancelBooking method  
  describe('cancelBooking', () => {
    it('should handle booking cancellation', async () => {
      // Test successful cancellation
      mockBookingsService.findOne.mockResolvedValue(mockBooking);
      mockBookingsService.update.mockResolvedValue({...mockBooking, status: BookingStatus.CANCELLED});
      
      // Mock the update method
      jest.spyOn(controller, 'update').mockResolvedValueOnce({
        ...mockBooking,
        status: BookingStatus.CANCELLED
      });
      
      const result = await controller.cancelBooking('1', mockUser);
      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(controller.update).toHaveBeenCalledWith('1', { status: BookingStatus.CANCELLED }, mockUser);
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

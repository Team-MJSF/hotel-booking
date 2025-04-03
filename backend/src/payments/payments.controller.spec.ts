import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod, Currency } from './entities/payment.entity';
import { ResourceNotFoundException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Room, RoomType, AvailabilityStatus } from '../rooms/entities/room.entity';
import { User, UserRole } from '../users/entities/user.entity';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockPaymentsService: jest.Mocked<Pick<PaymentsService, 'findAll' | 'findOne' | 'create' | 'update' | 'remove' | 'findByBookingId' | 'processRefund' | 'updatePaymentStatus'>>;

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
    password: 'hashedPassword',
    role: UserRole.USER,
    phoneNumber: '1234567890',
    address: '123 Main St',
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBooking: Booking = {
    bookingId: 1,
    checkInDate: new Date(),
    checkOutDate: new Date(),
    numberOfGuests: 2,
    status: BookingStatus.PENDING,
    room: mockRoom,
    user: mockUser,
    payment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPayment: Payment = {
    paymentId: 1,
    booking: mockBooking,
    amount: 100.00,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.PENDING,
    currency: Currency.USD,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPaymentsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByBookingId: jest.fn(),
      processRefund: jest.fn(),
      updatePaymentStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
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
      const payments = [mockPayment];
      mockPaymentsService.findAll.mockResolvedValueOnce(payments);
      const result = await controller.findAll();
      expect(result).toEqual(payments);
      expect(mockPaymentsService.findAll).toHaveBeenCalled();

      // Test error handling
      const error = new DatabaseException('Failed to fetch payments', new Error('Database error'));
      mockPaymentsService.findAll.mockRejectedValueOnce(error);
      await expect(controller.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should handle all findOne scenarios', async () => {
      // Test successful retrieval
      mockPaymentsService.findOne.mockResolvedValueOnce(mockPayment);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.findOne).toHaveBeenCalledWith(1);

      // Test not found error
      mockPaymentsService.findOne.mockRejectedValueOnce(new ResourceNotFoundException('Payment', 1));
      await expect(controller.findOne('1')).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to fetch payment', new Error('Database error'));
      mockPaymentsService.findOne.mockRejectedValueOnce(error);
      await expect(controller.findOne('1')).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should handle all create scenarios', async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 100.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
      };

      // Test successful creation
      mockPaymentsService.create.mockResolvedValueOnce(mockPayment);
      const result = await controller.create(createPaymentDto);
      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.create).toHaveBeenCalledWith(createPaymentDto);

      // Test database error
      const error = new DatabaseException('Failed to create payment', new Error('Database error'));
      mockPaymentsService.create.mockRejectedValueOnce(error);
      await expect(controller.create(createPaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should handle all update scenarios', async () => {
      const updatePaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 150.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
        currency: Currency.USD,
      };

      // Test successful update
      const updatedPayment = { ...mockPayment, ...updatePaymentDto };
      mockPaymentsService.update.mockResolvedValueOnce(updatedPayment);
      const result = await controller.update('1', updatePaymentDto);
      expect(result).toEqual(updatedPayment);
      expect(mockPaymentsService.update).toHaveBeenCalledWith(1, updatePaymentDto);

      // Test not found error
      mockPaymentsService.update.mockRejectedValueOnce(new ResourceNotFoundException('Payment', 1));
      await expect(controller.update('1', updatePaymentDto)).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to update payment', new Error('Database error'));
      mockPaymentsService.update.mockRejectedValueOnce(error);
      await expect(controller.update('1', updatePaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should handle all remove scenarios', async () => {
      // Test successful removal
      mockPaymentsService.remove.mockResolvedValueOnce(undefined);
      await controller.remove('1');
      expect(mockPaymentsService.remove).toHaveBeenCalledWith(1);

      // Test not found error
      mockPaymentsService.remove.mockRejectedValueOnce(new ResourceNotFoundException('Payment', 1));
      await expect(controller.remove('1')).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to delete payment', new Error('Database error'));
      mockPaymentsService.remove.mockRejectedValueOnce(error);
      await expect(controller.remove('1')).rejects.toThrow(DatabaseException);
    });
  });

  describe('findByBookingId', () => {
    it('should handle all findByBookingId scenarios', async () => {
      // Test successful retrieval
      mockPaymentsService.findByBookingId.mockResolvedValueOnce(mockPayment);
      const result = await controller.findByBookingId('1');
      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.findByBookingId).toHaveBeenCalledWith(1);

      // Test not found error
      mockPaymentsService.findByBookingId.mockRejectedValueOnce(new ResourceNotFoundException('Payment', 1));
      await expect(controller.findByBookingId('1')).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to fetch payment', new Error('Database error'));
      mockPaymentsService.findByBookingId.mockRejectedValueOnce(error);
      await expect(controller.findByBookingId('1')).rejects.toThrow(DatabaseException);
    });
  });

  describe('processRefund', () => {
    it('should handle all processRefund scenarios', async () => {
      const refundReason = 'Customer request';

      // Test successful refund
      const refundedPayment = { ...mockPayment, status: PaymentStatus.REFUNDED };
      mockPaymentsService.processRefund.mockResolvedValueOnce(refundedPayment);
      const result = await controller.processRefund('1', refundReason);
      expect(result).toEqual(refundedPayment);
      expect(mockPaymentsService.processRefund).toHaveBeenCalledWith(1, refundReason);

      // Test not found error
      mockPaymentsService.processRefund.mockRejectedValueOnce(new ResourceNotFoundException('Payment', 1));
      await expect(controller.processRefund('1', refundReason)).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to process refund', new Error('Database error'));
      mockPaymentsService.processRefund.mockRejectedValueOnce(error);
      await expect(controller.processRefund('1', refundReason)).rejects.toThrow(DatabaseException);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should handle all updatePaymentStatus scenarios', async () => {
      const newStatus = PaymentStatus.COMPLETED;

      // Test successful status update
      const updatedPayment = { ...mockPayment, status: newStatus };
      mockPaymentsService.updatePaymentStatus.mockResolvedValueOnce(updatedPayment);
      const result = await controller.updatePaymentStatus('1', newStatus);
      expect(result).toEqual(updatedPayment);
      expect(mockPaymentsService.updatePaymentStatus).toHaveBeenCalledWith(1, newStatus);

      // Test not found error
      mockPaymentsService.updatePaymentStatus.mockRejectedValueOnce(new ResourceNotFoundException('Payment', 1));
      await expect(controller.updatePaymentStatus('1', newStatus)).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new DatabaseException('Failed to update payment status', new Error('Database error'));
      mockPaymentsService.updatePaymentStatus.mockRejectedValueOnce(error);
      await expect(controller.updatePaymentStatus('1', newStatus)).rejects.toThrow(DatabaseException);
    });
  });
});

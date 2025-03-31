import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { ResourceNotFoundException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Room, RoomType, AvailabilityStatus } from '../rooms/entities/room.entity';
import { User, UserRole } from '../users/entities/user.entity';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const mockPaymentsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByBookingId: jest.fn(),
    processRefund: jest.fn(),
    updatePaymentStatus: jest.fn(),
  };

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
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPayment: Payment = {
    paymentId: 1,
    bookingId: 1,
    amount: 100.00,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    booking: mockBooking,
  };

  beforeEach(async () => {
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of payments', async () => {
      const payments = [mockPayment];
      mockPaymentsService.findAll.mockResolvedValue(payments);

      const result = await controller.findAll();
      expect(result).toEqual(payments);
      expect(mockPaymentsService.findAll).toHaveBeenCalled();
    });

    it('should throw DatabaseException when service fails', async () => {
      const error = new DatabaseException('Failed to fetch payments', new Error('Database error'));
      mockPaymentsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should return a single payment', async () => {
      mockPaymentsService.findOne.mockResolvedValue(mockPayment);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when payment is not found', async () => {
      mockPaymentsService.findOne.mockRejectedValue(new ResourceNotFoundException('Payment', 1));

      await expect(controller.findOne('1')).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const error = new DatabaseException('Failed to fetch payment', new Error('Database error'));
      mockPaymentsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('1')).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 100.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
      };

      mockPaymentsService.create.mockResolvedValue(mockPayment);

      const result = await controller.create(createPaymentDto);
      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.create).toHaveBeenCalledWith(createPaymentDto);
    });

    it('should throw DatabaseException when service fails', async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 100.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
      };

      const error = new DatabaseException('Failed to create payment', new Error('Database error'));
      mockPaymentsService.create.mockRejectedValue(error);

      await expect(controller.create(createPaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updatePaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 150.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
      };

      const updatedPayment = { ...mockPayment, ...updatePaymentDto };
      mockPaymentsService.update.mockResolvedValue(updatedPayment);

      const result = await controller.update('1', updatePaymentDto);
      expect(result).toEqual(updatedPayment);
      expect(mockPaymentsService.update).toHaveBeenCalledWith(1, updatePaymentDto);
    });

    it('should throw ResourceNotFoundException when payment is not found', async () => {
      const updatePaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 150.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
      };

      mockPaymentsService.update.mockRejectedValue(new ResourceNotFoundException('Payment', 1));

      await expect(controller.update('1', updatePaymentDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const updatePaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 150.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
      };

      const error = new DatabaseException('Failed to update payment', new Error('Database error'));
      mockPaymentsService.update.mockRejectedValue(error);

      await expect(controller.update('1', updatePaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should remove a payment', async () => {
      mockPaymentsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(mockPaymentsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when payment is not found', async () => {
      mockPaymentsService.remove.mockRejectedValue(new ResourceNotFoundException('Payment', 1));

      await expect(controller.remove('1')).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const error = new DatabaseException('Failed to delete payment', new Error('Database error'));
      mockPaymentsService.remove.mockRejectedValue(error);

      await expect(controller.remove('1')).rejects.toThrow(DatabaseException);
    });
  });

  describe('findByBookingId', () => {
    it('should return payments for a booking', async () => {
      const payments = [mockPayment];
      mockPaymentsService.findByBookingId.mockResolvedValue(payments);

      const result = await controller.findByBookingId('1');
      expect(result).toEqual(payments);
      expect(mockPaymentsService.findByBookingId).toHaveBeenCalledWith(1);
    });
  });

  describe('processRefund', () => {
    it('should process a refund', async () => {
      const refundReason = 'Customer request';
      const refundedPayment = { ...mockPayment, status: PaymentStatus.REFUNDED, refundReason };
      mockPaymentsService.processRefund.mockResolvedValue(refundedPayment);

      const result = await controller.processRefund('1', refundReason);
      expect(result).toEqual(refundedPayment);
      expect(mockPaymentsService.processRefund).toHaveBeenCalledWith(1, refundReason);
    });

    it('should throw ResourceNotFoundException when payment is not found', async () => {
      const refundReason = 'Customer request';
      mockPaymentsService.processRefund.mockRejectedValue(new ResourceNotFoundException('Payment', 1));

      await expect(controller.processRefund('1', refundReason)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const refundReason = 'Customer request';
      const error = new DatabaseException('Failed to process refund', new Error('Database error'));
      mockPaymentsService.processRefund.mockRejectedValue(error);

      await expect(controller.processRefund('1', refundReason)).rejects.toThrow(DatabaseException);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const newStatus = PaymentStatus.COMPLETED;
      const updatedPayment = { ...mockPayment, status: newStatus };
      mockPaymentsService.updatePaymentStatus.mockResolvedValue(updatedPayment);

      const result = await controller.updatePaymentStatus('1', newStatus);
      expect(result).toEqual(updatedPayment);
      expect(mockPaymentsService.updatePaymentStatus).toHaveBeenCalledWith(1, newStatus);
    });
  });
});

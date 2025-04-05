import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod, Currency } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  ResourceNotFoundException,
  DatabaseException,
} from '../common/exceptions/hotel-booking.exception';
import { BookingsService } from '../bookings/bookings.service';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepository: Repository<Payment>;
  let bookingsRepository: Repository<Booking>;

  const mockPaymentsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockBookingsRepository = {
    findOne: jest.fn(),
  };

  const mockBookingsService = {
    findOne: jest.fn(),
  };

  const mockBooking: Booking = {
    bookingId: 1,
    checkInDate: new Date(),
    checkOutDate: new Date(),
    numberOfGuests: 2,
    status: BookingStatus.CONFIRMED,
    user: null,
    room: null,
    payment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPayment: Payment = {
    paymentId: 1,
    booking: mockBooking,
    amount: 200,
    currency: Currency.USD,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    transactionId: 'txn_123',
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentsRepository,
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingsRepository,
        },
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentsRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    bookingsRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should handle all findAll scenarios', async () => {
      // Test successful retrieval
      const expectedPayments = [mockPayment];
      mockPaymentsRepository.find.mockResolvedValueOnce(expectedPayments);
      const result = await service.findAll();
      expect(result).toEqual(expectedPayments);
      expect(paymentsRepository.find).toHaveBeenCalledWith({
        relations: ['booking'],
      });

      // Test empty result
      mockPaymentsRepository.find.mockResolvedValueOnce([]);
      const emptyResult = await service.findAll();
      expect(emptyResult).toEqual([]);
      expect(paymentsRepository.find).toHaveBeenCalledWith({
        relations: ['booking'],
      });

      // Test database error
      const error = new Error('Database error');
      mockPaymentsRepository.find.mockRejectedValueOnce(error);
      await expect(service.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should handle all findOne scenarios', async () => {
      // Test successful retrieval
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      const result = await service.findOne(1);
      expect(result).toEqual(mockPayment);
      expect(paymentsRepository.findOne).toHaveBeenCalledWith({
        where: { paymentId: 1 },
        relations: ['booking'],
      });

      // Test not found error
      mockPaymentsRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockRejectedValueOnce(error);
      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    it('should handle all create scenarios', async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 200,
        currency: Currency.USD,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionId: 'txn_123',
        status: PaymentStatus.PENDING,
      };

      // Test successful creation
      mockBookingsRepository.findOne.mockResolvedValueOnce(mockBooking);
      mockPaymentsRepository.create.mockReturnValueOnce(mockPayment);
      mockPaymentsRepository.save.mockResolvedValueOnce(mockPayment);
      const result = await service.create(createPaymentDto);
      expect(result).toEqual(mockPayment);
      expect(bookingsRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId: createPaymentDto.bookingId },
        relations: ['payment'],
      });
      expect(paymentsRepository.create).toHaveBeenCalledWith({
        ...createPaymentDto,
        booking: mockBooking,
      });
      expect(paymentsRepository.save).toHaveBeenCalled();

      // Test booking not found error
      mockBookingsRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.create(createPaymentDto)).rejects.toThrow(ResourceNotFoundException);

      // Test payment already exists error
      mockBookingsRepository.findOne.mockResolvedValueOnce({
        ...mockBooking,
        payment: mockPayment,
      });
      await expect(service.create(createPaymentDto)).rejects.toThrow(DatabaseException);

      // Test database error
      const error = new Error('Database error');
      mockBookingsRepository.findOne.mockResolvedValueOnce(mockBooking);
      mockPaymentsRepository.create.mockReturnValueOnce(mockPayment);
      mockPaymentsRepository.save.mockRejectedValueOnce(error);
      await expect(service.create(createPaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should handle all update scenarios', async () => {
      const updatePaymentDto: UpdatePaymentDto = {
        amount: 250,
        status: PaymentStatus.COMPLETED,
      };

      // Test successful update
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      mockPaymentsRepository.merge.mockReturnValueOnce({
        ...mockPayment,
        ...updatePaymentDto,
      });
      mockPaymentsRepository.save.mockResolvedValueOnce({
        ...mockPayment,
        ...updatePaymentDto,
      });
      const result = await service.update(1, updatePaymentDto);
      expect(result).toEqual({
        ...mockPayment,
        ...updatePaymentDto,
      });
      expect(paymentsRepository.findOne).toHaveBeenCalledWith({
        where: { paymentId: 1 },
        relations: ['booking'],
      });
      expect(paymentsRepository.merge).toHaveBeenCalled();
      expect(paymentsRepository.save).toHaveBeenCalled();

      // Test payment not found error
      mockPaymentsRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.update(1, updatePaymentDto)).rejects.toThrow(ResourceNotFoundException);

      // Test new booking not found error
      const updateWithNewBooking = {
        ...updatePaymentDto,
        bookingId: 2,
      };
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      mockBookingsRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.update(1, updateWithNewBooking)).rejects.toThrow(
        ResourceNotFoundException,
      );

      // Test database error
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      mockPaymentsRepository.merge.mockReturnValueOnce({
        ...mockPayment,
        ...updatePaymentDto,
      });
      mockPaymentsRepository.save.mockRejectedValueOnce(error);
      await expect(service.update(1, updatePaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should handle all remove scenarios', async () => {
      // Test successful removal
      mockPaymentsRepository.softDelete.mockResolvedValueOnce({ affected: 1 });
      await service.remove(1);
      expect(paymentsRepository.softDelete).toHaveBeenCalledWith({ paymentId: 1 });

      // Test not found error
      mockPaymentsRepository.softDelete.mockResolvedValueOnce({ affected: 0 });
      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new Error('Database error');
      mockPaymentsRepository.softDelete.mockRejectedValueOnce(error);
      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('findByBookingId', () => {
    it('should handle all findByBookingId scenarios', async () => {
      // Test successful retrieval
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      const result = await service.findByBookingId(1);
      expect(result).toEqual(mockPayment);
      expect(paymentsRepository.findOne).toHaveBeenCalledWith({
        where: { booking: { bookingId: 1 } },
        relations: ['booking'],
      });

      // Test not found error
      mockPaymentsRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findByBookingId(1)).rejects.toThrow(ResourceNotFoundException);

      // Test database error
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockRejectedValueOnce(error);
      await expect(service.findByBookingId(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('processRefund', () => {
    it('should handle all processRefund scenarios', async () => {
      const refundReason = 'Customer requested refund';

      // Test successful refund
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      mockPaymentsRepository.save.mockResolvedValueOnce({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
        refundReason,
      });
      const result = await service.processRefund(1, refundReason);
      expect(result).toEqual({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
        refundReason,
      });
      expect(paymentsRepository.findOne).toHaveBeenCalledWith({
        where: { paymentId: 1 },
        relations: ['booking'],
      });
      expect(paymentsRepository.save).toHaveBeenCalled();

      // Test not found error
      mockPaymentsRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.processRefund(1, refundReason)).rejects.toThrow(
        ResourceNotFoundException,
      );

      // Test database error
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      mockPaymentsRepository.save.mockRejectedValueOnce(error);
      await expect(service.processRefund(1, refundReason)).rejects.toThrow(DatabaseException);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should handle all updatePaymentStatus scenarios', async () => {
      // Test successful status update
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      mockPaymentsRepository.save.mockResolvedValueOnce({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });
      const result = await service.updatePaymentStatus(1, PaymentStatus.COMPLETED);
      expect(result).toEqual({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });
      expect(paymentsRepository.findOne).toHaveBeenCalledWith({
        where: { paymentId: 1 },
        relations: ['booking'],
      });
      expect(paymentsRepository.save).toHaveBeenCalled();

      // Test not found error
      mockPaymentsRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.updatePaymentStatus(1, PaymentStatus.COMPLETED)).rejects.toThrow(
        ResourceNotFoundException,
      );

      // Test database error
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockResolvedValueOnce(mockPayment);
      mockPaymentsRepository.save.mockRejectedValueOnce(error);
      await expect(service.updatePaymentStatus(1, PaymentStatus.COMPLETED)).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});

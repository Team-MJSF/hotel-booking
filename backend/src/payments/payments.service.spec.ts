import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod, Currency } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ResourceNotFoundException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
import { BookingsService } from '../bookings/bookings.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepository: Repository<Payment>;
  let bookingsRepository: Repository<Booking>;
  let bookingsService: BookingsService;

  const mockPaymentsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
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
    bookingsService = module.get<BookingsService>(BookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of payments', async () => {
      const expectedPayments = [mockPayment];
      mockPaymentsRepository.find.mockResolvedValue(expectedPayments);

      const result = await service.findAll();

      expect(result).toEqual(expectedPayments);
      expect(paymentsRepository.find).toHaveBeenCalledWith({
        relations: ['booking'],
      });
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockPaymentsRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(DatabaseException);
    });
  });

  describe('findOne', () => {
    it('should return a payment by id', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPayment);
      expect(paymentsRepository.findOne).toHaveBeenCalledWith({
        where: { paymentId: 1 },
        relations: ['booking'],
      });
    });

    it('should throw ResourceNotFoundException when payment not found', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('create', () => {
    const createPaymentDto: CreatePaymentDto = {
      bookingId: 1,
      amount: 200,
      currency: Currency.USD,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      transactionId: 'txn_123',
      status: PaymentStatus.PENDING,
    };

    it('should create a new payment', async () => {
      mockBookingsRepository.findOne.mockResolvedValue(mockBooking);
      mockPaymentsRepository.create.mockReturnValue(mockPayment);
      mockPaymentsRepository.save.mockResolvedValue(mockPayment);

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
    });

    it('should throw ResourceNotFoundException when booking not found', async () => {
      mockBookingsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createPaymentDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when payment already exists', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        payment: mockPayment,
      });

      await expect(service.create(createPaymentDto)).rejects.toThrow(DatabaseException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockBookingsRepository.findOne.mockResolvedValue(mockBooking);
      mockPaymentsRepository.create.mockReturnValue(mockPayment);
      mockPaymentsRepository.save.mockRejectedValue(error);

      await expect(service.create(createPaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    const updatePaymentDto: UpdatePaymentDto = {
      amount: 250,
      status: PaymentStatus.COMPLETED,
    };

    it('should update a payment', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);
      mockPaymentsRepository.merge.mockReturnValue({
        ...mockPayment,
        ...updatePaymentDto,
      });
      mockPaymentsRepository.save.mockResolvedValue({
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
    });

    it('should throw ResourceNotFoundException when payment not found', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updatePaymentDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw ResourceNotFoundException when new booking not found', async () => {
      const updateWithNewBooking = {
        ...updatePaymentDto,
        bookingId: 2,
      };

      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);
      mockBookingsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateWithNewBooking)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);
      mockPaymentsRepository.merge.mockReturnValue({
        ...mockPayment,
        ...updatePaymentDto,
      });
      mockPaymentsRepository.save.mockRejectedValue(error);

      await expect(service.update(1, updatePaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('remove', () => {
    it('should remove a payment', async () => {
      mockPaymentsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(paymentsRepository.delete).toHaveBeenCalledWith({ paymentId: 1 });
    });

    it('should throw ResourceNotFoundException when payment not found', async () => {
      mockPaymentsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockPaymentsRepository.delete.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('findByBookingId', () => {
    it('should return a payment by booking id', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.findByBookingId(1);

      expect(result).toEqual(mockPayment);
      expect(paymentsRepository.findOne).toHaveBeenCalledWith({
        where: { booking: { bookingId: 1 } },
        relations: ['booking'],
      });
    });

    it('should throw ResourceNotFoundException when payment not found', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(null);

      await expect(service.findByBookingId(1)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockRejectedValue(error);

      await expect(service.findByBookingId(1)).rejects.toThrow(DatabaseException);
    });
  });

  describe('processRefund', () => {
    const refundReason = 'Customer requested refund';

    it('should process a refund', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);
      mockPaymentsRepository.save.mockResolvedValue({
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
    });

    it('should throw ResourceNotFoundException when payment not found', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(null);

      await expect(service.processRefund(1, refundReason)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when repository fails', async () => {
      const error = new Error('Database error');
      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);
      mockPaymentsRepository.save.mockRejectedValue(error);

      await expect(service.processRefund(1, refundReason)).rejects.toThrow(DatabaseException);
    });
  });
}); 
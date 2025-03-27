import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { NotFoundException } from '@nestjs/common';
import { BookingStatus } from '../bookings/entities/booking.entity.js';
import { RoomType, AvailabilityStatus } from '../rooms/entities/room.entity.js';

// Increase timeout for all tests
jest.setTimeout(10000);

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const mockPaymentsService = {
    findAll: jest.fn(),
    findByBookingId: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    processRefund: jest.fn(),
    updatePaymentStatus: jest.fn(),
  };

  const mockPayment: Payment = {
    id: 1,
    bookingId: 1,
    booking: {
      bookingId: 1,
      userId: 1,
      roomId: 1,
      checkInDate: new Date('2024-03-20'),
      checkOutDate: new Date('2024-03-25'),
      numberOfGuests: 2,
      status: BookingStatus.PENDING,
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        bookings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    amount: 500.0,
    currency: 'USD',
    status: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    transactionId: 'txn_123456',
    refundReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('findOne', () => {
    it('should return a single payment', async () => {
      mockPaymentsService.findOne.mockResolvedValue(mockPayment);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when payment is not found', async () => {
      mockPaymentsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: 1,
        amount: 500.0,
        currency: 'USD',
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionId: 'txn_123456',
      };

      mockPaymentsService.create.mockResolvedValue(mockPayment);

      const result = await controller.create(createPaymentDto);

      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.create).toHaveBeenCalledWith(createPaymentDto);
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updatePaymentDto: UpdatePaymentDto = {
        status: PaymentStatus.COMPLETED,
      };

      const updatedPayment = { ...mockPayment, ...updatePaymentDto };
      mockPaymentsService.update.mockResolvedValue(updatedPayment);

      const result = await controller.update('1', updatePaymentDto);

      expect(result).toEqual(updatedPayment);
      expect(mockPaymentsService.update).toHaveBeenCalledWith(1, updatePaymentDto);
    });

    it('should throw NotFoundException when payment is not found', async () => {
      const updatePaymentDto: UpdatePaymentDto = {
        status: PaymentStatus.COMPLETED,
      };

      mockPaymentsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('999', updatePaymentDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a payment', async () => {
      mockPaymentsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockPaymentsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when payment is not found', async () => {
      mockPaymentsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processRefund', () => {
    it('should process a refund', async () => {
      const refundReason = 'Customer requested cancellation';
      const refundedPayment = {
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
        refundReason,
      };

      mockPaymentsService.processRefund.mockResolvedValue(refundedPayment);

      const result = await controller.processRefund('1', refundReason);

      expect(result).toEqual(refundedPayment);
      expect(mockPaymentsService.processRefund).toHaveBeenCalledWith(1, refundReason);
    });

    it('should throw NotFoundException when payment is not found', async () => {
      const refundReason = 'Customer requested cancellation';
      mockPaymentsService.processRefund.mockRejectedValue(new NotFoundException());

      await expect(controller.processRefund('999', refundReason)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const status = PaymentStatus.COMPLETED;
      const updatedPayment = { ...mockPayment, status };

      mockPaymentsService.updatePaymentStatus.mockResolvedValue(updatedPayment);

      const result = await controller.updatePaymentStatus('1', status);

      expect(result).toEqual(updatedPayment);
      expect(mockPaymentsService.updatePaymentStatus).toHaveBeenCalledWith(1, status);
    });

    it('should throw NotFoundException when payment is not found', async () => {
      const status = PaymentStatus.COMPLETED;
      mockPaymentsService.updatePaymentStatus.mockRejectedValue(new NotFoundException());

      await expect(controller.updatePaymentStatus('999', status)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

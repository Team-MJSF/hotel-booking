import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { ResourceNotFoundException, DatabaseException } from '../common/exceptions/hotel-booking.exception';
import { CreatePaymentDto } from './dto/create-payment.dto';

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
    processRefund: jest.fn(),
  };

  const mockPayment: Payment = {
    paymentId: 1,
    bookingId: 1,
    amount: 500,
    currency: 'USD',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    transactionId: 'txn_123',
    status: PaymentStatus.COMPLETED,
    refundReason: null,
    booking: null,
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
        amount: 500,
        currency: 'USD',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionId: 'tx_123',
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
        amount: 500,
        currency: 'USD',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionId: 'tx_123',
        status: PaymentStatus.PENDING,
      };

      const error = new DatabaseException('Failed to create payment', new Error('Database error'));
      mockPaymentsService.create.mockRejectedValue(error);

      await expect(controller.create(createPaymentDto)).rejects.toThrow(DatabaseException);
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updatePaymentDto: Partial<Payment> = {
        status: PaymentStatus.COMPLETED,
      };

      const updatedPayment = { ...mockPayment, ...updatePaymentDto };
      mockPaymentsService.update.mockResolvedValue(updatedPayment);

      const result = await controller.update('1', updatePaymentDto);

      expect(result).toEqual(updatedPayment);
      expect(mockPaymentsService.update).toHaveBeenCalledWith(1, updatePaymentDto);
    });

    it('should throw ResourceNotFoundException when payment is not found', async () => {
      const updatePaymentDto: Partial<Payment> = {
        status: PaymentStatus.COMPLETED,
      };

      mockPaymentsService.update.mockRejectedValue(new ResourceNotFoundException('Payment', 1));

      await expect(controller.update('1', updatePaymentDto)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const updatePaymentDto: Partial<Payment> = {
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

    it('should throw ResourceNotFoundException when payment is not found', async () => {
      const refundReason = 'Customer requested cancellation';
      mockPaymentsService.processRefund.mockRejectedValue(new ResourceNotFoundException('Payment', 1));

      await expect(controller.processRefund('1', refundReason)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw DatabaseException when service fails', async () => {
      const refundReason = 'Customer requested cancellation';
      const error = new DatabaseException('Failed to process refund', new Error('Database error'));
      mockPaymentsService.processRefund.mockRejectedValue(error);

      await expect(controller.processRefund('1', refundReason)).rejects.toThrow(DatabaseException);
    });
  });
});
